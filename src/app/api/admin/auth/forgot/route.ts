import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getAdminCredentials, saveAdminCredentials } from "@/lib/beats-store";
import { hashPassword, signResetToken, verifyResetToken } from "@/lib/admin-auth";
import { sendEmail, resetPasswordEmailHtml } from "@/lib/email";

// POST — send a recovery email to the one on-file admin address (no input needed;
// single-admin site, so there's nothing to "look up"). Always responds ok:true.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  if (!rateLimit(`forgot:${ip}`, 3, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const creds = await getAdminCredentials();
  if (creds.email) {
    const resetUrl = `${req.nextUrl.origin}/admin?resetToken=${signResetToken(creds.email, creds.passwordHash)}`;
    await sendEmail(creds.email, "Reset your LuchiBeats admin password", resetPasswordEmailHtml(creds.email, resetUrl));
  }

  return NextResponse.json({ ok: true });
}

// PUT — complete a reset with a valid token
export async function PUT(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  if (!rateLimit(`reset:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const { token, newPassword } = await req.json();
  if (typeof token !== "string" || typeof newPassword !== "string" || newPassword.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const creds = await getAdminCredentials();
  const email = creds.email ? verifyResetToken(token, creds.passwordHash) : null;
  if (!email || email !== creds.email) {
    return NextResponse.json({ error: "This reset link is invalid or has expired" }, { status: 401 });
  }

  await saveAdminCredentials({ email: creds.email, passwordHash: hashPassword(newPassword) });
  return NextResponse.json({ ok: true });
}

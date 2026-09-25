import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getAdminCredentials, saveAdminCredentials } from "@/lib/beats-store";
import { hashPassword, verifyPassword, signSession } from "@/lib/admin-auth";

function setSessionCookie(res: NextResponse, email: string) {
  res.cookies.set("admin_session", signSession(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

// GET — whether an admin account has been claimed yet (drives setup vs. login UI)
export async function GET() {
  const creds = await getAdminCredentials();
  return NextResponse.json({ hasCredentials: creds.email !== "" });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  if (!rateLimit(`auth:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const body = await req.json();
  const creds = await getAdminCredentials();

  // First-run account claim: requires the legacy Access Key, only while unclaimed.
  if (typeof body.setupKey === "string") {
    if (creds.email !== "") {
      return NextResponse.json({ error: "Account already set up" }, { status: 400 });
    }
    if (!process.env.ADMIN_PASSWORD || body.setupKey !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Wrong access key" }, { status: 401 });
    }
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!email || !email.includes("@") || password.length < 8) {
      return NextResponse.json({ error: "Enter a valid email and a password of at least 8 characters" }, { status: 400 });
    }
    await saveAdminCredentials({ email, passwordHash: hashPassword(password) });
    const res = NextResponse.json({ ok: true });
    setSessionCookie(res, email);
    return res;
  }

  // Normal login
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (creds.email === "" || email !== creds.email || !verifyPassword(password, creds.passwordHash)) {
    return NextResponse.json({ error: "Wrong email or password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, email);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("admin_session");
  return res;
}

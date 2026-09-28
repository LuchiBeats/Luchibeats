import { NextRequest, NextResponse } from "next/server";
import { getSubscribers, saveSubscribers } from "@/lib/beats-store";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail, promoEmailHtml } from "@/lib/email";
import { trackEvent, countryFrom } from "@/lib/analytics";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimit(`subscribe:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const { email } = await req.json();
  if (!email || !EMAIL_RE.test(String(email))) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const subs = await getSubscribers();
  if (subs.find((s) => s.email === normalizedEmail)) return NextResponse.json({ ok: true });

  subs.unshift({ id: `sub-${Date.now()}`, email: normalizedEmail, createdAt: new Date().toISOString() });
  await saveSubscribers(subs);

  await sendEmail(normalizedEmail, "Welcome to LuchiBeats 🔥", promoEmailHtml());

  await trackEvent({ type: "subscriber" }, countryFrom(req.headers.get("x-vercel-ip-country"))).catch(() => {});

  return NextResponse.json({ ok: true });
}

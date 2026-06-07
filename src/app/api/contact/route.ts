import { NextRequest, NextResponse } from "next/server";
import { getMessages, saveMessages } from "@/lib/beats-store";
import { rateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimit(`contact:${ip}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many messages. Try again later." }, { status: 429 });
  }

  const { name, email, subject, message } = await req.json();
  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (String(name).length > 100 || String(subject).length > 200 || String(message).length > 5000) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }

  const country = req.headers.get("x-vercel-ip-country") ?? "Unknown";
  const msgs = await getMessages();
  msgs.unshift({
    id: `msg-${Date.now()}`,
    name: String(name).trim(),
    email: String(email).trim(),
    subject: String(subject).trim(),
    message: String(message).trim(),
    createdAt: new Date().toISOString(),
    read: false,
  });
  await saveMessages(msgs);

  const origin = req.nextUrl.origin;

  fetch(`${origin}/api/analytics/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-vercel-ip-country": country },
    body: JSON.stringify({ type: "contact" }),
  }).catch(() => {});

  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    fetch(`${origin}/api/push/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "authorization": `Bearer ${process.env.ADMIN_PASSWORD}` },
      body: JSON.stringify({ title: "New Message on LuchiBeats", body: `${name}: ${subject}`, url: "/admin" }),
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}

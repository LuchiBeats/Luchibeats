import { NextRequest, NextResponse } from "next/server";
import { getMessages, saveMessages } from "@/lib/beats-store";
import { rateLimit } from "@/lib/rate-limit";
import { Resend } from "resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}

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

  // Forward message to admin email inbox
  if (process.env.RESEND_API_KEY && process.env.ADMIN_NOTIFY_EMAIL) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "LuchiBeats <onboarding@resend.dev>";
    resend.emails.send({
      from: fromEmail,
      to: process.env.ADMIN_NOTIFY_EMAIL,
      replyTo: `${name} <${email}>`,
      subject: `[LuchiBeats] ${subject}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f0f14;color:#e0e0e0;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(90deg,#A8892E,#C9A84C);padding:20px 28px;">
            <p style="margin:0;font-size:11px;letter-spacing:0.2em;color:#000;font-weight:700;">LUCHIBEATS · NEW MESSAGE</p>
          </div>
          <div style="padding:28px;">
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
              <tr><td style="padding:6px 0;font-size:12px;color:#888;width:80px;">From</td><td style="padding:6px 0;font-size:14px;font-weight:600;">${esc(String(name))}</td></tr>
              <tr><td style="padding:6px 0;font-size:12px;color:#888;">Email</td><td style="padding:6px 0;font-size:14px;"><a href="mailto:${esc(String(email))}" style="color:#C9A84C;">${esc(String(email))}</a></td></tr>
              <tr><td style="padding:6px 0;font-size:12px;color:#888;">Subject</td><td style="padding:6px 0;font-size:14px;">${esc(String(subject))}</td></tr>
            </table>
            <div style="background:#1a1a22;border-left:3px solid #C9A84C;border-radius:4px;padding:16px;margin-bottom:24px;">
              <p style="margin:0;font-size:14px;line-height:1.7;white-space:pre-wrap;">${esc(String(message))}</p>
            </div>
            <a href="mailto:${esc(String(email))}?subject=Re: ${encodeURIComponent(subject)}" style="display:inline-block;background:linear-gradient(90deg,#A8892E,#C9A84C);color:#000;font-weight:700;font-size:13px;padding:12px 24px;border-radius:8px;text-decoration:none;">↩ Reply to ${esc(String(name))}</a>
          </div>
          <div style="padding:16px 28px;border-top:1px solid #2a2a35;font-size:11px;color:#555;">Sent via luchibeats.com contact form</div>
        </div>
      `,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import {
  getSubscribers, saveSubscribers,
  getSettings, getBeats,
  getFreeBeatDeliveries, saveFreeBeatDeliveries,
} from "@/lib/beats-store";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail, freeBeatEmailHtml, promoEmailHtml } from "@/lib/email";

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

  const country = req.headers.get("x-vercel-ip-country") ?? "Unknown";
  const subId = `sub-${Date.now()}`;
  subs.unshift({ id: subId, email: normalizedEmail, createdAt: new Date().toISOString() });
  await saveSubscribers(subs);

  // Determine what to send
  const [settings, beats, deliveries] = await Promise.all([
    getSettings(),
    getBeats(),
    getFreeBeatDeliveries(),
  ]);

  const activeBeat = settings.freeBeatId
    ? beats.find((b) => b.id === settings.freeBeatId && b.isFree)
    : null;

  const alreadyReceivedThisBeat = activeBeat
    ? deliveries.some((d) => d.subscriberEmail === normalizedEmail && d.beatId === activeBeat.id)
    : false;

  const sendFreeBeat = activeBeat && !alreadyReceivedThisBeat;

  let emailSent = false;

  if (sendFreeBeat) {
    // Pick best download URL available on the beat
    const downloadUrl =
      activeBeat.mp3Url || activeBeat.wavUrl || activeBeat.audioUrl || `https://www.luchibeats.com/beats`;
    emailSent = await sendEmail(
      normalizedEmail,
      `Your free beat is ready — ${activeBeat.title}`,
      freeBeatEmailHtml(activeBeat.title, downloadUrl)
    );
    deliveries.unshift({
      id: `del-${Date.now()}`,
      subscriberEmail: normalizedEmail,
      subscriberId: subId,
      type: "beat",
      beatId: activeBeat.id,
      beatTitle: activeBeat.title,
      emailSent,
      deliveredAt: new Date().toISOString(),
    });
  } else {
    // No new free beat available — send welcome/promo email
    emailSent = await sendEmail(
      normalizedEmail,
      "Welcome to LuchiBeats 🔥",
      promoEmailHtml()
    );
    deliveries.unshift({
      id: `del-${Date.now()}`,
      subscriberEmail: normalizedEmail,
      subscriberId: subId,
      type: "promo",
      emailSent,
      deliveredAt: new Date().toISOString(),
    });
  }

  await saveFreeBeatDeliveries(deliveries);

  fetch(`${req.nextUrl.origin}/api/analytics/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-vercel-ip-country": country },
    body: JSON.stringify({ type: "subscriber" }),
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}

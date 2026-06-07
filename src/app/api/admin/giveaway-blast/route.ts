import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import {
  getSubscribers, getBeats,
  getFreeBeatDeliveries, saveFreeBeatDeliveries,
} from "@/lib/beats-store";
import { sendEmail, freeBeatEmailHtml, giveawayEmailHtml } from "@/lib/email";

export interface GiveawayBlastRequest {
  type: "beat" | "custom";
  beatId?: string;
  subject: string;
  badge?: string;
  headline?: string;
  body?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  audience: "all" | "new30" | "nobeat";
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload: GiveawayBlastRequest = await req.json();
  const { type, beatId, subject, badge, headline, body, ctaLabel, ctaUrl, audience } = payload;

  if (!subject?.trim()) {
    return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  }

  const [subscribers, beats, deliveries] = await Promise.all([
    getSubscribers(), getBeats(), getFreeBeatDeliveries(),
  ]);

  // Filter audience
  const now = Date.now();
  const cutoff30 = now - 30 * 24 * 60 * 60 * 1000;

  let targets = subscribers;
  if (audience === "new30") {
    targets = subscribers.filter(s => new Date(s.createdAt).getTime() >= cutoff30);
  } else if (audience === "nobeat" && beatId) {
    const alreadyReceived = new Set(
      deliveries.filter(d => d.beatId === beatId).map(d => d.subscriberEmail)
    );
    targets = subscribers.filter(s => !alreadyReceived.has(s.email));
  }

  if (targets.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0, skipped: subscribers.length });
  }

  // Resolve beat if type === "beat"
  let beat: Awaited<ReturnType<typeof getBeats>>[number] | null = null;
  if (type === "beat" && beatId) {
    beat = beats.find(b => b.id === beatId) ?? null;
  }

  let sent = 0;
  let failed = 0;
  const newDeliveries: Awaited<ReturnType<typeof getFreeBeatDeliveries>> = [];

  for (const sub of targets) {
    let html: string;
    let emailSubject = subject;

    if (type === "beat" && beat) {
      const downloadUrl = beat.mp3Url || beat.wavUrl || beat.audioUrl || `https://www.luchibeats.com/beats`;
      html = freeBeatEmailHtml(beat.title, downloadUrl);
    } else {
      html = giveawayEmailHtml({
        badge: badge || "Monthly Giveaway",
        headline: headline || subject,
        body: body || "",
        ctaLabel,
        ctaUrl,
      });
    }

    const ok = await sendEmail(sub.email, emailSubject, html);
    if (ok) sent++; else failed++;

    newDeliveries.push({
      id: `giveaway-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      subscriberEmail: sub.email,
      subscriberId: sub.id,
      type: type === "beat" ? "beat" : "promo",
      beatId: beat?.id,
      beatTitle: beat?.title,
      emailSent: ok,
      deliveredAt: new Date().toISOString(),
    });

    // Small delay to avoid Resend rate limits
    if (targets.length > 1) await new Promise(r => setTimeout(r, 80));
  }

  const updatedDeliveries = [...newDeliveries, ...deliveries];
  await saveFreeBeatDeliveries(updatedDeliveries);

  return NextResponse.json({ sent, failed, total: targets.length });
}

import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { getSubscribers } from "@/lib/beats-store";
import { sendEmail, giveawayEmailHtml } from "@/lib/email";

export interface GiveawayBlastRequest {
  subject: string;
  badge?: string;
  headline?: string;
  body?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  audience: "all" | "new30";
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload: GiveawayBlastRequest = await req.json();
  const { subject, badge, headline, body, ctaLabel, ctaUrl, audience } = payload;

  if (!subject?.trim()) {
    return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  }
  if (ctaUrl && /^javascript:/i.test(ctaUrl.trim())) {
    return NextResponse.json({ error: "Invalid CTA URL" }, { status: 400 });
  }

  const subscribers = await getSubscribers();

  const now = Date.now();
  const cutoff30 = now - 30 * 24 * 60 * 60 * 1000;
  const targets = audience === "new30"
    ? subscribers.filter(s => new Date(s.createdAt).getTime() >= cutoff30)
    : subscribers;

  if (targets.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0, skipped: subscribers.length });
  }

  const html = giveawayEmailHtml({
    badge: badge || "Monthly Giveaway",
    headline: headline || subject,
    body: body || "",
    ctaLabel,
    ctaUrl,
  });

  let sent = 0;
  let failed = 0;

  for (const sub of targets) {
    const ok = await sendEmail(sub.email, subject, html);
    if (ok) sent++; else failed++;

    // Small delay to avoid Resend rate limits
    if (targets.length > 1) await new Promise(r => setTimeout(r, 80));
  }

  return NextResponse.json({ sent, failed, total: targets.length });
}

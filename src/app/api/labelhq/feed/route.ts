import { NextRequest, NextResponse } from "next/server";
import { safeEqual } from "@/lib/admin-auth";
import { rateLimit } from "@/lib/rate-limit";
import { getBeats, getOrders, getMessages, getSubscribers, getAnalytics, getSoldArchive } from "@/lib/beats-store";
import { missingAgreements } from "@/lib/types";

// Read-only feed for the Label HQ desktop app. It polls this to keep Luchi's agents up to date.
// Auth: "Authorization: Bearer <LABELHQ_API_TOKEN>". File URLs (audio, stems, agreements) are never included.
export async function GET(req: NextRequest) {
  const token = process.env.LABELHQ_API_TOKEN;
  if (!token) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimit(`labelhq:${ip}`, 60, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ") || !safeEqual(auth.slice(7), token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [beats, orders, messages, subscribers, analytics, soldArchive] = await Promise.all([
    getBeats(), getOrders(), getMessages(), getSubscribers(), getAnalytics(), getSoldArchive(),
  ]);
  const now = Date.now();

  const beatTitle = new Map(beats.map((b) => [b.id, b.title]));
  const plays = Object.entries(analytics.beatPlays ?? {})
    .map(([id, count]) => ({ title: beatTitle.get(id) ?? id, plays: count }))
    .sort((a, b) => b.plays - a.plays)
    .slice(0, 20);

  const body = {
    generatedAt: new Date().toISOString(),
    beats: beats.map((b) => ({
      id: b.id,
      title: b.title,
      genre: b.genre,
      bpm: b.bpm,
      key: b.key,
      mood: b.mood,
      tags: b.tags,
      price: b.licenses.find((l) => l.name === "Exclusive")?.price ?? null,
      status: b.soldExclusive ? "sold"
        : b.hidden ? "hidden"
        : b.goLiveAt && new Date(b.goLiveAt).getTime() > now ? "scheduled"
        : missingAgreements(b).length ? "needs-agreement"
        : "live",
      goLiveAt: b.goLiveAt ?? null,
      files: { mp3: !!b.mp3Url, wav: !!b.wavUrl, stems: !!b.stemsUrl },
    })),
    orders: orders.map((o) => ({
      id: o.id,
      type: o.type,
      itemId: o.itemId ?? null,
      itemTitle: o.itemTitle,
      licenseType: o.licenseType ?? null,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      amount: o.amount,
      status: o.status,
      createdAt: o.createdAt,
    })),
    messages: messages
      .filter((m) => m.folder !== "trash")
      .map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        subject: m.subject,
        message: m.message,
        createdAt: m.createdAt,
        read: m.read,
        replied: !!m.replied,
      })),
    subscribers: {
      total: subscribers.length,
      recent: subscribers.slice(0, 50).map((s) => ({ id: s.id, email: s.email, createdAt: s.createdAt })),
    },
    analytics: {
      pageViews: analytics.pageViews,
      mobileViews: analytics.mobileViews,
      desktopViews: analytics.desktopViews,
      topBeats: plays,
      topCountries: Object.entries(analytics.countries ?? {})
        .map(([country, s]) => ({ country, ...s }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10),
    },
    soldExclusives: soldArchive.length,
  };

  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}

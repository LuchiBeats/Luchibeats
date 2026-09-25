import { NextRequest, NextResponse } from "next/server";
import { getAnalytics, saveAnalytics } from "@/lib/beats-store";
import { rateLimit } from "@/lib/rate-limit";

const MOBILE_RE = /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|webOS/i;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimit(`analytics:${ip}`, 60, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: true }); // silently drop to avoid leaking info
  }

  const { type, beatId } = await req.json();
  const country = req.headers.get("x-vercel-ip-country") ?? "Unknown";
  const ua = req.headers.get("user-agent") ?? "";
  const isMobile = MOBILE_RE.test(ua);

  const analytics = await getAnalytics();

  // Guard against old blobs saved before these fields existed
  if (!analytics.countries) analytics.countries = {};
  if (!analytics.beatPlays) analytics.beatPlays = {};
  if (!analytics.mobileViews) analytics.mobileViews = 0;
  if (!analytics.desktopViews) analytics.desktopViews = 0;
  if (!analytics.countries[country]) {
    analytics.countries[country] = { views: 0, contacts: 0, subscribers: 0 };
  }

  if (type === "pageview") {
    analytics.pageViews += 1;
    analytics.countries[country].views += 1;
    if (isMobile) analytics.mobileViews += 1;
    else analytics.desktopViews += 1;
  } else if (type === "beatplay" && beatId) {
    analytics.beatPlays[beatId] = (analytics.beatPlays[beatId] ?? 0) + 1;
  } else if (type === "contact") {
    analytics.countries[country].contacts += 1;
  } else if (type === "subscriber") {
    analytics.countries[country].subscribers += 1;
  }

  analytics.lastUpdated = new Date().toISOString();
  await saveAnalytics(analytics);
  return NextResponse.json({ ok: true });
}

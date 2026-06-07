import { NextRequest, NextResponse } from "next/server";
import { getAnalytics, saveAnalytics } from "@/lib/beats-store";

export async function POST(req: NextRequest) {
  const { type, beatId } = await req.json();
  const country = req.headers.get("x-vercel-ip-country") ?? "Unknown";

  const analytics = await getAnalytics();

  if (!analytics.countries[country]) {
    analytics.countries[country] = { views: 0, contacts: 0, subscribers: 0 };
  }

  if (type === "pageview") {
    analytics.pageViews += 1;
    analytics.countries[country].views += 1;
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

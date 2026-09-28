import { getAnalytics, saveAnalytics, getBeats } from "./beats-store";

const MOBILE_RE = /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|webOS/i;

export type AnalyticsEvent =
  | { type: "pageview"; userAgent: string }
  | { type: "beatplay"; beatId: string }
  | { type: "contact" }
  | { type: "subscriber" };

// Vercel sets this header to an ISO country code; anything else is bucketed as Unknown
export function countryFrom(header: string | null): string {
  return header && /^[A-Z]{2}$/.test(header) ? header : "Unknown";
}

export async function trackEvent(event: AnalyticsEvent, country: string): Promise<void> {
  // Only count plays of beats that exist, so the stats file can't be filled with made-up ids
  if (event.type === "beatplay" && !(await getBeats()).some((b) => b.id === event.beatId)) return;

  const analytics = await getAnalytics();

  // Guard against old blobs saved before these fields existed
  if (!analytics.countries) analytics.countries = {};
  if (!analytics.beatPlays) analytics.beatPlays = {};
  if (!analytics.mobileViews) analytics.mobileViews = 0;
  if (!analytics.desktopViews) analytics.desktopViews = 0;
  if (!analytics.countries[country]) {
    analytics.countries[country] = { views: 0, contacts: 0, subscribers: 0 };
  }

  if (event.type === "pageview") {
    analytics.pageViews += 1;
    analytics.countries[country].views += 1;
    if (MOBILE_RE.test(event.userAgent)) analytics.mobileViews += 1;
    else analytics.desktopViews += 1;
  } else if (event.type === "beatplay") {
    analytics.beatPlays[event.beatId] = (analytics.beatPlays[event.beatId] ?? 0) + 1;
  } else if (event.type === "contact") {
    analytics.countries[country].contacts += 1;
  } else {
    analytics.countries[country].subscribers += 1;
  }

  analytics.lastUpdated = new Date().toISOString();
  await saveAnalytics(analytics);
}

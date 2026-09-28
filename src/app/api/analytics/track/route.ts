import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { trackEvent, countryFrom } from "@/lib/analytics";

// Public beacon for page views and beat plays. Contact/subscriber counts are recorded server-side by those routes.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimit(`analytics:${ip}`, 60, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: true }); // silently drop to avoid leaking info
  }

  const { type, beatId } = await req.json().catch(() => ({}));
  const country = countryFrom(req.headers.get("x-vercel-ip-country"));

  if (type === "pageview") {
    await trackEvent({ type: "pageview", userAgent: req.headers.get("user-agent") ?? "" }, country);
  } else if (type === "beatplay" && typeof beatId === "string" && beatId.length <= 100) {
    await trackEvent({ type: "beatplay", beatId }, country);
  }
  return NextResponse.json({ ok: true });
}

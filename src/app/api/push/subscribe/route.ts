import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { getSettings, saveSettings } from "@/lib/beats-store";

const MAX_SUBSCRIPTIONS = 20;

// Push notifications carry admin alerts (contact form names/subjects), so only the admin can subscribe a device
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const sub = await req.json();
    const endpoint = String(sub?.endpoint ?? "");
    const p256dh = sub?.keys?.p256dh;
    const auth = sub?.keys?.auth;
    if (!endpoint.startsWith("https://") || endpoint.length > 1000 ||
        typeof p256dh !== "string" || typeof auth !== "string" || p256dh.length > 200 || auth.length > 100) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }
    const settings = await getSettings();
    if (!settings.pushSubscriptions.find((s) => s.endpoint === endpoint)) {
      settings.pushSubscriptions = [...settings.pushSubscriptions, { endpoint, keys: { p256dh, auth } }].slice(-MAX_SUBSCRIPTIONS);
      await saveSettings(settings);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

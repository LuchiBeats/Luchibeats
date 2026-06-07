import { NextRequest, NextResponse } from "next/server";
import { getSettings } from "@/lib/beats-store";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ ok: false, reason: "VAPID keys not configured" });
  }

  const { title, body, url } = await req.json();
  const webpush = (await import("web-push")).default;
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL ?? "luchibeats@outlook.com"}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );

  const settings = await getSettings();
  const payload = JSON.stringify({ title, body, url: url ?? "/" });
  let sent = 0;
  const failed: string[] = [];

  await Promise.allSettled(
    settings.pushSubscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys } as Parameters<typeof webpush.sendNotification>[0],
          payload,
        );
        sent++;
      } catch {
        failed.push(sub.endpoint);
      }
    })
  );

  return NextResponse.json({ ok: true, sent, total: settings.pushSubscriptions.length });
}

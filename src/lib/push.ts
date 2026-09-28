import { getSettings } from "./beats-store";

// Send a Web Push notification to every subscribed admin device. No-op until VAPID keys are configured.
export async function sendPush(msg: { title: string; body: string; url?: string }): Promise<{ sent: number; total: number }> {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return { sent: 0, total: 0 };

  const webpush = (await import("web-push")).default;
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL ?? "luchibeats@outlook.com"}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );

  const settings = await getSettings();
  const payload = JSON.stringify({ title: msg.title, body: msg.body, url: msg.url ?? "/" });
  let sent = 0;

  await Promise.allSettled(
    settings.pushSubscriptions.map(async (sub) => {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys } as Parameters<typeof webpush.sendNotification>[0],
        payload,
      );
      sent++;
    })
  );

  return { sent, total: settings.pushSubscriptions.length };
}

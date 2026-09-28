import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { sendPush } from "@/lib/push";

// Admin-only manual push. Server code (e.g. the contact form) calls sendPush() directly.
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ ok: false, reason: "VAPID keys not configured" });
  }

  const { title, body, url } = await req.json();
  const result = await sendPush({ title: String(title ?? ""), body: String(body ?? ""), url: typeof url === "string" ? url : "/" });
  return NextResponse.json({ ok: true, ...result });
}

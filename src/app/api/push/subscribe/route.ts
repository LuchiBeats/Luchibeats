import { NextRequest, NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/beats-store";

export async function POST(req: NextRequest) {
  try {
    const sub = await req.json();
    if (!sub?.endpoint) return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    const settings = await getSettings();
    if (!settings.pushSubscriptions.find((s) => s.endpoint === sub.endpoint)) {
      settings.pushSubscriptions.push({ endpoint: sub.endpoint, keys: sub.keys });
      await saveSettings(settings);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

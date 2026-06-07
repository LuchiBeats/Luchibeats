import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { getSettings, saveSettings } from "@/lib/beats-store";



export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getSettings();
  return NextResponse.json({
    freeBeatId: settings.freeBeatId,
    pushSubCount: settings.pushSubscriptions.length,
  });
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { freeBeatId } = await req.json();
  const settings = await getSettings();
  settings.freeBeatId = freeBeatId ?? undefined;
  await saveSettings(settings);
  return NextResponse.json({ ok: true });
}

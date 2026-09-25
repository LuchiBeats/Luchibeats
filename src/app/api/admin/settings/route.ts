import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { getSettings } from "@/lib/beats-store";

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getSettings();
  return NextResponse.json({
    pushSubCount: settings.pushSubscriptions.length,
  });
}

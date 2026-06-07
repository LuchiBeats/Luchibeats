import { NextResponse } from "next/server";
import { getBeats } from "@/lib/beats-store";

export async function GET() {
  const beats = await getBeats();
  const now = new Date();
  const live = beats.filter(
    (b) => !b.soldExclusive && !b.hidden && !b.isFree && (!b.goLiveAt || new Date(b.goLiveAt) <= now)
  );
  return NextResponse.json(live, {
    headers: { "Cache-Control": "no-store" },
  });
}

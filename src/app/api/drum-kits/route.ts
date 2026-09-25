import { NextResponse } from "next/server";
import { getDrumKits } from "@/lib/beats-store";

export async function GET() {
  const kits = await getDrumKits();
  // The kit download is only for buyers — never send it to the public store
  const live = kits.filter((k) => !k.hidden).map(({ downloadUrl, ...kit }) => kit);
  return NextResponse.json(live, {
    headers: { "Cache-Control": "no-store" },
  });
}

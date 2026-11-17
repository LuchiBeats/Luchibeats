import { NextResponse } from "next/server";
import { getLiveNowId } from "@/lib/youtube";

// Is Luchi live on YouTube right now? Used by the LIVE NOW badge in the menu.
// Re-checked at most every 2 minutes, shared by all visitors.
export const revalidate = 120;

export async function GET() {
  let id: string | null = null;
  try { id = await getLiveNowId(); } catch { /* YouTube unreachable: treat as offline */ }
  return NextResponse.json({ live: !!id }, { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60" } });
}

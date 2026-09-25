import { NextResponse } from "next/server";
import { getBeats } from "@/lib/beats-store";
import { missingAgreements } from "@/lib/types";

export async function GET() {
  const beats = await getBeats();
  const now = new Date();
  const live = beats
    .filter((b) => !b.soldExclusive && !b.hidden && (!b.goLiveAt || new Date(b.goLiveAt) <= now) && missingAgreements(b).length === 0)
    // Paid files and agreements are only for buyers — never send them to the public store
    .map(({ mp3Url, wavUrl, stemsUrl, ...beat }) => ({
      ...beat,
      licenses: beat.licenses.map(({ agreementUrl, ...license }) => license),
    }));
  return NextResponse.json(live, {
    headers: { "Cache-Control": "no-store" },
  });
}

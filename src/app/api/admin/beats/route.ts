import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { getBeats, saveBeats, getSoldArchive, saveSoldArchive } from "@/lib/beats-store";
import { missingAgreements, type Beat } from "@/lib/types";

// Only hidden drafts may be missing license agreements — nothing goes live without all three.
function agreementError(beat: Beat) {
  if (beat.hidden || beat.soldExclusive) return null;
  const missing = missingAgreements(beat);
  return missing.length
    ? NextResponse.json({ error: `Upload the ${missing.join(", ")} license agreement${missing.length > 1 ? "s" : ""} before this beat can go live.` }, { status: 400 })
    : null;
}

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getBeats());
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const beat: Beat = await req.json();
  const invalid = agreementError(beat);
  if (invalid) return invalid;
  const beats = await getBeats();
  beats.unshift(beat);
  await saveBeats(beats);
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const updated: Beat = await req.json();
  const invalid = agreementError(updated);
  if (invalid) return invalid;
  let beats = await getBeats();

  // Archive when manually toggling a beat to sold exclusive
  const prev = beats.find((b) => b.id === updated.id);
  if (prev && !prev.soldExclusive && updated.soldExclusive) {
    const archive = await getSoldArchive();
    archive.unshift({ beat: prev, soldAt: new Date().toISOString() });
    await saveSoldArchive(archive);
  }

  beats = beats.map((b) => (b.id === updated.id ? updated : b));
  await saveBeats(beats);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await saveBeats((await getBeats()).filter((b) => b.id !== id));
  return NextResponse.json({ ok: true });
}

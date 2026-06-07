import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { getBeats, saveBeats, getSoldArchive, saveSoldArchive } from "@/lib/beats-store";



export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getBeats());
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const beat = await req.json();
  const beats = await getBeats();
  beats.unshift(beat);
  await saveBeats(beats);
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const updated = await req.json();
  let beats = await getBeats();

  // Archive when manually toggling a beat to sold exclusive
  const prev = beats.find((b) => b.id === updated.id);
  if (prev && !prev.soldExclusive && updated.soldExclusive) {
    const archive = await getSoldArchive();
    archive.unshift({ beat: prev, soldAt: new Date().toISOString() });
    await saveSoldArchive(archive);
  }

  beats = beats.map((b) => (b.id === updated.id ? updated : b));
  // Only one beat can be the free beat
  if (updated.isFree) {
    beats = beats.map((b) => b.id === updated.id ? b : { ...b, isFree: false });
  }
  await saveBeats(beats);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await saveBeats((await getBeats()).filter((b) => b.id !== id));
  return NextResponse.json({ ok: true });
}

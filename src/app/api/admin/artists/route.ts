import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { getDynamicArtists, saveDynamicArtists } from "@/lib/beats-store";



export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getDynamicArtists());
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const artist = await req.json();
  const all = await getDynamicArtists();
  all.push({ ...artist, id: `artist-${Date.now()}` });
  await saveDynamicArtists(all);
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const updated = await req.json();
  const all = await getDynamicArtists();
  await saveDynamicArtists(all.map((a) => (a.id === updated.id ? updated : a)));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await saveDynamicArtists((await getDynamicArtists()).filter((a) => a.id !== id));
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { getDrumKits, saveDrumKits } from "@/lib/beats-store";
import type { DrumKit } from "@/lib/types";



export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getDrumKits());
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const kit: DrumKit = await req.json();
  const kits = await getDrumKits();
  kits.unshift(kit);
  await saveDrumKits(kits);
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const updated: DrumKit = await req.json();
  const kits = await getDrumKits();
  await saveDrumKits(kits.map((k) => (k.id === updated.id ? updated : k)));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await saveDrumKits((await getDrumKits()).filter((k) => k.id !== id));
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { getMessages, saveMessages } from "@/lib/beats-store";



export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const msgs = await getMessages();
  return NextResponse.json(msgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
}

const ALLOWED_PATCH_FIELDS = ["read", "starred", "replied", "folder"] as const;

export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...rawPatch } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const patch: Record<string, unknown> = {};
  for (const field of ALLOWED_PATCH_FIELDS) {
    if (field in rawPatch) patch[field] = rawPatch[field];
  }
  const msgs = await getMessages();
  await saveMessages(msgs.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await saveMessages((await getMessages()).filter((m) => m.id !== id));
  return NextResponse.json({ ok: true });
}

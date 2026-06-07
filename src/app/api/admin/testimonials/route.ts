import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { getTestimonials, saveTestimonials } from "@/lib/beats-store";



export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getTestimonials());
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const t = await req.json();
  const all = await getTestimonials();
  all.push({ ...t, id: `t-${Date.now()}` });
  await saveTestimonials(all);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await saveTestimonials((await getTestimonials()).filter((t) => t.id !== id));
  return NextResponse.json({ ok: true });
}

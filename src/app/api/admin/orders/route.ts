import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { getOrders, saveOrders, getBeats, saveBeats, getSoldArchive, saveSoldArchive } from "@/lib/beats-store";



export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getOrders());
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const orderId = `order-${Date.now()}`;
  const orders = await getOrders();
  orders.unshift({ ...body, id: orderId, createdAt: new Date().toISOString() });
  await saveOrders(orders);

  // Auto-mark beat as sold exclusive and archive it
  if (body.type === "beat" && body.itemId && body.licenseType?.toLowerCase().includes("exclusive")) {
    const beats = await getBeats();
    const beat = beats.find((b) => b.id === body.itemId);
    if (beat && !beat.soldExclusive) {
      await saveBeats(beats.map((b) => b.id === body.itemId ? { ...b, soldExclusive: true } : b));
      const archive = await getSoldArchive();
      archive.unshift({
        beat,
        soldAt: new Date().toISOString(),
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        orderId,
        amount: body.amount,
      });
      await saveSoldArchive(archive);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const updated = await req.json();
  const orders = await getOrders();
  await saveOrders(orders.map((o) => (o.id === updated.id ? updated : o)));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await saveOrders((await getOrders()).filter((o) => o.id !== id));
  return NextResponse.json({ ok: true });
}

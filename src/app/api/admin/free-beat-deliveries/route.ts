import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { getFreeBeatDeliveries } from "@/lib/beats-store";

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const deliveries = await getFreeBeatDeliveries();
  return NextResponse.json(
    deliveries.sort((a, b) => new Date(b.deliveredAt).getTime() - new Date(a.deliveredAt).getTime())
  );
}

import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { getSoldArchive } from "@/lib/beats-store";

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getSoldArchive());
}

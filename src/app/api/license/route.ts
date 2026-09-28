import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { generateLicense, type LicenseData } from "@/lib/license-templates";

// POST /api/license — admin-only: generate a license document for an order (Orders tab)
// Body: LicenseData
// Returns the license as a downloadable .txt file
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data: LicenseData = await req.json();

  if (!data.buyerName || !data.buyerEmail || !data.beatTitle || !data.licenseType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const text = generateLicense(data);
  const filename = `LuchiBeats_License_${String(data.beatTitle).replace(/[^a-zA-Z0-9]/g, "_")}_${String(data.licenseType).replace(/[^a-zA-Z0-9]/g, "_")}.txt`;

  return new NextResponse(text, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

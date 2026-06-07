import { NextRequest, NextResponse } from "next/server";
import { generateLicense, type LicenseData } from "@/lib/license-templates";

// POST /api/license — generate a license document
// Body: LicenseData
// Returns the license as a downloadable .txt file
export async function POST(req: NextRequest) {
  const data: LicenseData = await req.json();

  if (!data.buyerName || !data.buyerEmail || !data.beatTitle || !data.licenseType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const text = generateLicense(data);
  const filename = `LuchiBeats_License_${data.beatTitle.replace(/[^a-zA-Z0-9]/g, "_")}_${data.licenseType}.txt`;

  return new NextResponse(text, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

// GET /api/license?orderId=xxx — preview a license from an existing order
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const orderId = searchParams.get("orderId");
  if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

  // This will be wired to real order data once Stripe is connected.
  // For now, return the template fields needed.
  return NextResponse.json({
    message: "Pass order data to POST /api/license to generate the document.",
  });
}

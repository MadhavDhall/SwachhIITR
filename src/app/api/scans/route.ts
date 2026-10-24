import { NextResponse } from "next/server";
import { DEMO_WASTE_SCANS } from "@/data/seed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let scans = [...DEMO_WASTE_SCANS];
  if (status && status !== "all") {
    scans = scans.filter((s) => s.verificationStatus === status);
  }

  return NextResponse.json({
    scans,
    total: scans.length,
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const imageUrl = formData.get("imageUrl") as string | null;

    // Simulate AI detection output
    const simulatedScan = {
      id: `scan_${Date.now()}`,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
      thumbnailUrl: imageUrl || "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=200&q=80",
      detections: [
        { class: "Plastic", confidence: 0.94, boundingBox: { x: 15, y: 20, width: 35, height: 40 } },
        { class: "Plastic", confidence: 0.88, boundingBox: { x: 55, y: 30, width: 30, height: 45 } },
        { class: "Metal", confidence: 0.79, boundingBox: { x: 40, y: 65, width: 25, height: 25 } },
      ],
      classCounts: { Plastic: 2, Metal: 1 },
      totalObjects: 3,
      averageConfidence: 0.87,
      hasUncertainResults: false,
      verificationStatus: "pending",
      verifiedBy: null,
      verifiedAt: null,
      scannedBy: "WasteDNA Cloud Vision",
      notes: "Automated edge inference ingestion",
      createdAt: new Date().toISOString(),
      isSimulated: true,
    };

    return NextResponse.json({ scan: simulatedScan, success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Scan processing failed" }, { status: 400 });
  }
}

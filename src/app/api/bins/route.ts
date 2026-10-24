import { NextResponse } from "next/server";
import { DEMO_BINS } from "@/data/seed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const zone = searchParams.get("zone");
  const minFill = searchParams.get("min_fill");

  let result = [...DEMO_BINS];

  if (zone && zone !== "all") {
    result = result.filter((b) => b.zone === zone);
  }

  if (minFill) {
    const threshold = parseFloat(minFill);
    result = result.filter((b) => (b.currentFillPct ?? 0) >= threshold);
  }

  return NextResponse.json({
    bins: result,
    total: result.length,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newBin = {
      id: `bin_${Date.now()}`,
      label: body.label || `BIN-${Date.now().toString().slice(-4)}`,
      location: body.location || { lat: 19.076, lng: 72.8777 },
      address: body.address || "Unspecified Location",
      zone: body.zone || "Central Municipal",
      capacityLiters: body.capacityLiters || 240,
      sensorId: body.sensorId || `sns_${Date.now().toString().slice(-3)}`,
      status: "active",
      currentFillPct: 0,
      lastReadingAt: new Date().toISOString(),
      predictedOverflowAt: null,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ bin: newBin, success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

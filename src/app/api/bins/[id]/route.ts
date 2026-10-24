import { NextResponse } from "next/server";
import { DEMO_BINS, DEMO_SENSOR_READINGS } from "@/data/seed";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bin = DEMO_BINS.find((b) => b.id === id);

  if (!bin) {
    return NextResponse.json({ error: "Bin not found" }, { status: 404 });
  }

  const readings = DEMO_SENSOR_READINGS.filter((r) => r.binId === id);

  return NextResponse.json({
    bin,
    readings,
    historyCount: readings.length,
  });
}

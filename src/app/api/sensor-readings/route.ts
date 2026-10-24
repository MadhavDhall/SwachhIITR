import { NextResponse } from "next/server";
import { DEMO_SENSOR_READINGS } from "@/data/seed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const binId = searchParams.get("bin_id");

  let readings = [...DEMO_SENSOR_READINGS];
  if (binId) {
    readings = readings.filter((r) => r.binId === binId);
  }

  return NextResponse.json({
    readings,
    total: readings.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { binId, distanceCm, fillPct, batteryPct, rssi } = body;

    const newReading = {
      id: `rd_${Date.now()}`,
      binId: binId || "bin_001",
      timestamp: new Date().toISOString(),
      distanceCm: distanceCm ?? 25.0,
      fillPct: fillPct ?? 82.0,
      batteryPct: batteryPct ?? 92,
      rssi: rssi ?? -64,
      isSimulated: true,
    };

    return NextResponse.json({ reading: newReading, success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid sensor reading payload" }, { status: 400 });
  }
}

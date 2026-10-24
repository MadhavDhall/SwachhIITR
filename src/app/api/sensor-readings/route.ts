import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const binId = searchParams.get("bin_id");

  const result = await query<{
    id: string;
    bin_id: string;
    recorded_at: string;
    distance_cm: number;
    fill_pct: number;
    battery_pct: number | null;
    rssi: number | null;
    is_simulated: boolean;
  }>(
    `SELECT id, bin_id, recorded_at, distance_cm, fill_pct, battery_pct, rssi, is_simulated
     FROM sensor_readings ${binId ? "WHERE bin_id = $1" : ""}
     ORDER BY recorded_at DESC LIMIT 500`,
    binId ? [binId] : []
  );
  const readings = result.rows.map((r) => ({
    id: r.id,
    binId: r.bin_id,
    timestamp: r.recorded_at,
    distanceCm: Number(r.distance_cm),
    fillPct: Number(r.fill_pct),
    batteryPct: r.battery_pct === null ? null : Number(r.battery_pct),
    rssi: r.rssi,
    isSimulated: r.is_simulated,
  }));

  return NextResponse.json({
    readings,
    total: readings.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { binId, distanceCm, fillPct, batteryPct, rssi } = body;
    if (!binId || !Number.isFinite(Number(fillPct)) || !Number.isFinite(Number(distanceCm))) {
      return NextResponse.json({ error: "binId, distanceCm, and fillPct are required" }, { status: 400 });
    }
    const result = await query(
      `WITH reading AS (
        INSERT INTO sensor_readings
          (id, bin_id, sensor_id, recorded_at, distance_cm, fill_pct, battery_pct, rssi, is_simulated)
        SELECT $1, b.id, b.sensor_id, NOW(), $2, $3, $4, $5, TRUE
        FROM bins b WHERE b.id = $6
        RETURNING *
      )
      UPDATE bins b SET current_fill_pct = reading.fill_pct, last_reading_at = reading.recorded_at
      FROM reading WHERE b.id = reading.bin_id
      RETURNING reading.*`,
      [`reading_${crypto.randomUUID()}`, distanceCm, fillPct, batteryPct ?? null, rssi ?? null, binId]
    );
    if (!result.rowCount) {
      return NextResponse.json({ error: "Bin not found" }, { status: 404 });
    }
    const row = result.rows[0];
    const newReading = {
      id: row.id,
      binId: row.bin_id,
      timestamp: row.recorded_at,
      distanceCm: Number(row.distance_cm),
      fillPct: Number(row.fill_pct),
      batteryPct: row.battery_pct === null ? null : Number(row.battery_pct),
      rssi: row.rssi,
      isSimulated: true,
    };

    return NextResponse.json({ reading: newReading, success: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to save sensor reading", error);
    return NextResponse.json({ error: "Invalid sensor reading payload" }, { status: 400 });
  }
}

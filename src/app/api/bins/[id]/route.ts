import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const binResult = await query(
    `SELECT b.*, COALESCE(json_agg(
      json_build_object(
        'id', sr.id, 'binId', sr.bin_id, 'timestamp', sr.recorded_at,
        'distanceCm', sr.distance_cm, 'fillPct', sr.fill_pct,
        'batteryPct', sr.battery_pct, 'rssi', sr.rssi, 'isSimulated', sr.is_simulated
      ) ORDER BY sr.recorded_at DESC
    ) FILTER (WHERE sr.id IS NOT NULL), '[]') AS readings
     FROM bins b LEFT JOIN sensor_readings sr ON sr.bin_id = b.id
     WHERE b.id = $1 GROUP BY b.id`,
    [id]
  );
  if (!binResult.rowCount) {
    return NextResponse.json({ error: "Bin not found" }, { status: 404 });
  }
  const row = binResult.rows[0];
  const bin = {
    id: row.id,
    label: row.label,
    location: { lat: Number(row.latitude), lng: Number(row.longitude) },
    address: row.address,
    zone: row.zone,
    capacityLiters: row.capacity_liters,
    sensorId: row.sensor_id,
    status: row.status,
    currentFillPct: row.current_fill_pct === null ? null : Number(row.current_fill_pct),
    lastReadingAt: row.last_reading_at,
    predictedOverflowAt: row.predicted_overflow_at,
    createdAt: row.created_at,
  };
  const readings = row.readings;

  return NextResponse.json({
    bin,
    readings,
    historyCount: readings.length,
  });
}

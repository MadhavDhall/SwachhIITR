import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const zone = searchParams.get("zone");
  const minFill = searchParams.get("min_fill");

  const values: unknown[] = [];
  const filters: string[] = [];
  if (zone && zone !== "all") {
    values.push(zone);
    filters.push(`b.zone = $${values.length}`);
  }
  if (minFill) {
    const threshold = Number.parseFloat(minFill);
    if (Number.isFinite(threshold)) {
      values.push(threshold);
      filters.push(`COALESCE(b.current_fill_pct, 0) >= $${values.length}`);
    }
  }

  const result = await query<{
    id: string;
    label: string;
    address: string;
    zone: string;
    latitude: number;
    longitude: number;
    capacity_liters: number;
    sensor_id: string | null;
    status: string;
    current_fill_pct: number | null;
    last_reading_at: string | null;
    predicted_overflow_at: string | null;
    created_at: string;
  }>(
    `SELECT b.* FROM bins b ${filters.length ? `WHERE ${filters.join(" AND ")}` : ""}
     ORDER BY b.created_at DESC`,
    values
  );

  const bins = result.rows.map((b) => ({
    id: b.id,
    label: b.label,
    location: { lat: Number(b.latitude), lng: Number(b.longitude) },
    address: b.address,
    zone: b.zone,
    capacityLiters: b.capacity_liters,
    sensorId: b.sensor_id,
    status: b.status,
    currentFillPct: b.current_fill_pct === null ? null : Number(b.current_fill_pct),
    lastReadingAt: b.last_reading_at,
    predictedOverflowAt: b.predicted_overflow_at,
    createdAt: b.created_at,
  }));

  return NextResponse.json({
    bins,
    total: bins.length,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.label || !body.address || !body.zone) {
      return NextResponse.json({ error: "label, address, and zone are required" }, { status: 400 });
    }
    const id = `bin_${crypto.randomUUID()}`;
    const result = await query(
      `INSERT INTO bins
        (id, label, address, zone, latitude, longitude, capacity_liters, sensor_id, current_fill_pct)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0)
       RETURNING *`,
      [
        id,
        body.label,
        body.address,
        body.zone,
        body.location?.lat,
        body.location?.lng,
        body.capacityLiters ?? 240,
        body.sensorId ?? null,
      ]
    );

    return NextResponse.json({ bin: result.rows[0], success: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to create bin", error);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

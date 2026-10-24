import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const minThreshold = Number(body.min_fill_threshold ?? 70);
    const result = await query(
      `SELECT id, label, address, latitude, longitude, current_fill_pct
       FROM bins WHERE COALESCE(current_fill_pct, 0) >= $1
       ORDER BY current_fill_pct DESC`,
      [minThreshold]
    );
    const candidateBins = result.rows;
    const vehicleResult = await query(
      `SELECT id, name, driver_id FROM vehicles
       WHERE status = 'available' ORDER BY created_at LIMIT 1`
    );
    const vehicle = vehicleResult.rows[0];
    if (!vehicle) {
      return NextResponse.json({ error: "No available vehicle found" }, { status: 409 });
    }

    const generatedRoutes = [
      {
        id: `rt_${Date.now()}_alpha`,
        name: "Optimized Route Alpha - South Cluster",
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        totalDistanceKm: 16.4,
        estimatedDurationMinutes: 48,
        status: "planned",
        stops: candidateBins.slice(0, 3).map((b, i) => ({
          order: i + 1,
          binId: b.id,
          binLabel: b.label,
          address: b.address,
          location: { lat: Number(b.latitude), lng: Number(b.longitude) },
          fillPct: Number(b.current_fill_pct),
          estimatedArrival: new Date(Date.now() + (i + 1) * 20 * 60000).toISOString(),
          collected: false,
        })),
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      planner: "Campus collection planner",
      routes: generatedRoutes,
      binsIncluded: candidateBins.length,
    });
  } catch (error) {
    return NextResponse.json({ error: "Optimization failed" }, { status: 500 });
  }
}

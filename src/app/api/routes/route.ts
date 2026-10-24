import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";

export async function GET() {
  const result = await query(
    `SELECT r.id, r.name, r.vehicle_id, r.status, r.total_distance_km,
            r.estimated_duration_minutes, r.started_at, r.completed_at, r.created_at,
            v.name AS vehicle_name,
            COALESCE(json_agg(
              json_build_object(
                'order', rs.stop_order, 'binId', rs.bin_id, 'binLabel', b.label,
                'location', json_build_object('lat', b.latitude, 'lng', b.longitude),
                'address', b.address, 'fillPctAtDispatch', rs.fill_pct_at_dispatch,
                'estimatedArrival', rs.estimated_arrival, 'collected', rs.collected
              ) ORDER BY rs.stop_order
            ) FILTER (WHERE rs.id IS NOT NULL), '[]') AS stops
     FROM routes r
     LEFT JOIN vehicles v ON v.id = r.vehicle_id
     LEFT JOIN route_stops rs ON rs.route_id = r.id
     LEFT JOIN bins b ON b.id = rs.bin_id
     GROUP BY r.id, v.name
     ORDER BY r.created_at DESC`
  );
  const routes = result.rows.map((r) => ({
    id: r.id,
    name: r.name,
    vehicleId: r.vehicle_id,
    vehicleName: r.vehicle_name ?? "Unassigned",
    stops: r.stops,
    totalDistanceKm: Number(r.total_distance_km),
    estimatedDurationMinutes: r.estimated_duration_minutes,
    status: r.status,
    startedAt: r.started_at,
    completedAt: r.completed_at,
    createdAt: r.created_at,
  }));
  return NextResponse.json({
    routes,
    total: routes.length,
    activeRoutes: routes.filter((r) => r.status === "in_progress").length,
  });
}

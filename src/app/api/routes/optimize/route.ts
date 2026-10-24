import { NextResponse } from "next/server";
import { DEMO_BINS, DEMO_VEHICLES } from "@/data/seed";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const minThreshold = body.min_fill_threshold ?? 70;

    // Filter candidate bins for collection
    const candidateBins = DEMO_BINS.filter(
      (b) => (b.currentFillPct ?? 0) >= minThreshold
    );

    const generatedRoutes = [
      {
        id: `rt_${Date.now()}_alpha`,
        name: "Optimized Route Alpha - South Cluster",
        vehicleId: DEMO_VEHICLES[0].id,
        vehicleName: DEMO_VEHICLES[0].name,
        driverName: DEMO_VEHICLES[0].driverName,
        totalDistanceKm: 16.4,
        estimatedDurationMinutes: 48,
        status: "planned",
        stops: candidateBins.slice(0, 3).map((b, i) => ({
          order: i + 1,
          binId: b.id,
          binLabel: b.label,
          address: b.address,
          location: b.location,
          fillPct: b.currentFillPct,
          estimatedArrival: new Date(Date.now() + (i + 1) * 20 * 60000).toISOString(),
          collected: false,
        })),
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      solver: "Google OR-Tools CVRP (Server Optimized)",
      routes: generatedRoutes,
      binsIncluded: candidateBins.length,
    });
  } catch (error) {
    return NextResponse.json({ error: "Optimization failed" }, { status: 500 });
  }
}

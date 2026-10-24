import { NextResponse } from "next/server";
import { DEMO_ROUTES } from "@/data/seed";

export async function GET() {
  return NextResponse.json({
    routes: DEMO_ROUTES,
    total: DEMO_ROUTES.length,
    activeRoutes: DEMO_ROUTES.filter((r) => r.status === "in_progress").length,
  });
}

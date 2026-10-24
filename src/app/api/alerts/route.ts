import { NextResponse } from "next/server";
import { DEMO_ALERTS } from "@/data/seed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const unacknowledgedOnly = searchParams.get("unack") === "true";

  let alerts = [...DEMO_ALERTS];
  if (unacknowledgedOnly) {
    alerts = alerts.filter((a) => !a.acknowledged);
  }

  return NextResponse.json({
    alerts,
    total: alerts.length,
    unacknowledgedCount: alerts.filter((a) => !a.acknowledged).length,
  });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { alertId, acknowledgedBy } = body;

    return NextResponse.json({
      alertId,
      acknowledged: true,
      acknowledgedBy: acknowledgedBy || "Operator",
      acknowledgedAt: new Date().toISOString(),
      success: true,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to acknowledge alert" }, { status: 400 });
  }
}

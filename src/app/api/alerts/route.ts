import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const unacknowledgedOnly = searchParams.get("unack") === "true";

  const result = await query(
    `SELECT a.*, b.label AS bin_label
     FROM alerts a LEFT JOIN bins b ON b.id = a.bin_id
     ${unacknowledgedOnly ? "WHERE a.acknowledged = FALSE" : ""}
     ORDER BY a.created_at DESC LIMIT 500`
  );
  const alerts = result.rows.map((a) => ({
    id: a.id,
    type: a.type,
    severity: a.severity,
    binId: a.bin_id,
    binLabel: a.bin_label,
    message: a.message,
    acknowledged: a.acknowledged,
    acknowledgedBy: a.acknowledged_by,
    acknowledgedAt: a.acknowledged_at,
    createdAt: a.created_at,
  }));

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
    if (!alertId) {
      return NextResponse.json({ error: "alertId is required" }, { status: 400 });
    }

    const result = await query(
      `UPDATE alerts
       SET acknowledged = TRUE, acknowledged_by = $2, acknowledged_at = NOW()
       WHERE id = $1
       RETURNING id, acknowledged, acknowledged_by, acknowledged_at`,
      [alertId, acknowledgedBy ?? null]
    );
    if (!result.rowCount) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }
    return NextResponse.json({ alert: result.rows[0], success: true });
  } catch (error) {
    console.error("Failed to acknowledge alert", error);
    return NextResponse.json({ error: "Failed to acknowledge alert" }, { status: 400 });
  }
}

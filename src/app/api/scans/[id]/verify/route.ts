import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { verified, auditorName, notes } = body;

    const result = await query(
      `UPDATE waste_scans
       SET verification_status = $2, verified_by = $3, verified_at = NOW(), notes = COALESCE($4, notes)
       WHERE id = $1
       RETURNING id, verification_status, verified_by, verified_at, notes`,
      [id, verified ? "verified" : "rejected", auditorName ?? null, notes ?? null]
    );
    if (!result.rowCount) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }
    return NextResponse.json({ scan: result.rows[0], success: true });
  } catch (error) {
    console.error("Failed to verify scan", error);
    return NextResponse.json({ error: "Invalid verification request" }, { status: 400 });
  }
}

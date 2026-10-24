import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const result = await query(
    `SELECT ws.*, COALESCE(json_agg(
       json_build_object(
         'class', d.class_name, 'confidence', d.confidence,
         'boundingBox', json_build_object('x', d.box_x, 'y', d.box_y,
           'width', d.box_width, 'height', d.box_height)
       ) ORDER BY d.id
     ) FILTER (WHERE d.id IS NOT NULL), '[]') AS detections
     FROM waste_scans ws
     LEFT JOIN detections d ON d.scan_id = ws.id
     ${status && status !== "all" ? "WHERE ws.verification_status = $1" : ""}
     GROUP BY ws.id ORDER BY ws.created_at DESC LIMIT 500`,
    status && status !== "all" ? [status] : []
  );
  const scans = result.rows.map((s) => ({
    id: s.id,
    imageUrl: s.image_url,
    thumbnailUrl: s.thumbnail_url,
    detections: s.detections,
    classCounts: {},
    totalObjects: s.total_objects,
    averageConfidence: Number(s.average_confidence),
    hasUncertainResults: s.has_uncertain_results,
    verificationStatus: s.verification_status,
    verifiedBy: s.verified_by,
    verifiedAt: s.verified_at,
    scannedBy: s.scanned_by ?? "Operator",
    notes: s.notes,
    createdAt: s.created_at,
    isSimulated: s.is_simulated,
  }));

  return NextResponse.json({
    scans,
    total: scans.length,
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const imageUrl = formData.get("imageUrl") as string | null;

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required after upload" }, { status: 400 });
    }
    const result = await query(
      `INSERT INTO waste_scans
       (id, image_url, thumbnail_url, total_objects, average_confidence, notes, is_simulated)
       VALUES ($1, $2, $2, 0, 0, 'Awaiting inference', FALSE) RETURNING *`,
      [`scan_${crypto.randomUUID()}`, imageUrl]
    );
    return NextResponse.json({ scan: result.rows[0], success: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to save scan", error);
    return NextResponse.json({ error: "Scan processing failed" }, { status: 400 });
  }
}

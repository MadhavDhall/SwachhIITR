import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { verified, auditorName, notes } = body;

    return NextResponse.json({
      id,
      verificationStatus: verified ? "verified" : "rejected",
      verifiedBy: auditorName || "Auditor Lead",
      verifiedAt: new Date().toISOString(),
      notes: notes || "Auditor sign-off committed",
      success: true,
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid verification request" }, { status: 400 });
  }
}

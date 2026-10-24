import { connection, NextResponse } from "next/server";
import { query } from "@/lib/server/db";

export async function GET() {
  await connection();
  const checks = {
    database: false,
    cloudinary: Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    ),
  };

  try {
    await query("SELECT 1");
    checks.database = true;
  } catch {
    // Health response remains explicit through the database=false check.
  }

  const healthy = checks.database && checks.cloudinary;
  return NextResponse.json(
    { status: healthy ? "healthy" : "degraded", checks },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

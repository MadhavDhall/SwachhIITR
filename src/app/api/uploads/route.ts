import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/server/cloudinary";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "An image file is required" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, and WebP images are supported" },
        { status: 415 }
      );
    }
    if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "Image must be between 1 byte and 10 MB" },
        { status: 413 }
      );
    }

    const uploaded = await uploadImage(await file.arrayBuffer(), {
      filename: file.name,
      contentType: file.type,
    });

    return NextResponse.json({
      success: true,
      asset: {
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        width: uploaded.width,
        height: uploaded.height,
        bytes: uploaded.bytes,
        format: uploaded.format,
      },
    });
  } catch (error) {
    console.error("Cloudinary upload failed", error);
    const message =
      error instanceof Error && error.message.includes("Cloudinary is not configured")
        ? "Image storage is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to the Render web service."
        : error instanceof Error
          ? error.message
          : "Image upload failed";
    return NextResponse.json(
      { error: message },
      { status: message.startsWith("Image storage is not configured") ? 503 : 502 }
    );
  }
}

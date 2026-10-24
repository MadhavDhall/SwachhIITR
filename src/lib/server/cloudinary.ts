import { v2 as cloudinary } from "cloudinary";

let configured = false;

function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  if (!configured) {
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    configured = true;
  }

  return cloudinary;
}

export async function uploadImage(
  contents: ArrayBuffer,
  options: { filename: string; contentType: string }
) {
  const client = getCloudinary();
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "wasteos/scans";
  const buffer = Buffer.from(contents);

  return new Promise<{
    secure_url: string;
    public_id: string;
    width?: number;
    height?: number;
    bytes?: number;
    format?: string;
  }>((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        filename_override: options.filename,
        use_filename: false,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary returned no upload result"));
          return;
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

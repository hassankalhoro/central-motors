import { v2 as cloudinary } from "cloudinary";

/* The SDK auto-reads CLOUDINARY_URL (cloud name + api key + secret) from the
 * environment; we only force https delivery here. Keep all uploads server-side
 * so the api secret never reaches the browser. */
cloudinary.config({ secure: true });

export { cloudinary };

/** Default folder so all dealership media is grouped in the Cloudinary library. */
const FOLDER = "suzuki-central-motors";

export type UploadedImage = {
  url: string; // CDN https URL to store in the DB
  publicId: string; // stable id for later transforms/deletes
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
};

/**
 * Uploads an image/file to Cloudinary. `source` may be a local path, a remote
 * URL, a data URI, or a base64 string. Returns the CDN URL + metadata to persist.
 */
export async function uploadImage(
  source: string,
  opts: { folder?: string; publicId?: string } = {},
): Promise<UploadedImage> {
  const res = await cloudinary.uploader.upload(source, {
    folder: opts.folder ?? FOLDER,
    public_id: opts.publicId,
    resource_type: "auto", // images and PDFs/brochures alike
    overwrite: true,
  });
  return {
    url: res.secure_url,
    publicId: res.public_id,
    width: res.width,
    height: res.height,
    format: res.format,
    bytes: res.bytes,
  };
}

/** Removes an asset by its publicId (e.g. when deleting a product image). */
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

/**
 * Builds an optimized delivery URL: auto best format (WebP/AVIF) + auto quality,
 * optionally resized. Use this when rendering stored images.
 */
export function optimizedUrl(
  publicId: string,
  opts: { width?: number; height?: number; crop?: string } = {},
): string {
  return cloudinary.url(publicId, {
    fetch_format: "auto",
    quality: "auto",
    secure: true,
    ...(opts.width || opts.height
      ? { width: opts.width, height: opts.height, crop: opts.crop ?? "fill", gravity: "auto" }
      : {}),
  });
}

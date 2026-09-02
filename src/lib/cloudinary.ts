import "server-only";

import { v2 as cloudinary } from "cloudinary";
import type {
  TransformationOptions,
  UploadApiResponse,
} from "cloudinary/types";

import { env } from "@/lib/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const CLOUDINARY_DEFAULT_FOLDER = "lighthouse/blog";

/**
 * Cloudinary delivery transformations.
 * These are applied when serving images to the browser, not on upload.
 *
 * Note: We store already-optimized images, so these transformations
 * should primarily handle responsive delivery, not aggressive resizing.
 */
export const CLOUDINARY_TRANSFORMATIONS = {
  hero: [
    { width: 1200, crop: "limit" },
    { quality: "auto" },
    { fetch_format: "auto" },
  ],
  inline: [
    { width: 1200, crop: "limit" },
    { quality: "auto" },
    { fetch_format: "auto" },
  ],
  gallery: [
    { width: 800, crop: "limit" },
    { quality: "auto" },
    { fetch_format: "auto" },
  ],
  productDetail: [
    { width: 1200, crop: "limit" },
    { quality: "auto" },
    { fetch_format: "auto" },
  ],
  productThumbnail: [
    { width: 500, crop: "limit" },
    { quality: "auto" },
    { fetch_format: "auto" },
  ],
} as const;

// Deprecated: Use CLOUDINARY_TRANSFORMATIONS instead
export const HERO_IMAGE_TRANSFORMATION: TransformationOptions =
  CLOUDINARY_TRANSFORMATIONS.hero;

export type CloudinaryImage = {
  url: string;
  publicId: string;
  width: number;
  height: number;
};

export type CloudinaryUploadOptions = {
  folder?: string;
  transformation?: TransformationOptions;
};

export async function uploadImage(
  file: File,
  options: CloudinaryUploadOptions = {},
): Promise<CloudinaryImage> {
  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: options.folder ?? CLOUDINARY_DEFAULT_FOLDER,
          resource_type: "image",
          // Do NOT apply transformation on upload
          // Images are already optimized client-side
          transformation: undefined,
          upload_preset: undefined, // Use signed uploads with API key/secret
        },
        (error, callResult) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else if (callResult) {
            resolve(callResult);
          } else {
            reject(new Error("Upload returned no result."));
          }
        },
      )
      .end(buffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

/**
 * Generate an optimized Cloudinary URL with automatic format and quality.
 *
 * @param publicId - Cloudinary public ID
 * @param options - Transformation options
 * @returns Optimized image URL
 *
 * @example
 * ```typescript
 * const url = getOptimizedImageUrl(publicId, { width: 800, height: 600 });
 * // Returns URL with q_auto, f_auto, and responsive sizing
 * ```
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: "fill" | "limit" | "scale" | "fit";
    quality?: string;
    format?: string;
  } = {},
): string {
  const transformation: Array<{
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    fetch_format?: string;
  }> = [];

  // Apply dimensions if provided
  if (options.width || options.height) {
    transformation.push({
      width: options.width,
      height: options.height,
      crop: options.crop || "limit", // Default to limit to avoid unexpected cropping
    });
  }

  // Always apply automatic optimization
  transformation.push({
    quality: options.quality || "auto",
    fetch_format: options.format || "auto",
  });

  return cloudinary.url(publicId, {
    transformation,
    secure: true,
  });
}

export function extractPublicId(url: string): string | null {
  const marker = "/image/upload/";
  const start = url.indexOf(marker);
  if (start === -1) return null;
  const path = url.slice(start + marker.length);
  const withoutVersion = path.replace(/^v\d+\//, "");
  const withoutExtension = withoutVersion.replace(/\.[a-z0-9]+$/i, "");
  return withoutExtension || null;
}

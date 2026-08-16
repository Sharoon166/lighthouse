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

export const HERO_IMAGE_TRANSFORMATION: TransformationOptions = [
  { width: 1600, crop: "limit" },
];

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
          transformation: options.transformation,
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

export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    format?: string;
    quality?: string;
  } = {},
): string {
  return cloudinary.url(publicId, {
    fetch_format: options.format ?? "auto",
    quality: options.quality ?? "auto",
    width: options.width,
    height: options.height,
    crop: options.width || options.height ? "fill" : undefined,
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

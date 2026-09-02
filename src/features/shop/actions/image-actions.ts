"use server";

import {
  CLOUDINARY_DEFAULT_FOLDER,
  deleteImage,
  uploadImage,
} from "@/lib/cloudinary";

const SHOP_FOLDER = `${CLOUDINARY_DEFAULT_FOLDER}/shop`;

export type UploadShopImageResult =
  | { ok: true; image: { url: string; publicId: string } }
  | { ok: false; message: string };

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export async function uploadShopImage(
  formData: FormData,
): Promise<UploadShopImageResult> {
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { ok: false, message: "No image was provided." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, message: "Only image files are allowed." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      message: "Images must be 10 MB or smaller. Choose a smaller file.",
    };
  }

  const previousPublicId = formData.get("previousPublicId");
  const previousId =
    typeof previousPublicId === "string" && previousPublicId.trim()
      ? previousPublicId.trim()
      : null;

  try {
    const uploaded = await uploadImage(file, {
      folder: SHOP_FOLDER,
    });

    if (previousId) {
      await deleteImage(previousId).catch((error) => {
        console.error("Failed to delete previous image:", error);
      });
    }

    return {
      ok: true,
      image: { url: uploaded.url, publicId: uploaded.publicId },
    };
  } catch (error) {
    console.error("Failed to upload shop image:", error);
    return {
      ok: false,
      message: "Upload failed. Please try again in a moment.",
    };
  }
}

export async function deleteShopImage(
  publicId: string,
): Promise<{ ok: boolean }> {
  try {
    await deleteImage(publicId);
    return { ok: true };
  } catch (error) {
    console.error("Failed to delete shop image:", error);
    return { ok: false };
  }
}

/**
 * Production-quality client-side image optimization utility.
 *
 * This module provides reusable image optimization for all upload paths
 * in the application (blog, projects, gallery, future products module).
 *
 * Key features:
 * - Automatic dimension resizing without upscaling
 * - Transparency preservation
 * - Quality-based compression
 * - Format-aware processing (JPEG vs PNG/WebP)
 * - Resource cleanup
 * - Comprehensive error handling
 */

export interface OptimizationConfig {
  maxWidth: number;
  maxHeight: number;
  quality: number;
}

export const IMAGE_OPTIMIZATION_PRESETS = {
  blogHero: {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.87,
  },
  blogInline: {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 0.83,
  },
  gallery: {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.82,
  },
  projectHero: {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.87,
  },
  product: {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 0.85,
  },
  productThumbnail: {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.82,
  },
} as const;

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

/**
 * Detects if an image has transparency by checking the file type.
 * More sophisticated detection would require pixel analysis but this
 * is sufficient for most use cases.
 */
function hasTransparency(file: File | Blob): boolean {
  return file.type === "image/png" || file.type === "image/webp";
}

/**
 * Calculate optimal output dimensions that:
 * - Never exceed maxWidth or maxHeight
 * - Preserve original aspect ratio
 * - Never upscale (return original dimensions if smaller)
 */
function calculateOutputDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  // Don't upscale
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return { width: originalWidth, height: originalHeight };
  }

  // Calculate scale factor to fit within bounds
  const widthScale = maxWidth / originalWidth;
  const heightScale = maxHeight / originalHeight;
  const scale = Math.min(widthScale, heightScale);

  return {
    width: Math.round(originalWidth * scale),
    height: Math.round(originalHeight * scale),
  };
}

/**
 * Optimize an image for upload.
 *
 * @param source - File or Blob to optimize
 * @param config - Optimization configuration
 * @returns Optimized blob
 * @throws Error if optimization fails
 *
 * @example
 * ```typescript
 * const file = await optimizeImage(
 *   userSelectedFile,
 *   IMAGE_OPTIMIZATION_PRESETS.blogHero
 * );
 * // Upload optimizedFile to Cloudinary
 * ```
 */
export async function optimizeImage(
  source: File | Blob,
  config: OptimizationConfig,
): Promise<Blob> {
  // Validation
  if (!source.type.startsWith("image/")) {
    throw new Error("Source must be an image file");
  }

  if (source.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `Image file size (${(source.size / 1024 / 1024).toFixed(1)} MB) exceeds maximum allowed (50 MB)`,
    );
  }

  if (config.quality < 0 || config.quality > 1) {
    throw new Error("Quality must be between 0 and 1");
  }

  let bitmap: ImageBitmap | null = null;

  try {
    // Decode image
    bitmap = await createImageBitmap(source, {
      imageOrientation: "from-image",
    });

    const originalWidth = bitmap.width;
    const originalHeight = bitmap.height;

    // Calculate output dimensions
    const { width: outputWidth, height: outputHeight } =
      calculateOutputDimensions(
        originalWidth,
        originalHeight,
        config.maxWidth,
        config.maxHeight,
      );

    // Create canvas with output dimensions
    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D rendering context");
    }

    // Enable high-quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Draw the resized image
    ctx.drawImage(bitmap, 0, 0, outputWidth, outputHeight);

    // Determine output format
    const preserveTransparency = hasTransparency(source);
    const outputType = preserveTransparency ? "image/png" : "image/jpeg";

    // Convert to blob
    const optimizedBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        },
        outputType,
        config.quality,
      );
    });

    // Don't return a "optimized" blob that's larger than the original
    // This can happen with small, already-optimized images
    if (optimizedBlob.size > source.size) {
      console.info(
        `Optimization increased file size (${source.size} → ${optimizedBlob.size}), returning original`,
      );
      return source;
    }

    return optimizedBlob;
  } catch (error) {
    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`Image optimization failed: ${error.message}`);
    }
    throw new Error("Image optimization failed with unknown error");
  } finally {
    // Cleanup resources
    if (bitmap) {
      bitmap.close();
    }
  }
}

/**
 * Convenience function to optimize and convert to File.
 * Useful when the upload API expects a File object.
 */
export async function optimizeImageToFile(
  source: File,
  config: OptimizationConfig,
  filename?: string,
): Promise<File> {
  const optimizedBlob = await optimizeImage(source, config);

  // Preserve original filename by default
  const outputFilename = filename || source.name;

  // Determine MIME type from blob
  const mimeType = optimizedBlob.type;

  return new File([optimizedBlob], outputFilename, { type: mimeType });
}

import { scaleNearest } from "./nearestNeighbor";
import { TILE_BASE_W, TILE_BASE_H } from "../constants/collage";

/**
 * Normalize a PNG tile to exactly 24x24 pixels
 * Handles both 24x24 and 25x25 source images
 * Uses nearest-neighbor scaling (no smoothing)
 * 
 * @param src Source image (HTMLImageElement or ImageBitmap)
 * @returns ImageData normalized to 24x24
 */
export async function normalizePngTo24x24(
  src: HTMLImageElement | ImageBitmap
): Promise<ImageData> {
  const srcWidth = src.width;
  const srcHeight = src.height;

  // Create offscreen canvas
  const canvas = new OffscreenCanvas(srcWidth, srcHeight);
  const ctx = canvas.getContext("2d", { alpha: true });

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Disable image smoothing for pixel-perfect rendering
  ctx.imageSmoothingEnabled = false;

  // Draw source image
  ctx.drawImage(src, 0, 0);

  // Get image data
  let imageData = ctx.getImageData(0, 0, srcWidth, srcHeight);

  // If already 24x24, return as-is
  if (srcWidth === TILE_BASE_W && srcHeight === TILE_BASE_H) {
    return imageData;
  }

  // If 25x25, scale down to 24x24 using nearest-neighbor
  if (srcWidth === 25 && srcHeight === 25) {
    // Manual nearest-neighbor downscale from 25x25 to 24x24
    const destData = new Uint8ClampedArray(TILE_BASE_W * TILE_BASE_H * 4);
    const srcData = imageData.data;

    for (let destY = 0; destY < TILE_BASE_H; destY++) {
      for (let destX = 0; destX < TILE_BASE_W; destX++) {
        // Map to source coordinates
        const srcX = Math.floor((destX * 25) / 24);
        const srcY = Math.floor((destY * 25) / 24);

        const srcIndex = (srcY * 25 + srcX) * 4;
        const destIndex = (destY * TILE_BASE_W + destX) * 4;

        destData[destIndex] = srcData[srcIndex];
        destData[destIndex + 1] = srcData[srcIndex + 1];
        destData[destIndex + 2] = srcData[srcIndex + 2];
        destData[destIndex + 3] = srcData[srcIndex + 3];
      }
    }

    return new ImageData(destData, TILE_BASE_W, TILE_BASE_H);
  }

  // For other sizes, scale to 24x24
  if (srcWidth !== TILE_BASE_W || srcHeight !== TILE_BASE_H) {
    // Calculate scale factor
    const scaleX = TILE_BASE_W / srcWidth;
    const scaleY = TILE_BASE_H / srcHeight;

    // Create scaled canvas
    const scaledCanvas = new OffscreenCanvas(TILE_BASE_W, TILE_BASE_H);
    const scaledCtx = scaledCanvas.getContext("2d", { alpha: true });

    if (!scaledCtx) {
      throw new Error("Failed to get scaled canvas context");
    }

    scaledCtx.imageSmoothingEnabled = false;
    scaledCtx.scale(scaleX, scaleY);
    scaledCtx.drawImage(src, 0, 0);

    imageData = scaledCtx.getImageData(0, 0, TILE_BASE_W, TILE_BASE_H);
  }

  return imageData;
}


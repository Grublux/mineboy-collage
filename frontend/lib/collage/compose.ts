import * as IQ from "image-q";
// @ts-ignore - upng-js doesn't have types
import * as UPNG from "upng-js";
import { scaleNearest } from "./nearestNeighbor";
import { TILE_BASE_W, TILE_BASE_H } from "../constants/collage";

/**
 * Compose a grid of tiles into a single ImageData
 * @param tiles Array of normalized 24x24 ImageData tiles
 * @param rows Number of rows in the grid
 * @param cols Number of columns in the grid
 * @returns Composed ImageData (width = cols * 24, height = rows * 24)
 */
export async function composeGrid(
  tiles: ImageData[],
  rows: number,
  cols: number
): Promise<ImageData> {
  const canvasWidth = cols * TILE_BASE_W;
  const canvasHeight = rows * TILE_BASE_H;

  // Create canvas
  const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d", { alpha: true });

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Disable image smoothing
  ctx.imageSmoothingEnabled = false;

  // Draw each tile in row-major order
  for (let i = 0; i < Math.min(tiles.length, rows * cols); i++) {
    const tile = tiles[i];
    const row = Math.floor(i / cols);
    const col = i % cols;

    const x = col * TILE_BASE_W;
    const y = row * TILE_BASE_H;

    // Create temporary canvas for this tile
    const tempCanvas = new OffscreenCanvas(TILE_BASE_W, TILE_BASE_H);
    const tempCtx = tempCanvas.getContext("2d", { alpha: true });

    if (tempCtx) {
      tempCtx.putImageData(tile, 0, 0);
      ctx.drawImage(tempCanvas, x, y);
    }
  }

  // Get final composed image data
  return ctx.getImageData(0, 0, canvasWidth, canvasHeight);
}

/**
 * Upscale and encode ImageData to PNG with quantization
 * @param base Base ImageData (e.g., 144x144 for 6x6 grid of 24x24 tiles)
 * @param target Target size (e.g., 432 or 576)
 * @param paletteSize Number of colors in palette (default 32)
 * @returns PNG bytes as Uint8Array
 */
export async function upscaleAndEncodePNG(
  base: ImageData,
  target: number,
  paletteSize: number = 32
): Promise<Uint8Array> {
  // Calculate integer scale factor
  const scale = Math.round(target / base.width);

  // Upscale using nearest-neighbor
  const upscaled = scaleNearest(base, scale);

  // Convert ImageData to image-q PointContainer
  const pointContainer = IQ.utils.PointContainer.fromUint8Array(
    upscaled.data,
    upscaled.width,
    upscaled.height
  );

  // Build palette with specified size
  const palette = await IQ.buildPalette([pointContainer], {
    colors: paletteSize,
    colorDistanceFormula: "euclidean",
  });

  // Apply palette (no dithering)
  const outPointContainer = await IQ.applyPalette(pointContainer, palette, {
    colorDistanceFormula: "euclidean",
    imageQuantization: "nearest",
  });

  // Get quantized image data
  const quantizedData = outPointContainer.toUint8Array();

  // Encode to PNG using UPNG
  const pngBuffer = UPNG.encode(
    [quantizedData.buffer],
    upscaled.width,
    upscaled.height,
    0 // 0 = lossless, full color depth
  );

  return new Uint8Array(pngBuffer);
}

/**
 * Helper to load an image from a URL
 */
export async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}


import { upscaleAndEncodePNG } from "./compose";
import { SNAPSHOT_TARGET, SNAPSHOT_ALT, SNAPSHOT_MAX_BYTES } from "../constants/collage";

/**
 * Ensure PNG bytes are under the size cap
 * Retries with different strategies if over cap
 * 
 * @param bytes Initial PNG bytes
 * @param baseImageData Base ImageData to re-encode if needed
 * @param currentTarget Current target size (432 or 576)
 * @param cap Maximum allowed bytes (default 180,000)
 * @returns PNG bytes guaranteed to be under cap
 */
export async function ensureUnderCap(
  bytes: Uint8Array,
  baseImageData: ImageData,
  currentTarget: number,
  cap: number = SNAPSHOT_MAX_BYTES
): Promise<Uint8Array> {
  // If already under cap, return as-is
  if (bytes.length <= cap) {
    return bytes;
  }

  console.warn(`PNG size ${bytes.length} exceeds cap ${cap}, attempting reduction...`);

  // Strategy 1: If using 576px, try 432px
  if (currentTarget === SNAPSHOT_ALT) {
    console.log("Retrying with 432px target...");
    const newBytes = await upscaleAndEncodePNG(baseImageData, SNAPSHOT_TARGET, 32);
    if (newBytes.length <= cap) {
      return newBytes;
    }
    // Continue to palette reduction if still too large
    bytes = newBytes;
  }

  // Strategy 2: Reduce palette size
  const paletteSizes = [24, 16, 12, 8];
  const targetSize = currentTarget === SNAPSHOT_ALT ? SNAPSHOT_TARGET : currentTarget;

  for (const paletteSize of paletteSizes) {
    console.log(`Retrying with ${paletteSize} color palette...`);
    const newBytes = await upscaleAndEncodePNG(baseImageData, targetSize, paletteSize);
    
    if (newBytes.length <= cap) {
      console.log(`Success with ${paletteSize} colors: ${newBytes.length} bytes`);
      return newBytes;
    }
    
    bytes = newBytes;
  }

  // If all strategies fail, throw error
  throw new Error(
    `Unable to compress PNG under ${cap} bytes. Final size: ${bytes.length} bytes. ` +
    `Try reducing the number of unique tiles or grid size.`
  );
}

/**
 * Quick check if bytes are under cap without retry logic
 */
export function isUnderCap(bytes: Uint8Array, cap: number = SNAPSHOT_MAX_BYTES): boolean {
  return bytes.length <= cap;
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}


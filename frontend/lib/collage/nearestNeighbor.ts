/**
 * Scale ImageData using nearest-neighbor algorithm (no smoothing)
 * @param srcImageData Source ImageData to scale
 * @param scale Integer scale factor (e.g., 2 for 2x, 3 for 3x)
 * @returns Scaled ImageData
 */
export function scaleNearest(srcImageData: ImageData, scale: number): ImageData {
  const { width: srcWidth, height: srcHeight, data: srcData } = srcImageData;
  
  // Ensure integer scale
  const intScale = Math.round(scale);
  
  const destWidth = srcWidth * intScale;
  const destHeight = srcHeight * intScale;
  
  // Create destination ImageData
  const destData = new Uint8ClampedArray(destWidth * destHeight * 4);
  
  // Nearest-neighbor scaling
  for (let destY = 0; destY < destHeight; destY++) {
    for (let destX = 0; destX < destWidth; destX++) {
      // Map destination pixel to source pixel (integer division)
      const srcX = Math.floor(destX / intScale);
      const srcY = Math.floor(destY / intScale);
      
      // Source pixel index
      const srcIndex = (srcY * srcWidth + srcX) * 4;
      
      // Destination pixel index
      const destIndex = (destY * destWidth + destX) * 4;
      
      // Copy RGBA values
      destData[destIndex] = srcData[srcIndex];         // R
      destData[destIndex + 1] = srcData[srcIndex + 1]; // G
      destData[destIndex + 2] = srcData[srcIndex + 2]; // B
      destData[destIndex + 3] = srcData[srcIndex + 3]; // A
    }
  }
  
  return new ImageData(destData, destWidth, destHeight);
}


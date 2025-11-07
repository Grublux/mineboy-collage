/**
 * NFT.Storage integration for uploading PNG snapshots to IPFS
 */

export async function uploadPngToNftStorage(
  pngBytes: Uint8Array,
  apiKey: string
): Promise<string> {
  // Create a new Uint8Array to ensure we have a proper ArrayBuffer
  const bytes = new Uint8Array(pngBytes);
  const response = await fetch("https://api.nft.storage/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "image/png",
    },
    body: new Blob([bytes], { type: "image/png" }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`NFT.Storage upload failed: ${error}`);
  }

  const data = await response.json();
  // Return CID string (e.g., "bafy...")
  return data.value.cid;
}

/**
 * Convert CID string to bytes for contract calls
 */
export function cidToBytes(cid: string): Uint8Array {
  // Simple conversion - in production, you might want to use a CID library
  return new TextEncoder().encode(cid);
}


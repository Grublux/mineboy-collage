import { useState, useEffect } from "react";

interface TokenMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

/**
 * Decode tokenURI data URI (base64 JSON) and extract metadata
 * @param tokenURI data:application/json;base64,... URI
 * @returns Parsed metadata object
 */
export function decodeTokenURI(tokenURI: string): TokenMetadata | null {
  if (!tokenURI || !tokenURI.startsWith("data:application/json;base64,")) {
    return null;
  }

  try {
    const base64Data = tokenURI.replace("data:application/json;base64,", "");
    const jsonString = atob(base64Data);
    const metadata = JSON.parse(jsonString);
    return metadata;
  } catch (err) {
    console.error("Error decoding tokenURI:", err);
    return null;
  }
}

/**
 * Hook to decode tokenURI and extract metadata
 */
export function useTokenMetadata(tokenURI?: string) {
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenURI) {
      setMetadata(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const decoded = decodeTokenURI(tokenURI);
      setMetadata(decoded);
    } catch (err: any) {
      setError(err.message || "Failed to decode tokenURI");
      setMetadata(null);
    } finally {
      setLoading(false);
    }
  }, [tokenURI]);

  return { metadata, loading, error };
}


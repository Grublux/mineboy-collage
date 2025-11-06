"use client";

import { useState, useEffect } from "react";
import { normalizePngTo24x24 } from "@/frontend/lib/collage/normalizeTile";
import { composeGrid, upscaleAndEncodePNG } from "@/frontend/lib/collage/compose";
import { ensureUnderCap, formatBytes } from "@/frontend/lib/collage/sizeGuard";
import { useSetSnapshot } from "@/frontend/hooks/useCollageStaker";
import { SNAPSHOT_TARGET, SNAPSHOT_ALT } from "@/frontend/lib/constants/collage";

interface SnapshotDialogProps {
  collageId: bigint;
  tiles: (HTMLImageElement | ImageBitmap)[];
  rows: number;
  cols: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SnapshotDialog({
  collageId,
  tiles,
  rows,
  cols,
  onClose,
  onSuccess,
}: SnapshotDialogProps) {
  const { setSnapshot, isPending, isSuccess } = useSetSnapshot();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [estimatedSize, setEstimatedSize] = useState<string>("");

  // Generate preview
  useEffect(() => {
    generatePreview();
  }, [tiles, rows, cols]);

  // Handle success
  useEffect(() => {
    if (isSuccess && onSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  const generatePreview = async () => {
    try {
      // Normalize tiles
      const normalizedTiles = await Promise.all(
        tiles.map((tile) => normalizePngTo24x24(tile))
      );

      // Compose grid
      const baseImageData = await composeGrid(normalizedTiles, rows, cols);

      // Create preview canvas
      const canvas = new OffscreenCanvas(
        baseImageData.width * 4,
        baseImageData.height * 4
      );
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        const tempCanvas = new OffscreenCanvas(
          baseImageData.width,
          baseImageData.height
        );
        const tempCtx = tempCanvas.getContext("2d");

        if (tempCtx) {
          tempCtx.putImageData(baseImageData, 0, 0);
          ctx.scale(4, 4);
          ctx.drawImage(tempCanvas, 0, 0);

          const blob = await canvas.convertToBlob({ type: "image/png" });
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        }
      }

      // Estimate size with standard settings
      const testBytes = await upscaleAndEncodePNG(
        baseImageData,
        SNAPSHOT_TARGET,
        32
      );
      setEstimatedSize(formatBytes(testBytes.length));
    } catch (err) {
      console.error("Preview generation error:", err);
      setError("Failed to generate preview");
    }
  };

  const handleStore = async (targetSize: number) => {
    setProcessing(true);
    setError("");

    try {
      // Normalize tiles
      const normalizedTiles = await Promise.all(
        tiles.map((tile) => normalizePngTo24x24(tile))
      );

      // Compose grid
      const baseImageData = await composeGrid(normalizedTiles, rows, cols);

      // Upscale and encode
      let pngBytes = await upscaleAndEncodePNG(baseImageData, targetSize, 32);

      // Ensure under cap
      pngBytes = await ensureUnderCap(pngBytes, baseImageData, targetSize);

      console.log(
        `Final PNG size: ${formatBytes(pngBytes.length)} (${pngBytes.length} bytes)`
      );

      // Convert to hex for contract
      const hexData = `0x${Array.from(pngBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")}` as `0x${string}`;

      // Call contract
      await setSnapshot(collageId, hexData);
    } catch (err: any) {
      console.error("Snapshot error:", err);
      setError(err.message || "Failed to set snapshot");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
    >
      <div
        style={{
          backgroundColor: "#000000",
          border: "4px solid #ffffff",
          padding: "30px",
          maxWidth: "600px",
          width: "90%",
          fontFamily: "monospace",
          color: "#ffffff",
        }}
      >
        <h2
          style={{
            margin: "0 0 20px 0",
            fontSize: "24px",
            textTransform: "uppercase",
            letterSpacing: "2px",
            textAlign: "center",
          }}
        >
          Finalize On-Chain Image?
        </h2>

        {previewUrl && (
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                maxWidth: "300px",
                maxHeight: "300px",
                imageRendering: "pixelated",
                border: "2px solid #ffffff",
              }}
            />
            <div style={{ marginTop: "10px", fontSize: "12px", color: "#888888" }}>
              Preview (4x scale)
            </div>
          </div>
        )}

        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            backgroundColor: "#111111",
            border: "2px solid #333333",
          }}
        >
          <div style={{ fontSize: "14px", marginBottom: "10px" }}>
            Grid: {rows}x{cols} ({rows * cols} tiles)
          </div>
          <div style={{ fontSize: "14px", marginBottom: "10px" }}>
            Estimated size: {estimatedSize || "Calculating..."}
          </div>
          <div style={{ fontSize: "12px", color: "#888888" }}>
            Note: Snapshot can only be set once and is permanently stored on-chain.
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button
            onClick={() => handleStore(SNAPSHOT_TARGET)}
            disabled={processing || isPending}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: "#00ff00",
              color: "#000000",
              border: "2px solid #00ff00",
              cursor: processing || isPending ? "not-allowed" : "pointer",
              fontFamily: "monospace",
              textTransform: "uppercase",
              fontSize: "12px",
              fontWeight: "bold",
              opacity: processing || isPending ? 0.5 : 1,
            }}
          >
            Store 432×432
            <div style={{ fontSize: "10px", marginTop: "4px" }}>
              (Preferred)
            </div>
          </button>

          <button
            onClick={() => handleStore(SNAPSHOT_ALT)}
            disabled={processing || isPending}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: "#ffffff",
              color: "#000000",
              border: "2px solid #ffffff",
              cursor: processing || isPending ? "not-allowed" : "pointer",
              fontFamily: "monospace",
              textTransform: "uppercase",
              fontSize: "12px",
              fontWeight: "bold",
              opacity: processing || isPending ? 0.5 : 1,
            }}
          >
            Store 576×576
            <div style={{ fontSize: "10px", marginTop: "4px" }}>
              (Premium)
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          disabled={processing || isPending}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#000000",
            color: "#ffffff",
            border: "2px solid #666666",
            cursor: processing || isPending ? "not-allowed" : "pointer",
            fontFamily: "monospace",
            textTransform: "uppercase",
            fontSize: "12px",
          }}
        >
          {processing || isPending ? "Processing..." : "Skip for Now"}
        </button>

        {error && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "#330000",
              border: "2px solid #ff0000",
              color: "#ff0000",
              fontSize: "12px",
            }}
          >
            Error: {error}
          </div>
        )}

        {(processing || isPending) && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "#333300",
              border: "2px solid #ffff00",
              color: "#ffff00",
              fontSize: "12px",
              textAlign: "center",
            }}
          >
            {processing
              ? "Processing image..."
              : "Waiting for transaction confirmation..."}
          </div>
        )}

        {isSuccess && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "#003300",
              border: "2px solid #00ff00",
              color: "#00ff00",
              fontSize: "12px",
              textAlign: "center",
            }}
          >
            Snapshot stored successfully! 🎉
          </div>
        )}
      </div>
    </div>
  );
}


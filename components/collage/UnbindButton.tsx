"use client";

import { useState } from "react";
import { useUnbind } from "@/frontend/hooks/useGridStaker";

interface UnbindButtonProps {
  collageId: bigint;
  onSuccess?: () => void;
  disabled?: boolean;
}

export function UnbindButton({ collageId, onSuccess, disabled }: UnbindButtonProps) {
  const { unbind, isPending, isSuccess } = useUnbind();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string>("");

  const handleUnbind = async () => {
    setError("");
    try {
      await unbind(collageId);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Unbind error:", err);
      setError(err.message || "Failed to unbind collage");
    }
  };

  if (showConfirm) {
    return (
      <div
        style={{
          padding: "15px",
          backgroundColor: "#330000",
          border: "2px solid #ff0000",
          borderRadius: "4px",
        }}
      >
        <div
          style={{
            color: "#ffffff",
            fontFamily: "monospace",
            fontSize: "14px",
            marginBottom: "10px",
          }}
        >
          ⚠️ Warning: This will burn the collage NFT and return your staked tokens. This cannot be undone!
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleUnbind}
            disabled={isPending || disabled}
            style={{
              flex: 1,
              padding: "10px",
              backgroundColor: "#ff0000",
              color: "#ffffff",
              border: "2px solid #ff0000",
              cursor: isPending || disabled ? "not-allowed" : "pointer",
              fontFamily: "monospace",
              textTransform: "uppercase",
              fontSize: "12px",
              fontWeight: "bold",
              opacity: isPending || disabled ? 0.5 : 1,
            }}
          >
            {isPending ? "Unbinding..." : "Confirm Unbind"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isPending}
            style={{
              flex: 1,
              padding: "10px",
              backgroundColor: "#000000",
              color: "#ffffff",
              border: "2px solid #666666",
              cursor: isPending ? "not-allowed" : "pointer",
              fontFamily: "monospace",
              textTransform: "uppercase",
              fontSize: "12px",
            }}
          >
            Cancel
          </button>
        </div>
        {error && (
          <div
            style={{
              marginTop: "10px",
              color: "#ff0000",
              fontSize: "12px",
              fontFamily: "monospace",
            }}
          >
            Error: {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      disabled={disabled || isPending}
      style={{
        padding: "10px 20px",
        backgroundColor: "#000000",
        color: "#ff0000",
        border: "2px solid #ff0000",
        cursor: disabled || isPending ? "not-allowed" : "pointer",
        fontFamily: "monospace",
        textTransform: "uppercase",
        fontSize: "12px",
        fontWeight: "bold",
        opacity: disabled || isPending ? 0.5 : 1,
      }}
      onMouseOver={(e) => {
        if (!disabled && !isPending) {
          e.currentTarget.style.backgroundColor = "#ff0000";
          e.currentTarget.style.color = "#ffffff";
        }
      }}
      onMouseOut={(e) => {
        if (!disabled && !isPending) {
          e.currentTarget.style.backgroundColor = "#000000";
          e.currentTarget.style.color = "#ff0000";
        }
      }}
    >
      Unbind Collage
    </button>
  );
}


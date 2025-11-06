"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Suppress WalletConnect connection errors
    const errorMessage = error?.message || error?.toString() || "";
    if (
      errorMessage.includes("Connection interrupted") ||
      errorMessage.includes("subscribe") ||
      errorMessage.includes("WalletConnect") ||
      errorMessage.includes("trying to subscribe")
    ) {
      // Silently reset without showing error
      reset();
      return;
    }
  }, [error, reset]);

  // If it's a WalletConnect error, don't render anything
  const errorMessage = error?.message || error?.toString() || "";
  if (
    errorMessage.includes("Connection interrupted") ||
    errorMessage.includes("subscribe") ||
    errorMessage.includes("WalletConnect") ||
    errorMessage.includes("trying to subscribe")
  ) {
    return null;
  }

  // Only show non-WalletConnect errors
  return (
    <div
      style={{
        padding: "20px",
        textAlign: "center",
        color: "#ffffff",
        fontFamily: "monospace",
      }}
    >
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button
        onClick={reset}
        style={{
          padding: "10px 20px",
          backgroundColor: "#ffffff",
          color: "#000000",
          border: "none",
          cursor: "pointer",
          fontFamily: "monospace",
          marginTop: "20px",
        }}
      >
        Try again
      </button>
    </div>
  );
}


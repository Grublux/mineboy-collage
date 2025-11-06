"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Filter out WalletConnect connection errors
    const errorMessage = error?.message || error?.toString() || "";
    if (
      errorMessage.includes("Connection interrupted") ||
      errorMessage.includes("subscribe") ||
      errorMessage.includes("WalletConnect") ||
      errorMessage.includes("WebSocket")
    ) {
      // Don't show error boundary for WalletConnect errors
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorMessage = error?.message || error?.toString() || "";
    // Suppress WalletConnect errors
    if (
      errorMessage.includes("Connection interrupted") ||
      errorMessage.includes("subscribe") ||
      errorMessage.includes("WalletConnect") ||
      errorMessage.includes("WebSocket")
    ) {
      console.warn("WalletConnect connection error (suppressed):", errorMessage);
      return;
    }
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError && this.state.error) {
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
          <p>{this.state.error.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
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

    return this.props.children;
  }
}


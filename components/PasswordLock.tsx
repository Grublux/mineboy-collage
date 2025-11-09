"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// Set your password here - this is not updateable from the frontend
const SITE_PASSWORD = process.env.NEXT_PUBLIC_SITE_PASSWORD || "changeme";

const STORAGE_KEY = "site_unlocked";

export function PasswordLock({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Skip lock on homepage
  const isHomepage = pathname === "/";

  useEffect(() => {
    // Skip checking if on homepage
    if (isHomepage) {
      setIsUnlocked(true);
      return;
    }

    // Check if already unlocked in this session
    const unlocked = sessionStorage.getItem(STORAGE_KEY);
    if (unlocked === "true") {
      setIsUnlocked(true);
    } else {
      setIsUnlocked(false);
    }
  }, [isHomepage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password === SITE_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "true");
      setIsUnlocked(true);
      setPassword("");
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  // Skip lock on homepage - always show children
  if (isHomepage) {
    return <>{children}</>;
  }

  // Show loading state while checking
  if (isUnlocked === null) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#000000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255, 255, 255, 0.85)",
          fontFamily: "monospace",
        }}
      >
        Loading...
      </div>
    );
  }

  // Show password prompt if not unlocked
  if (!isUnlocked) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#000000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255, 255, 255, 0.85)",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            padding: "40px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "4px",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            maxWidth: "400px",
            width: "100%",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              textTransform: "uppercase",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            Site is locked, enter password
          </h2>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Password"
              autoFocus
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "4px",
                color: "rgba(255, 255, 255, 0.85)",
                fontFamily: "monospace",
                fontSize: "14px",
                marginBottom: "10px",
                boxSizing: "border-box",
              }}
            />
            {error && (
              <div
                style={{
                  color: "#ff4444",
                  fontSize: "12px",
                  marginBottom: "10px",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "transparent",
                border: "2px solid rgba(255, 255, 255, 0.85)",
                borderRadius: "4px",
                color: "rgba(255, 255, 255, 0.85)",
                fontFamily: "monospace",
                fontSize: "14px",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Show children if unlocked
  return <>{children}</>;
}

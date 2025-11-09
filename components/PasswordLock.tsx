"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function PasswordLock({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Skip lock on homepage
  const isHomepage = pathname === "/";

  useEffect(() => {
    // Skip checking if on homepage
    if (isHomepage) {
      setIsUnlocked(true);
      setLoading(false);
      return;
    }

    // Check authentication status
    const checkAuth = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        setIsUnlocked(data.authenticated);
      } catch (error) {
        console.error('Failed to fetch auth status:', error);
        setIsUnlocked(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [isHomepage, pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsUnlocked(true);
        setCode("");
      } else {
        setError(data.error || "Invalid code");
        setCode("");
      }
    } catch (error) {
      setError("Error verifying code. Please try again.");
      setCode("");
    } finally {
      setLoading(false);
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

  // Show code input if not unlocked
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
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            Site is locked
          </h2>
          <p
            style={{
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.6)",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            Enter your 6-digit authentication code
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
                setError("");
              }}
              placeholder="000000"
              autoFocus
              maxLength={6}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "4px",
                color: "rgba(255, 255, 255, 0.85)",
                fontFamily: "monospace",
                fontSize: "24px",
                letterSpacing: "8px",
                textAlign: "center",
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
              disabled={loading || code.length !== 6}
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
                cursor: loading || code.length !== 6 ? "not-allowed" : "pointer",
                opacity: loading || code.length !== 6 ? 0.5 : 1,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!loading && code.length === 6) {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {loading ? "Verifying..." : "Unlock"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Show children if unlocked
  return <>{children}</>;
}

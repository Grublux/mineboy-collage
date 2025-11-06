"use client";

export const dynamic = 'force-dynamic';

import Link from "next/link";
import { WalletHeader } from "@/components/grids/WalletHeader";
import { Header } from "@/components/grids/Header";

export default function GoobalooGridsPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        color: "#ffffff",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <WalletHeader />
        
        <div style={{ marginBottom: "40px" }}>
          <Link
            href="/"
            style={{
              color: "#ffffff",
              textDecoration: "none",
              fontSize: "24px",
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: "20px",
              display: "inline-block",
            }}
          >
            ← Grids
          </Link>
          <Header title="Goobaloo Grids" />
        </div>

        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "24px", fontFamily: "monospace", marginBottom: "20px" }}>
            Goobaloo Grids Coming Soon
          </p>
          <p style={{ fontSize: "16px", fontFamily: "monospace", opacity: 0.7 }}>
            Goobaloo collection integration will be available soon
          </p>
        </div>
      </div>
    </div>
  );
}

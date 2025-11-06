"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { gridStakerConfig } from "@/frontend/lib/contracts/gridStaker";
import { useTokenMetadata } from "@/frontend/hooks/useTokenMetadata";
import { WalletHeader } from "@/components/grids/WalletHeader";
import { Header } from "@/components/grids/Header";
import Link from "next/link";

// GridCard component for displaying grids
function GridCard({
  gridId,
}: {
  gridId: bigint;
}) {
  const { data: tokenURI } = useReadContract({
    ...gridStakerConfig,
    functionName: "tokenURI",
    args: [gridId],
  });

  const { data: underlying } = useReadContract({
    ...gridStakerConfig,
    functionName: "getUnderlying",
    args: [gridId],
  });

  const { metadata } = useTokenMetadata(tokenURI as string);

  const underlyingData = underlying as [string, number, number, bigint[]] | undefined;
  const [collection, rows, cols, tokenIds] = underlyingData || ["", 0, 0, [] as bigint[]];

  return (
    <div
      style={{
        border: "2px solid #ffffff",
        padding: "20px",
        backgroundColor: "#111111",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
      }}
    >
      {metadata?.image && (
        <Link href={`/collage/${gridId.toString()}`}>
          <div
            style={{
              width: "100%",
              aspectRatio: "1",
              backgroundColor: "#000000",
              border: "2px solid #333333",
              overflow: "hidden",
              cursor: "pointer",
            }}
          >
            <img
              src={metadata.image}
              alt={metadata.name || `Grid #${gridId}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                imageRendering: "pixelated",
              }}
            />
          </div>
        </Link>
      )}

      <div>
        <h3
          style={{
            margin: "0 0 10px 0",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#ffffff",
            fontFamily: "monospace",
            textTransform: "uppercase",
          }}
        >
          {metadata?.name || `Grid #${gridId}`}
        </h3>
        <div style={{ fontSize: "14px", color: "#888888", fontFamily: "monospace", marginBottom: "5px" }}>
          Grid: {rows.toString()}×{cols.toString()}
        </div>
        <div style={{ fontSize: "14px", color: "#888888", fontFamily: "monospace" }}>
          Tokens: {(tokenIds as bigint[])?.length || 0}
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
        <Link
          href={`/collage/${gridId.toString()}`}
          style={{
            flex: 1,
            padding: "10px",
            backgroundColor: "#ffffff",
            color: "#000000",
            border: "2px solid #ffffff",
            textAlign: "center",
            textDecoration: "none",
            fontFamily: "monospace",
            textTransform: "uppercase",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          View
        </Link>
      </div>
    </div>
  );
}

export default function MyGridsPage() {
  const { address, isConnected } = useAccount();

  // Read user's grids
  const { data: gridBalance, isLoading: loadingGrids } = useReadContract({
    ...gridStakerConfig,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  const gridBalanceNum = gridBalance ? Number(gridBalance) : 0;

  const { data: gridTokenIds } = useReadContracts({
    contracts: Array.from({ length: gridBalanceNum }, (_, i) => ({
      ...gridStakerConfig,
      functionName: "tokenOfOwnerByIndex" as const,
      args: [address!, BigInt(i)] as const,
    })) as any,
    query: {
      enabled: !!address && gridBalanceNum > 0 && isConnected,
    },
  });

  if (!isConnected) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#000000",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <WalletHeader />
        <Header title="My Grids" />
        <div style={{ textAlign: "center", padding: "40px" }}>
          Please connect your wallet to view your grids.
        </div>
      </div>
    );
  }

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
          <Header title="My Grids" />
        </div>

        {loadingGrids ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666666" }}>Loading...</div>
        ) : gridBalanceNum === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              border: "2px dashed #333333",
              color: "#666666",
            }}
          >
            <p style={{ fontSize: "18px", marginBottom: "10px" }}>No grids yet</p>
            <p style={{ fontSize: "14px" }}>
              Create your first grid using one of the collection pages!
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "30px",
            }}
          >
            {gridTokenIds?.map((result: any, index: number) => {
              if (result.status === "success" && result.result) {
                return (
                  <GridCard
                    key={index}
                    gridId={result.result as bigint}
                  />
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useParams, useRouter } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { collageStakerConfig } from "@/frontend/lib/contracts/collageStaker";
import { useTokenMetadata } from "@/frontend/hooks/useTokenMetadata";
import { UnbindButton } from "@/components/collage/UnbindButton";
import { useState } from "react";


export default function CollagePage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [shareStatus, setShareStatus] = useState<string>("");

  if (!params || !params.id) {
    return <div>Invalid collage ID</div>;
  }
  const collageId = BigInt(params.id as string);
  // Read tokenURI
  const { data: tokenURI, isLoading: loadingURI } = useReadContract({
    ...collageStakerConfig,
    functionName: "tokenURI",
    args: [collageId],
  });

  // Read underlying data
  const { data: underlying, isLoading: loadingUnderlying } = useReadContract({
    ...collageStakerConfig,
    functionName: "getUnderlying",
    args: [collageId],
  });

  // Read owner
  const { data: owner } = useReadContract({
    ...collageStakerConfig,
    functionName: "ownerOf",
    args: [collageId],
  });

  const { metadata } = useTokenMetadata(tokenURI as string);

  const underlyingData = underlying as [string, number, number, bigint[]] | undefined;
  const [collection, rows, cols, tokenIds] = underlyingData || [
    "",
    0,
    0,
    [] as bigint[],
  ];

  const ownerAddress = owner as string | undefined;
  const isOwner = address && ownerAddress && address.toLowerCase() === ownerAddress.toLowerCase();

  const handleShare = async () => {
    const shareData = {
      title: metadata?.name || `Collage #${collageId}`,
      text: metadata?.description || "Check out my on-chain collage!",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShareStatus("Shared successfully!");
        setTimeout(() => setShareStatus(""), 3000);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setShareStatus("Share failed");
          setTimeout(() => setShareStatus(""), 3000);
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus("Link copied to clipboard!");
        setTimeout(() => setShareStatus(""), 3000);
      } catch {
        setShareStatus("Unable to share");
        setTimeout(() => setShareStatus(""), 3000);
      }
    }
  };

  const handleUnbindSuccess = () => {
    router.push("/my-blocks");
  };

  const isLoading = loadingURI || loadingUnderlying;

  if (!isConnected) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontFamily: "monospace",
            textTransform: "uppercase",
            marginBottom: "30px",
            letterSpacing: "2px",
          }}
        >
          Collage #{collageId.toString()}
        </h1>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        color: "rgba(255, 255, 255, 0.85)",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "40px",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <Link
            href="/my-blocks"
            style={{
              color: "rgba(255, 255, 255, 0.85)",
              textDecoration: "none",
              fontFamily: "monospace",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            ← Back to My Collages
          </Link>
          <ConnectButton />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              fontSize: "18px",
              fontFamily: "monospace",
              color: "#888888",
            }}
          >
            Loading collage...
          </div>
        )}

        {/* Collage Content */}
        {!isLoading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "40px",
            }}
          >
            {/* Image */}
            <div>
              {metadata?.image && (
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    backgroundColor: "#000000",
                    border: "4px solid #ffffff",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={metadata.image}
                    alt={metadata.name || `Collage #${collageId}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      imageRendering: "pixelated",
                    }}
                  />
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <h1
                style={{
                  fontSize: "32px",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  marginBottom: "20px",
                }}
              >
                {metadata?.name || `Collage #${collageId}`}
              </h1>

              {metadata?.description && (
                <p
                  style={{
                    fontSize: "14px",
                    fontFamily: "monospace",
                    color: "#888888",
                    marginBottom: "30px",
                    lineHeight: "1.6",
                  }}
                >
                  {metadata.description}
                </p>
              )}

              {/* Stats */}
              <div
                style={{
                  backgroundColor: "#111111",
                  border: "2px solid #333333",
                  padding: "20px",
                  marginBottom: "30px",
                }}
              >
                <h3
                  style={{
                    fontSize: "16px",
                    fontFamily: "monospace",
                    textTransform: "uppercase",
                    marginBottom: "15px",
                    letterSpacing: "1px",
                  }}
                >
                  Details
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "15px",
                    fontSize: "14px",
                    fontFamily: "monospace",
                  }}
                >
                  <div>
                    <div style={{ color: "#666666", marginBottom: "5px" }}>
                      Grid Size
                    </div>
                    <div style={{ color: "rgba(255, 255, 255, 0.85)" }}>
                      {rows.toString()}×{cols.toString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "#666666", marginBottom: "5px" }}>
                      Token Count
                    </div>
                    <div style={{ color: "rgba(255, 255, 255, 0.85)" }}>
                      {(tokenIds as bigint[])?.length || 0}
                    </div>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div style={{ color: "#666666", marginBottom: "5px" }}>
                      Owner
                    </div>
                    <div
                      style={{
                        color: "rgba(255, 255, 255, 0.85)",
                        fontSize: "12px",
                      wordBreak: "break-all",
                    }}
                  >
                    {ownerAddress}
                    {isOwner && (
                      <span style={{ color: "#00ff00", marginLeft: "10px" }}>
                        (You)
                      </span>
                    )}
                  </div>
                  </div>
                </div>
              </div>

              {/* Token IDs */}
              {tokenIds && (tokenIds as bigint[]).length > 0 && (
                <div
                  style={{
                    backgroundColor: "#111111",
                    border: "2px solid #333333",
                    padding: "20px",
                    marginBottom: "30px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "16px",
                      fontFamily: "monospace",
                      textTransform: "uppercase",
                      marginBottom: "15px",
                      letterSpacing: "1px",
                    }}
                  >
                    Staked Tokens
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      fontSize: "12px",
                      fontFamily: "monospace",
                    }}
                  >
                    {(tokenIds as bigint[]).map((id, index) => (
                      <div
                        key={index}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#000000",
                          border: "1px solid #666666",
                          color: "rgba(255, 255, 255, 0.85)",
                        }}
                      >
                        #{id.toString()}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                {/* Share Button */}
                <button
                  onClick={handleShare}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#ffffff",
                    color: "#000000",
                    border: "2px solid rgba(255, 255, 255, 0.85)",
                    cursor: "pointer",
                    fontFamily: "monospace",
                    textTransform: "uppercase",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#000000";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                    e.currentTarget.style.color = "#000000";
                  }}
                >
                  📤 Share Collage
                </button>

                {shareStatus && (
                  <div
                    style={{
                      padding: "10px",
                      backgroundColor: "#003300",
                      border: "2px solid #00ff00",
                      color: "#00ff00",
                      fontSize: "12px",
                      fontFamily: "monospace",
                      textAlign: "center",
                    }}
                  >
                    {shareStatus}
                  </div>
                )}

                {/* Unbind Button (only if owner) */}
                {isOwner && (
                  <UnbindButton
                    collageId={collageId}
                    onSuccess={handleUnbindSuccess}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


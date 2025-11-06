"use client";

import { useState, useEffect } from "react";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useMintCollage, useIsApprovedForAll } from "@/frontend/hooks/useCollageStaker";
import { decodeEventLog } from "viem";
import { CollageStakerABI } from "@/frontend/lib/contracts/collageStaker";

interface MintCollageButtonProps {
  rows: number;
  cols: number;
  selectedTokenIds: number[];
  onMinted?: (collageId: bigint) => void;
  disabled?: boolean;
}

export function MintCollageButton({
  rows,
  cols,
  selectedTokenIds,
  onMinted,
  disabled,
}: MintCollageButtonProps) {
  const { isConnected } = useAccount();
  const { isApproved, isLoading: checkingApproval } = useIsApprovedForAll();
  const { mintCollage, hash, isPending } = useMintCollage();
  const [error, setError] = useState<string>("");
  const [minted, setMinted] = useState(false);
  const [userRejected, setUserRejected] = useState(false);

  const { data: receipt, isSuccess: txSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Parse collage ID from receipt when minting succeeds
  useEffect(() => {
    if (txSuccess && receipt && receipt.logs && onMinted && !minted) {
      try {
        // Find CollageMinted event
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: CollageStakerABI as any,
              data: log.data,
              topics: log.topics,
            }) as any;

            if (decoded?.eventName === "CollageMinted") {
              const args = decoded.args as any;
              const collageId = args?.id || args?.[0];
              if (collageId !== undefined) {
                onMinted(BigInt(collageId));
                setMinted(true);
                break;
              }
            }
          } catch {
            // Not our event, continue
          }
        }
      } catch (err) {
        console.error("Error parsing mint logs:", err);
      }
    }
  }, [txSuccess, receipt, onMinted, minted]);

  const handleMint = async () => {
    if (!isConnected) {
      setError("Please connect your wallet");
      return;
    }

    if (selectedTokenIds.length === 0) {
      setError("Please select at least one NFT");
      return;
    }

    if (rows === 0 || cols === 0) {
      setError("Invalid grid size");
      return;
    }

    setError("");
    setUserRejected(false);

    try {
      const tokenIdsBigInt = selectedTokenIds.map((id) => BigInt(id));
      await mintCollage(rows, cols, tokenIdsBigInt);
    } catch (err: any) {
      console.error("Mint error:", err);
      
      // Check if user rejected the transaction
      const errorMessage = err?.message?.toLowerCase() || err?.toString()?.toLowerCase() || "";
      const isRejection = 
        errorMessage.includes("user rejected") ||
        errorMessage.includes("user denied") ||
        errorMessage.includes("user cancelled") ||
        errorMessage.includes("user canceled") ||
        errorMessage.includes("rejected") && errorMessage.includes("transaction") ||
        err?.code === 4001 || // MetaMask rejection code
        err?.code === "ACTION_REJECTED";
      
      if (isRejection) {
        setUserRejected(true);
        setError("Transaction was rejected");
      } else {
        setError(err.message || "Failed to mint collage");
      }
    }
  };

  const buttonText = () => {
    if (!isConnected) return "Mint Collage (Connect Wallet)";
    if (checkingApproval) return "Checking Approval...";
    if (!isApproved) return "Approve & Mint Collage";
    if (isPending) return "Minting...";
    return "Mint Collage NFT";
  };

  const isDisabled = disabled || isPending || !isConnected;

  return (
    <div>
      <button
        onClick={handleMint}
        disabled={isDisabled}
        style={{
          padding: "12px 24px",
          backgroundColor: isDisabled ? "transparent" : "#ffffff",
          color: isDisabled ? "#666666" : "#000000",
          border: `2px solid ${isDisabled ? "#666666" : "#ffffff"}`,
          cursor: isDisabled ? "not-allowed" : "pointer",
          fontFamily: "monospace",
          textTransform: "uppercase",
          fontSize: "14px",
          fontWeight: "bold",
          opacity: isDisabled ? 0.5 : 1,
        }}
        onMouseOver={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = "#000000";
            e.currentTarget.style.color = "#ffffff";
          }
        }}
        onMouseOut={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = "#ffffff";
            e.currentTarget.style.color = "#000000";
          }
        }}
      >
        {buttonText()}
      </button>

      {userRejected && (
        <div
          style={{
            marginTop: "10px",
            color: "#ff9900",
            fontSize: "14px",
            fontFamily: "monospace",
            fontWeight: "bold",
            textAlign: "center",
            padding: "10px",
            border: "2px solid #ff9900",
            backgroundColor: "rgba(255, 153, 0, 0.1)",
          }}
        >
          ⚠️ User Rejected Transaction
          <div style={{ fontSize: "12px", marginTop: "5px", fontWeight: "normal" }}>
            Click the button above to try again
          </div>
        </div>
      )}

      {error && !userRejected && (
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

      {isPending && (
        <div
          style={{
            marginTop: "10px",
            color: "#ffff00",
            fontSize: "12px",
            fontFamily: "monospace",
          }}
        >
          {!isApproved ? "Step 1/2: Approving..." : "Step 2/2: Minting..."}
        </div>
      )}
    </div>
  );
}


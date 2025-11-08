"use client";

import { useState, useEffect } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract, usePublicClient } from "wagmi";
import { useMintGrid, useIsApprovedForAll, useIsNGTApproved, useNGTPrice } from "@/frontend/hooks/useGridStaker";
import { decodeEventLog } from "viem";
import { GridStakerABI, gridStakerConfig, sourceCollectionAddress, ngtTokenAddress, ERC20_ABI } from "@/frontend/lib/contracts/gridStaker";

// ERC721 ABI for setApprovalForAll
const ERC721_ABI = [
  {
    type: "function",
    name: "setApprovalForAll",
    inputs: [
      { name: "operator", type: "address" },
      { name: "approved", type: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

interface MintGridButtonProps {
  rows: number;
  cols: number;
  selectedNFTs: (string | undefined)[]; // Array representing grid positions (undefined = empty slot)
  onMinted?: (gridId: bigint) => void;
  disabled?: boolean;
  showFilledCount?: boolean; // Show "x/totalSlots filled" instead of price
  totalSlots?: number; // Total slots for filled count display
}

/**
 * Calculates cellIndexOfToken array based on grid positions
 * cellIndex = row * cols + col (0-based, row-major)
 */
function calculateCellIndexOfToken(
  selectedNFTs: (string | undefined)[],
  rows: number,
  cols: number
): { tokenIds: bigint[]; cellIndexOfToken: number[] } {
  const tokenIds: bigint[] = [];
  const cellIndexOfToken: number[] = [];

  // Iterate through selectedNFTs array - each index represents a grid position
  for (let i = 0; i < selectedNFTs.length; i++) {
    const nftId = selectedNFTs[i];
    if (nftId) {
      // Extract token ID from nftId (format: "manual-123", "owned-123", or just the tokenId)
      let tokenIdStr = nftId;
      if (nftId.startsWith("manual-")) {
        tokenIdStr = nftId.replace("manual-", "");
      } else if (nftId.startsWith("owned-")) {
        tokenIdStr = nftId.replace("owned-", "");
      } else if (nftId.includes(":")) {
        tokenIdStr = nftId.split(":")[1];
      }
      
      // Validate that tokenIdStr is a valid number
      if (!tokenIdStr || isNaN(Number(tokenIdStr))) {
        console.error(`Invalid token ID format: ${nftId} (extracted: ${tokenIdStr})`);
        continue; // Skip this NFT
      }
      
      tokenIds.push(BigInt(tokenIdStr));
      
      // Calculate cell index from array position i
      // Array position i directly maps to grid cell index (row-major order)
      const cellIndex = i; // i is already the cell index in the grid
      cellIndexOfToken.push(cellIndex);
    }
  }

  return { tokenIds, cellIndexOfToken };
}

export function MintGridButton({
  rows,
  cols,
  selectedNFTs,
  onMinted,
  disabled,
  showFilledCount = false,
  totalSlots,
}: MintGridButtonProps) {
  const { isConnected } = useAccount();
  
  // GridStaker requires minimum 2x2 (MIN_CELLS = 4)
  if (rows < 2 || cols < 2) {
    console.error("GridStaker requires minimum 2x2 grid");
  }
  
  // Always call all hooks (React rules)
  const { isApproved: isMineBoyApproved, isLoading: checkingMineBoyApproval } = useIsApprovedForAll();
  const { isApproved: isNGTApproved, isLoading: checkingNGTApproval } = useIsNGTApproved();
  const { price: ngtPrice, isSet: ngtPriceSet, isLoading: checkingPrice } = useNGTPrice();
  const { mintGrid, hash, isPending } = useMintGrid();
  const { writeContractAsync: approveContract } = useWriteContract();
  const publicClient = usePublicClient();
  
  // Approval target is always GridStaker
  const approvalTarget = gridStakerConfig.address;
  
  const [error, setError] = useState<string>("");
  const [minted, setMinted] = useState(false);
  const [userRejected, setUserRejected] = useState(false);

  const { data: receipt, isSuccess: txSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Parse grid ID from receipt when minting succeeds
  useEffect(() => {
    if (txSuccess && receipt && receipt.logs && onMinted && !minted) {
      try {
        // Find GridMinted event from GridStaker
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: GridStakerABI as any,
              data: log.data,
              topics: log.topics,
            }) as any;

            if (decoded?.eventName === "GridMinted") {
              const args = decoded.args as any;
              const gridId = args?.id || args?.[0];
              if (gridId !== undefined) {
                onMinted(BigInt(gridId));
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

    const filledSlots = selectedNFTs.filter(id => id);
    if (filledSlots.length === 0) {
      setError("Please select at least one MineBoy");
      return;
    }

    if (rows === 0 || cols === 0) {
      setError("Invalid grid size");
      return;
    }

    // Calculate cellIndexOfToken array
    const { tokenIds, cellIndexOfToken } = calculateCellIndexOfToken(selectedNFTs, rows, cols);

    if (tokenIds.length !== cellIndexOfToken.length) {
      setError("Failed to calculate grid positions");
      return;
    }

    setError("");
    setUserRejected(false);

    try {
      // Check and approve MineBoys if needed
      if (!isMineBoyApproved) {
        console.log("📝 Approving MineBoys for", approvalTarget);
        const approveHash = await approveContract({
          address: sourceCollectionAddress,
          abi: ERC721_ABI,
          functionName: "setApprovalForAll",
          args: [approvalTarget, true],
        });
        // Wait for approval transaction to be confirmed
        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash: approveHash });
          console.log("✅ MineBoy approval confirmed");
        }
      }

      // Check and approve NGT if needed
      if (!isNGTApproved) {
        console.log("💰 Approving NGT for", gridStakerConfig.address);
        const maxApproval = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
        const approveHash = await approveContract({
          address: ngtTokenAddress,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [gridStakerConfig.address, maxApproval],
        });
        // Wait for approval transaction to be confirmed
        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash: approveHash });
          console.log("✅ NGT approval confirmed");
        }
      }

      // Use GridStaker for all grid sizes (requires minimum 2x2)
      await mintGrid(rows, cols, tokenIds, cellIndexOfToken);
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
        setError(err.message || "Failed to mint grid");
      }
    }
  };

  const filledCount = selectedNFTs.filter(id => id).length;
  
  const buttonText = () => {
    // Show filled count when grid is not full
    if (showFilledCount && totalSlots !== undefined) {
      return `${filledCount}/${totalSlots} filled`;
    }
    if (!isConnected) return "Mint MineBlock";
    if (checkingMineBoyApproval || checkingNGTApproval || checkingPrice) return "Checking Approvals...";
    if (!ngtPriceSet) return "Mint MineBlock";
    if (!isMineBoyApproved) return "Approve MineBoys & Mint";
    if (!isNGTApproved) return "Approve NGT & Mint";
    if (isPending) return "Minting...";
    return "Mint MineBlock";
  };

  const isDisabled = disabled || isPending || !isConnected;
  const showFilledCountMode = showFilledCount && totalSlots !== undefined;
  
  // When showing filled count, use red color for warning
  const buttonColor = showFilledCountMode ? "#ff4444" : (isDisabled ? "#666666" : "#000000");
  const buttonBgColor = isDisabled ? "transparent" : "#ffffff";
  const buttonBorderColor = isDisabled ? "#666666" : "#ffffff";

  return (
    <div>
      <button
        onClick={handleMint}
        disabled={isDisabled}
        style={{
          padding: "12px 24px",
          backgroundColor: buttonBgColor,
          color: buttonColor,
          border: `2px solid ${buttonBorderColor}`,
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
            e.currentTarget.style.color = showFilledCountMode ? "#ff4444" : "#ffffff";
          }
        }}
        onMouseOut={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = "#ffffff";
            e.currentTarget.style.color = buttonColor;
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

      {!ngtPriceSet && !checkingPrice && (
        <div
          style={{
            marginTop: "10px",
            color: "#ff9900",
            fontSize: "12px",
            fontFamily: "monospace",
            padding: "10px",
            border: "2px solid #ff9900",
            backgroundColor: "rgba(255, 153, 0, 0.1)",
          }}
        >
          ⚠️ NGT price not set on contract. Contact admin to set price via setErc20Price().
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
          {error.includes("token disabled") && (
            <div style={{ marginTop: "5px", fontSize: "11px" }}>
              This usually means the NGT price wasn't set during deployment.
            </div>
          )}
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
          {!isMineBoyApproved ? "Step 1/3: Approving MineBoys..." : 
           !isNGTApproved ? "Step 2/3: Approving NGT..." : 
           "Step 3/3: Minting Grid..."}
        </div>
      )}
    </div>
  );
}


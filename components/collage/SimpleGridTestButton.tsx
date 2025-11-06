"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useMintSimpleGrid, useIsApprovedForAll } from "@/frontend/hooks/useSimpleGridStaker";
import { useWriteContract } from "wagmi";
import { sourceCollectionAddress } from "@/frontend/lib/contracts/simpleGridStaker";

export default function SimpleGridTestButton() {
  const { address, isConnected } = useAccount();
  const { mintGrid, hash, isPending } = useMintSimpleGrid();
  const { isApproved } = useIsApprovedForAll();
  const { writeContractAsync } = useWriteContract();
  const [selectedTokenId, setSelectedTokenId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [minted, setMinted] = useState(false);

  // Debug: Log component mount
  console.log("🧪 SimpleGridTestButton rendered - isConnected:", isConnected, "isApproved:", isApproved);

  const handleApprove = async () => {
    if (!address || !selectedTokenId) return;
    
    try {
      setError("");
      await writeContractAsync({
        address: sourceCollectionAddress,
        abi: [
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
        ],
        functionName: "setApprovalForAll",
        args: ["0x40932EdcAb0376d46D8De92bcCF645fc164910dB", true],
      });
    } catch (err: any) {
      console.error("Approve error:", err);
      setError(err.message || "Failed to approve");
    }
  };

  const handleMint = async () => {
    if (!isConnected) {
      setError("Please connect your wallet");
      return;
    }

    if (!selectedTokenId) {
      setError("Please enter a MineBoy token ID");
      return;
    }

    try {
      setError("");
      setMinted(false);
      const tokenId = BigInt(selectedTokenId);
      await mintGrid([tokenId]);
      setMinted(true);
    } catch (err: any) {
      console.error("Mint error:", err);
      setError(err.message || "Failed to mint");
      setMinted(false);
    }
  };

  return (
    <div style={{ 
      padding: "15px", 
      border: "2px solid #fff", 
      backgroundColor: "#000",
      color: "#fff",
      width: "100%",
      maxWidth: "1000px",
      margin: "0 auto"
    }}>
      <h2 style={{ marginTop: 0, fontSize: "24px", fontWeight: "bold" }}>🧪 Simple Grid Test (Single MineBoy)</h2>
      <p style={{ fontSize: "14px", marginBottom: "15px" }}>Contract: 0x40932EdcAb0376d46D8De92bcCF645fc164910dB</p>
      
      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>
          MineBoy Token ID:
          <input
            type="text"
            value={selectedTokenId}
            onChange={(e) => setSelectedTokenId(e.target.value)}
            placeholder="e.g., 1"
            style={{
              marginLeft: "10px",
              padding: "5px",
              backgroundColor: "#333",
              color: "#fff",
              border: "1px solid #666",
            }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <p>Approval Status: {isApproved ? "✅ Approved" : "❌ Not Approved"}</p>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {!isApproved && (
          <button
            onClick={handleApprove}
            disabled={isPending || !isConnected}
            style={{
              padding: "10px 20px",
              backgroundColor: "#fff",
              color: "#000",
              border: "none",
              cursor: isPending || !isConnected ? "not-allowed" : "pointer",
            }}
          >
            Approve All MineBoys
          </button>
        )}
        
        <button
          onClick={handleMint}
          disabled={isPending || !isConnected || !selectedTokenId || !isApproved}
          style={{
            padding: "10px 20px",
            backgroundColor: isPending ? "#666" : "#fff",
            color: "#000",
            border: "none",
            cursor: isPending || !isConnected || !selectedTokenId || !isApproved ? "not-allowed" : "pointer",
          }}
        >
          {isPending ? "Minting..." : "Mint Simple Grid (1 MineBoy)"}
        </button>
      </div>

      {hash && (
        <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#333" }}>
          <p>Transaction: {hash}</p>
          <a
            href={`https://apechain.calderachain.xyz/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#0ff" }}
          >
            View on ApeScan
          </a>
        </div>
      )}

      {error && (
        <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#300", color: "#f00" }}>
          Error: {error}
        </div>
      )}

      {minted && (
        <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#030", color: "#0f0" }}>
          ✅ Mint successful! Check your wallet for the Grid NFT.
        </div>
      )}
    </div>
  );
}


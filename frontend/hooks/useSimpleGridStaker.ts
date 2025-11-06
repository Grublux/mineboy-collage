import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { simpleGridStakerConfig, sourceCollectionAddress } from "../lib/contracts/simpleGridStaker";
import { ERC20_ABI } from "../lib/contracts/gridStaker";

/**
 * Hook to check if MineBoy collection is approved for SimpleGridStaker
 */
export function useIsApprovedForAll() {
  const { address: owner } = useAccount();

  const { data: isApproved, isLoading } = useReadContract({
    address: sourceCollectionAddress,
    abi: [
      {
        type: "function",
        name: "isApprovedForAll",
        inputs: [
          { name: "owner", type: "address" },
          { name: "operator", type: "address" },
        ],
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "view",
      },
    ],
    functionName: "isApprovedForAll",
    args: owner ? [owner, simpleGridStakerConfig.address] : undefined,
    query: {
      enabled: !!owner,
    },
  });

  return {
    isApproved: isApproved as boolean | undefined,
    isLoading,
  };
}

/**
 * Hook for minting a simple grid (1, 2, or 4 MineBoys)
 * SimpleGridStaker handles authorization internally
 */
export function useMintSimpleGrid() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  const { address: owner } = useAccount();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const mintGrid = async (tokenIds: bigint[]) => {
    if (!publicClient) {
      throw new Error("Public client not available");
    }

    if (tokenIds.length !== 1 && tokenIds.length !== 2 && tokenIds.length !== 4) {
      throw new Error("Must provide 1, 2, or 4 MineBoys");
    }

    const contractAddress = simpleGridStakerConfig.address;

    // Check approvals (non-blocking, just for logging)
    if (owner) {
      try {
        console.log("🔍 Checking approvals...");
        const nftApproved = await publicClient.readContract({
          address: sourceCollectionAddress,
          abi: [
            {
              type: "function",
              name: "isApprovedForAll",
              inputs: [
                { name: "owner", type: "address" },
                { name: "operator", type: "address" },
              ],
              outputs: [{ name: "", type: "bool" }],
              stateMutability: "view",
            },
          ],
          functionName: "isApprovedForAll",
          args: [owner, contractAddress],
        }).catch(() => null);
        console.log(`📝 NFT Approval: ${nftApproved ? "✅" : "❌"}`);
      } catch (error) {
        console.warn("⚠️ Could not check approvals:", error);
      }
    }

    // IMPORTANT: The validator needs to be called by the USER (tx.origin), not the contract (msg.sender)
    // SimpleGridStaker's internal call doesn't work because validator uses msg.sender
    // So we must call beforeAuthorizedTransfer directly from the user FIRST
    const validatorAddress = "0x721C008fdff27BF06E7E123956E2Fe03B63342e3" as `0x${string}`;
    
    console.log("🔄 Step 1: Authorizing SimpleGridStaker via beforeAuthorizedTransfer (user call)...");
    try {
      // Call validator.beforeAuthorizedTransfer directly from user
      // This authorizes SimpleGridStaker to transfer from the user
      const authHash = await writeContractAsync({
        address: validatorAddress,
        abi: [
          {
            type: "function",
            name: "beforeAuthorizedTransfer",
            inputs: [
              { name: "operator", type: "address" },
              { name: "collection", type: "address" },
            ],
            outputs: [],
            stateMutability: "nonpayable",
          },
        ],
        functionName: "beforeAuthorizedTransfer",
        args: [contractAddress, sourceCollectionAddress],
      });
      console.log("✅ Authorization transaction sent:", authHash);
      
      // Don't wait for confirmation - send mint immediately to try to get both in same block
      // This maximizes chance of authorization still being valid
      console.log("🔄 Step 2: Minting immediately (authorization should persist)...");
      console.log("⚠️ WARNING: Authorization may expire if transactions are in different blocks!");
    } catch (err: any) {
      console.error("❌ Authorization failed:", err);
      throw new Error(`Authorization failed: ${err.message || err.toString()}`);
    }
    
    // Mint immediately after authorization (without waiting)
    const txHash = await writeContractAsync({
      address: contractAddress,
      abi: simpleGridStakerConfig.abi,
      functionName: "mintGrid",
      args: [tokenIds],
    });
    console.log("✅ Mint transaction sent:", txHash);
    
    // Wait for mint transaction receipt to check if it succeeded
    if (publicClient) {
      try {
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
        if (receipt.status === "success") {
          console.log("✅ Mint transaction confirmed successfully!");
        } else {
          console.error("❌ Mint transaction failed on-chain. Status:", receipt.status);
          throw new Error("Mint transaction failed on-chain. Authorization may have expired between transactions. Check ApeScan for details.");
        }
      } catch (err: any) {
        console.error("❌ Error waiting for transaction:", err);
        if (err.message?.includes("reverted")) {
          throw new Error("Mint transaction reverted. Authorization may have expired if transactions were in different blocks. Try again - sometimes both transactions land in the same block.");
        }
        throw err;
      }
    }
    
    return txHash;
  };

  return {
    mintGrid,
    hash,
    isPending: isPending || isConfirming,
  };
}

/**
 * Hook for unbinding a simple grid
 */
export function useUnbindSimpleGrid() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const unbind = async (gridId: bigint) => {
    const txHash = await writeContractAsync({
      address: simpleGridStakerConfig.address,
      abi: simpleGridStakerConfig.abi,
      functionName: "unbind",
      args: [gridId],
    });
    return txHash;
  };

  return {
    unbind,
    hash,
    isPending: isPending || isConfirming,
    isSuccess: hash !== undefined,
  };
}


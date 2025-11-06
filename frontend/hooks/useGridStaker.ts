import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { Address, encodeFunctionData } from "viem";
import { gridStakerConfig, sourceCollectionAddress, ngtTokenAddress, ERC20_ABI } from "../lib/contracts/gridStaker";

/**
 * Hook to check if MineBoy collection is approved for GridStaker
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
    args: owner ? [owner, gridStakerConfig.address] : undefined,
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
 * Hook to check if NGT is approved for GridStaker
 */
export function useIsNGTApproved() {
  const { address: owner } = useAccount();

  const { data: allowance, isLoading } = useReadContract({
    address: ngtTokenAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: owner ? [owner, gridStakerConfig.address] : undefined,
    query: {
      enabled: !!owner,
    },
  });

  // Consider approved if allowance is very large (max uint256 or sufficient amount)
  const isApproved = allowance !== undefined && allowance > 1000000n * 10n ** 18n;

  return {
    isApproved,
    isLoading,
  };
}

/**
 * Hook to read NGT price from GridStaker contract
 */
export function useNGTPrice() {
  const { data: price, isLoading } = useReadContract({
    ...gridStakerConfig,
    functionName: "erc20Price",
    args: [ngtTokenAddress],
  });

  return {
    price: price as bigint | undefined,
    isSet: price !== undefined && price !== null && price > 0n,
    isLoading,
  };
}

/**
 * Hook for minting a grid
 * Uses validator.approve() with expiration to authorize transfers
 */
export function useMintGrid() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  const { address: owner } = useAccount();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const mintGrid = async (
    rows: number,
    cols: number,
    tokenIds: bigint[],
    cellIndices: number[]
  ) => {
    if (!publicClient) {
      throw new Error("Public client not available");
    }

    const contractAddress = gridStakerConfig.address;
    const validatorAddress = "0x721C008fdff27BF06E7E123956E2Fe03B63342e3" as `0x${string}`;

    // Check approvals (non-blocking, just for logging)
    if (owner) {
      try {
        console.log("🔍 Checking approvals...");
        const [nftApproved, ngtAllowance] = await Promise.all([
          publicClient.readContract({
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
          }).catch(() => null),
          publicClient.readContract({
            address: ngtTokenAddress,
            abi: ERC20_ABI,
            functionName: "allowance",
            args: [owner, contractAddress],
          }).catch(() => null),
        ]);
        console.log(`📝 NFT Approval: ${nftApproved ? "✅" : "❌"}`);
        if (ngtAllowance !== null) {
          const ngtApproved = ngtAllowance > 1000000n * 10n ** 18n;
          console.log(`💰 NGT Approval: ${ngtApproved ? "✅" : "❌"} (${ngtAllowance.toString()})`);
        }
      } catch (error) {
        console.warn("⚠️ Could not check approvals:", error);
      }
    }

    // GridStaker now handles authorization internally (if validator is set)
    // No need for separate authorization transaction - it's all atomic now!
    // This solves both the authorization expiration issue AND wallet freezing
    console.log("🔄 Minting grid (GridStaker handles authorization internally - atomic!)...");
    const txHash = await writeContractAsync({
      address: contractAddress,
      abi: gridStakerConfig.abi,
      functionName: "mintGrid20",
      args: [
        ngtTokenAddress,
        rows,
        cols,
        tokenIds,
        cellIndices,
      ],
    });
    console.log("✅ Mint transaction sent:", txHash);
    
    return txHash;
  };

  return {
    mintGrid,
    hash,
    isPending: isPending || isConfirming,
  };
}

/**
 * Hook for unbinding a grid
 * Burns the grid NFT and returns staked tokens
 */
export function useUnbind() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const unbind = async (gridId: bigint) => {
    const txHash = await writeContractAsync({
      ...gridStakerConfig,
      functionName: "unbind",
      args: [gridId],
    });

    return txHash;
  };

  return {
    unbind,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
  };
}

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from "wagmi";
import { Address, parseEventLogs } from "viem";
import { collageStakerConfig, sourceCollectionAddress } from "../lib/contracts/collageStaker";

/**
 * Hook for reading CollageStaker contract data
 */
export function useCollageStakerReads(collageId?: bigint) {
  const { address: owner } = useAccount();

  // Read balance of owner
  const { data: balance, isLoading: balanceLoading } = useReadContract({
    ...collageStakerConfig,
    functionName: "balanceOf",
    args: owner ? [owner] : undefined,
    query: {
      enabled: !!owner,
    },
  });

  // Read underlying NFTs for a specific collage
  const { data: underlying, isLoading: underlyingLoading } = useReadContract({
    ...collageStakerConfig,
    functionName: "getUnderlying",
    args: collageId !== undefined ? [collageId] : undefined,
    query: {
      enabled: collageId !== undefined,
    },
  });

  // Read tokenURI for a specific collage
  const { data: tokenURI, isLoading: tokenURILoading } = useReadContract({
    ...collageStakerConfig,
    functionName: "tokenURI",
    args: collageId !== undefined ? [collageId] : undefined,
    query: {
      enabled: collageId !== undefined,
    },
  });

  return {
    balance: balance as bigint | undefined,
    underlying: underlying as
      | [Address, number, number, bigint[]]
      | undefined,
    tokenURI: tokenURI as string | undefined,
    isLoading: balanceLoading || underlyingLoading || tokenURILoading,
  };
}

/**
 * Hook for minting a collage
 * Handles approval and minting in one flow
 */
export function useMintCollage() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mintCollage = async (rows: number, cols: number, tokenIds: bigint[]) => {
    // First, set approval for all if not already approved
    // Note: In production, you'd want to check if approval is already granted
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
      args: [collageStakerConfig.address, true],
    });

    // Then mint the collage
    const txHash = await writeContractAsync({
      ...collageStakerConfig,
      functionName: "mintCollage",
      args: [rows, cols, tokenIds],
    });

    return txHash;
  };

  return {
    mintCollage,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
  };
}

/**
 * Hook for setting a snapshot on a collage
 */
export function useSetSnapshot() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const setSnapshot = async (collageId: bigint, pngBytes: `0x${string}`) => {
    const txHash = await writeContractAsync({
      ...collageStakerConfig,
      functionName: "setSnapshot",
      args: [collageId, pngBytes],
    });

    return txHash;
  };

  return {
    setSnapshot,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
  };
}

/**
 * Hook for unbinding a collage
 * Burns the collage NFT and returns staked tokens
 */
export function useUnbind() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const unbind = async (collageId: bigint) => {
    const txHash = await writeContractAsync({
      ...collageStakerConfig,
      functionName: "unbind",
      args: [collageId],
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

/**
 * Hook to check if source collection is approved for CollageStaker
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
    args: owner ? [owner, collageStakerConfig.address] : undefined,
    query: {
      enabled: !!owner,
    },
  });

  return {
    isApproved: isApproved as boolean | undefined,
    isLoading,
  };
}


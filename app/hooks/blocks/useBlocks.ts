import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Address, encodeFunctionData, parseAbi } from "viem";
import { blockTokenConfig, blockVaultConfig, blockHubConfig } from "../../lib/contracts/blocks";

// Writers
export function useCreateRoot() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createRoot = async (collection: Address, label: string) => {
    return await writeContractAsync({
      ...blockHubConfig,
      functionName: "createRoot",
      args: [collection, label],
    });
  };

  return { createRoot, hash, isPending: isPending || isConfirming, isSuccess };
}

export function useSetGlobalRootCreationOpen() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setGlobalRootCreationOpen = async (value: boolean) => {
    return await writeContractAsync({
      ...blockHubConfig,
      functionName: "setGlobalRootCreationOpen",
      args: [value],
    });
  };

  return { setGlobalRootCreationOpen, hash, isPending: isPending || isConfirming, isSuccess };
}

export function useSetPriceETH() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setPriceETH = async (rootId: bigint, weiPrice: bigint) => {
    return await writeContractAsync({
      ...blockHubConfig,
      functionName: "setPriceETH",
      args: [rootId, weiPrice],
    });
  };

  return { setPriceETH, hash, isPending: isPending || isConfirming, isSuccess };
}

export function useSetPrice20() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setPrice20 = async (rootId: bigint, token: Address, weiPrice: bigint) => {
    return await writeContractAsync({
      ...blockHubConfig,
      functionName: "setPrice20",
      args: [rootId, token, weiPrice],
    });
  };

  return { setPrice20, hash, isPending: isPending || isConfirming, isSuccess };
}

export function useSetAllowed20() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setAllowed20 = async (rootId: bigint, token: Address, allowed: boolean) => {
    return await writeContractAsync({
      ...blockHubConfig,
      functionName: "setAllowed20",
      args: [rootId, token, allowed],
    });
  };

  return { setAllowed20, hash, isPending: isPending || isConfirming, isSuccess };
}

export function useCreateSchedule() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createSchedule = async (
    rootId: bigint,
    openAt: bigint,
    closeAt: bigint,
    lockDur: number,
    coolDur: number
  ) => {
    return await writeContractAsync({
      ...blockHubConfig,
      functionName: "createSchedule",
      args: [rootId, openAt, closeAt, lockDur, coolDur],
    });
  };

  return { createSchedule, hash, isPending: isPending || isConfirming, isSuccess };
}

export function useSetScheduleActive() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setScheduleActive = async (rootId: bigint, scheduleId: bigint, active: boolean) => {
    return await writeContractAsync({
      ...blockHubConfig,
      functionName: "setScheduleActive",
      args: [rootId, scheduleId, active],
    });
  };

  return { setScheduleActive, hash, isPending: isPending || isConfirming, isSuccess };
}

export function useMintBlockETH() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const mintBlockETH = async (
    rootId: bigint,
    rows: number,
    cols: number,
    items: Array<{ collection: Address; tokenId: bigint; cell: number }>,
    scheduleIdOpt: bigint,
    value?: bigint
  ) => {
    return await writeContractAsync({
      ...blockHubConfig,
      functionName: "mintBlockETH",
      args: [rootId, rows, cols, items, scheduleIdOpt],
      value: value ?? 0n,
    });
  };

  return { mintBlockETH, hash, isPending: isPending || isConfirming, isSuccess };
}

export function useMintBlock20() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const mintBlock20 = async (
    rootId: bigint,
    token20: Address,
    rows: number,
    cols: number,
    items: Array<{ collection: Address; tokenId: bigint; cell: number }>,
    scheduleIdOpt: bigint
  ) => {
    return await writeContractAsync({
      ...blockHubConfig,
      functionName: "mintBlock20",
      args: [rootId, token20, rows, cols, items, scheduleIdOpt],
    });
  };

  return { mintBlock20, hash, isPending: isPending || isConfirming, isSuccess };
}

export function useSetSnapshotCid() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setSnapshotCID = async (
    id: bigint,
    cid: Uint8Array,
    width: number,
    height: number,
    hash: `0x${string}`
  ) => {
    return await writeContractAsync({
      ...blockVaultConfig,
      functionName: "setSnapshotCID",
      args: [id, cid, width, height, hash],
    });
  };

  return { setSnapshotCID, hash, isPending: isPending || isConfirming, isSuccess };
}

export function useStartCooldown() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const startCooldown = async (id: bigint) => {
    return await writeContractAsync({
      ...blockVaultConfig,
      functionName: "startCooldown",
      args: [id],
    });
  };

  return { startCooldown, hash, isPending: isPending || isConfirming, isSuccess };
}

export function useUnblock() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const unblock = async (id: bigint) => {
    return await writeContractAsync({
      ...blockVaultConfig,
      functionName: "unblock",
      args: [id],
    });
  };

  return { unblock, hash, isPending: isPending || isConfirming, isSuccess };
}

export function useEmergencyUnblock() {
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const emergencyUnblock = async (id: bigint) => {
    return await writeContractAsync({
      ...blockVaultConfig,
      functionName: "emergencyUnblock",
      args: [id],
    });
  };

  return { emergencyUnblock, hash, isPending: isPending || isConfirming, isSuccess };
}

// Readers
export function useGetRoot(rootId?: bigint) {
  const { data, isLoading } = useReadContract({
    ...blockHubConfig,
    functionName: "getRoot",
    args: rootId !== undefined ? [rootId] : undefined,
    query: { enabled: rootId !== undefined },
  });

  return { root: data as { collection: Address; label: string; creator: Address; priceETH: bigint } | undefined, isLoading };
}

export function useGetPrice20(rootId?: bigint, token?: Address) {
  const { data, isLoading } = useReadContract({
    ...blockHubConfig,
    functionName: "getPrice20",
    args: rootId !== undefined && token !== undefined ? [rootId, token] : undefined,
    query: { enabled: rootId !== undefined && token !== undefined },
  });

  return { price: data as bigint | undefined, isLoading };
}

export function useIsTokenAllowed(rootId?: bigint, token?: Address) {
  const { data, isLoading } = useReadContract({
    ...blockHubConfig,
    functionName: "isTokenAllowed",
    args: rootId !== undefined && token !== undefined ? [rootId, token] : undefined,
    query: { enabled: rootId !== undefined && token !== undefined },
  });

  return { allowed: data as boolean | undefined, isLoading };
}

export function useGetBlockMeta(id?: bigint) {
  const { data, isLoading } = useReadContract({
    ...blockVaultConfig,
    functionName: "getBlockMeta",
    args: id !== undefined ? [id] : undefined,
    query: { enabled: id !== undefined },
  });

  return { meta: data, isLoading };
}

export function useGetItems(id?: bigint) {
  const { data, isLoading } = useReadContract({
    ...blockVaultConfig,
    functionName: "getItems",
    args: id !== undefined ? [id] : undefined,
    query: { enabled: id !== undefined },
  });

  return { items: data as [Address[], bigint[], number[]] | undefined, isLoading };
}

export function useGetSnapshot(id?: bigint) {
  const { data, isLoading } = useReadContract({
    ...blockVaultConfig,
    functionName: "getSnapshot",
    args: id !== undefined ? [id] : undefined,
    query: { enabled: id !== undefined },
  });

  return { snapshot: data as [Uint8Array, number, number, `0x${string}`] | undefined, isLoading };
}

export function useRoyaltyInfo(salePrice?: bigint) {
  const { data, isLoading } = useReadContract({
    ...blockTokenConfig,
    functionName: "royaltyInfo",
    args: salePrice !== undefined ? [0n, salePrice] : undefined,
    query: { enabled: salePrice !== undefined },
  });

  return { royalty: data as [Address, bigint] | undefined, isLoading };
}


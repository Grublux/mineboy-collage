import { createPublicClient, http, getAddress, type Hex } from 'viem';
import { apechain } from '@/frontend/lib/chain';
import erc721ABI from '@/frontend/abi/erc721.json';

const ERC721_ENUMERABLE_IFACE = '0x780e9d63';

export async function isEnumerable(collection: `0x${string}`) {
  const client = createPublicClient({ chain: apechain, transport: http() });
  try {
    const res = await client.readContract({
      address: getAddress(collection),
      abi: erc721ABI,
      functionName: 'supportsInterface',
      args: [ERC721_ENUMERABLE_IFACE as Hex],
    });
    return !!res;
  } catch {
    return false; // many contracts don't expose supportsInterface
  }
}

export async function ownerTokensEnumerable({
  collection,
  owner,
  max = 500n,
}: {
  collection: `0x${string}`;
  owner: `0x${string}`;
  max?: bigint;
}) {
  const client = createPublicClient({ chain: apechain, transport: http() });
  const balance = (await client.readContract({
    address: collection,
    abi: erc721ABI,
    functionName: 'balanceOf',
    args: [owner],
  })) as bigint;

  const n = balance > max ? max : balance;
  const calls = [...Array(Number(n))].map((_, i) => ({
    address: collection,
    abi: erc721ABI,
    functionName: 'tokenOfOwnerByIndex',
    args: [owner, BigInt(i)],
  }));

  const res = await client.multicall({ contracts: calls as any });
  return res
    .filter((r: any) => r.status === 'success')
    .map((r: any) => r.result as bigint);
}


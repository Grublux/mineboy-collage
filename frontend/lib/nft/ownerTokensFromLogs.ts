import { createPublicClient, http, getAddress } from 'viem';
import { apechain } from '@/frontend/lib/chain';
import erc721ABI from '@/frontend/abi/erc721.json';

// keccak256("Transfer(address,address,uint256)")
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

export async function ownerTokensFromLogs({
  collection,
  owner,
  fromBlock,
  toBlock,
  chunk = 50_000n,
}: {
  collection: `0x${string}`;
  owner: `0x${string}`;
  fromBlock: bigint;
  toBlock: bigint;
  chunk?: bigint;
}) {
  const client = createPublicClient({ chain: apechain, transport: http() });
  const addr = getAddress(collection);
  const me = getAddress(owner);

  const held = new Set<string>();

  // Helper to paginate logs
  async function getLogsPaged(filter: any, label: string) {
    const logs: any[] = [];
    const totalBlocks = toBlock - fromBlock + 1n;
    let processed = 0n;
    
    for (let start = fromBlock; start <= toBlock; start += chunk) {
      const end = start + chunk - 1n > toBlock ? toBlock : start + chunk - 1n;
      processed += (end - start + 1n);
      const percent = Math.floor(Number((processed * 100n) / totalBlocks));
      console.log(`📊 ${label}: ${percent}% (blocks ${start.toLocaleString()} → ${end.toLocaleString()})`);
      
      try {
        const part = await client.getLogs({ ...filter, fromBlock: start, toBlock: end });
        if (part.length > 0) {
          console.log(`  ✓ Found ${part.length} ${label} events`);
        }
        logs.push(...part);
      } catch (err) {
        console.warn(`  ✗ Failed to get logs for blocks ${start}-${end}:`, err);
        // Continue to next chunk
      }
    }
    return logs;
  }

  console.log(`🔍 Scanning Transfer logs from block ${fromBlock.toLocaleString()} → ${toBlock.toLocaleString()}`);
  
  // Inbound: Transfer(any → owner, tokenId)
  const inbound = await getLogsPaged({
    address: addr,
    topics: [
      TRANSFER_TOPIC,
      null,
      // topic2 = indexed "to"
      `0x000000000000000000000000${me.slice(2).toLowerCase()}` as `0x${string}`,
    ],
  }, 'Inbound transfers');

  inbound.forEach(log => {
    if (log.topics && log.topics[3]) {
      const tokenId = BigInt(log.topics[3]);
      held.add(tokenId.toString());
    }
  });

  console.log(`✅ Inbound scan complete: ${inbound.length} transfers found, ${held.size} unique tokens received`);

  // Outbound: Transfer(owner → any, tokenId)
  const outbound = await getLogsPaged({
    address: addr,
    topics: [
      TRANSFER_TOPIC,
      // topic1 = indexed "from"
      `0x000000000000000000000000${me.slice(2).toLowerCase()}` as `0x${string}`,
    ],
  }, 'Outbound transfers');

  outbound.forEach(log => {
    if (log.topics && log.topics[3]) {
      const tokenId = BigInt(log.topics[3]);
      held.delete(tokenId.toString());
    }
  });

  console.log(`✅ Outbound scan complete: ${outbound.length} transfers found`);
  console.log(`🎯 Current holdings: ${held.size} tokens after reconciling transfers`);

  // Optional final sanity: verify with ownerOf (batched)
  const tokenIds = [...held].map(s => BigInt(s));
  if (tokenIds.length) {
    console.log(`🔐 Verifying ownership with ownerOf multicall...`);
    const calls = tokenIds.map(id => ({
      address: addr,
      abi: erc721ABI,
      functionName: 'ownerOf',
      args: [id],
    }));

    try {
      const res = await client.multicall({ contracts: calls as any });
      const verified = res
        .map((r: any, i: number) => ({
          tokenId: tokenIds[i],
          owned: r.status === 'success' && (r.result as string).toLowerCase() === me.toLowerCase()
        }))
        .filter(t => t.owned)
        .map(t => t.tokenId);
      
      console.log(`✅ Verification complete: ${verified.length}/${tokenIds.length} tokens confirmed owned`);
      return verified;
    } catch (err) {
      console.warn('⚠️ Failed to verify ownerOf, returning unverified list:', err);
      return tokenIds;
    }
  }

  console.log(`ℹ️ No tokens found in transfer history`);
  return tokenIds;
}


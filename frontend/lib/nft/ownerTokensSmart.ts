import { isEnumerable, ownerTokensEnumerable } from './ownerTokens';
import { ownerTokensFromLogs } from './ownerTokensFromLogs';
import { createPublicClient, http } from 'viem';
import { apechain } from '@/frontend/lib/chain';

export async function getOwnerTokensSmart({
  collection,
  owner,
  creationBlock,
}: {
  collection: `0x${string}`;
  owner: `0x${string}`;
  creationBlock: bigint;
}) {
  console.log('Checking if collection is enumerable...');
  
  if (await isEnumerable(collection)) {
    console.log('Collection is enumerable, using tokenOfOwnerByIndex...');
    try {
      return await ownerTokensEnumerable({ collection, owner });
    } catch (err) {
      console.warn('Enumerable path failed, falling back to logs:', err);
      // fall through to logs if enumerable still fails
    }
  } else {
    console.log('Collection is NOT enumerable, using Transfer logs...');
  }

  // Non-enumerable or failed enumerable path
  const client = createPublicClient({ chain: apechain, transport: http() });
  const latest = await client.getBlockNumber();

  return ownerTokensFromLogs({
    collection,
    owner,
    fromBlock: creationBlock,
    toBlock: latest,
  });
}


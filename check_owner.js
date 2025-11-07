const { createPublicClient, http } = require('viem');

const apechain = {
  id: 33139,
  name: 'ApeChain',
  network: 'apechain',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: { default: { http: ['https://apechain.calderachain.xyz/http'] } },
};

const client = createPublicClient({ chain: apechain, transport: http() });

const COLLECTION = '0xa8A16C3259aD84162a0868E7927523B81eF8BF2D';
const USER = '0x634989990acb7F95d07Ac09a6c35491Ac8dFa3Cf';
const TOKEN_IDS = [370n, 1030n, 2549n, 1283n];

async function checkOwnership() {
  console.log('\n🔍 Checking token ownership:');
  for (const tokenId of TOKEN_IDS) {
    try {
      const owner = await client.readContract({
        address: COLLECTION,
        abi: [{ inputs: [{ name: 'tokenId', type: 'uint256' }], name: 'ownerOf', outputs: [{ name: '', type: 'address' }], stateMutability: 'view', type: 'function' }],
        functionName: 'ownerOf',
        args: [tokenId],
      });
      const isOwner = owner.toLowerCase() === USER.toLowerCase();
      console.log(`  Token ${tokenId}: ${isOwner ? '✅ Owned' : '❌ NOT OWNED'} (owner: ${owner})`);
    } catch (err) {
      console.log(`  Token ${tokenId}: ❌ Error - ${err.message}`);
    }
  }
}

checkOwnership();

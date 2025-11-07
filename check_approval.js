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
const GRID_STAKER = '0xECef7AA17077e4a8f86F734fCbfa0E608122D09a';
const USER = '0x634989990acb7F95d07Ac09a6c35491Ac8dFa3Cf';
const TOKEN_IDS = [370n, 1030n, 2549n, 1283n];

async function checkApproval() {
  console.log('🔍 Checking MineBoy approval:\n');
  
  try {
    const approved = await client.readContract({
      address: COLLECTION,
      abi: [{ inputs: [{ name: 'owner', type: 'address' }, { name: 'operator', type: 'address' }], name: 'isApprovedForAll', outputs: [{ name: '', type: 'bool' }], stateMutability: 'view', type: 'function' }],
      functionName: 'isApprovedForAll',
      args: [USER, GRID_STAKER],
    });
    console.log('MineBoy Approval:', approved ? '✅ Approved' : '❌ NOT APPROVED');
  } catch (err) {
    console.log('Approval check failed:', err.message);
  }
  
  console.log('\n🔍 Checking individual token ownership:');
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

checkApproval();

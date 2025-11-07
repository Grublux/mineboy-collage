const { createPublicClient, http, formatUnits } = require('viem');

const apechain = {
  id: 33139,
  name: 'ApeChain',
  network: 'apechain',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: { default: { http: ['https://apechain.calderachain.xyz/http'] } },
};

const client = createPublicClient({ chain: apechain, transport: http() });

const GRID_STAKER = '0xECef7AA17077e4a8f86F734fCbfa0E608122D09a';
const USER = '0x634989990acb7F95d07Ac09a6c35491Ac8dFa3Cf';
const NGT_TOKEN = '0x72CddB64A72176B442bdfD9C8Bb7968E652d8D1a';
const COLLECTION = '0xa8A16C3259aD84162a0868E7927523B81eF8BF2D';
const TOKEN_IDS = [370n, 1030n, 2549n, 1283n];

const GridStakerABI = require('./frontend/abi/GridStaker.json');

async function diagnose() {
  console.log('🔍 Diagnosing transaction failure...\n');
  
  // Check if contract is paused
  try {
    const paused = await client.readContract({
      address: GRID_STAKER,
      abi: GridStakerABI,
      functionName: 'paused',
    });
    console.log('Contract paused?', paused ? '❌ YES (this would block minting)' : '✅ NO');
  } catch (err) {
    console.log('Could not check pause status:', err.message);
  }
  
  // Check NGT allowance
  try {
    const allowance = await client.readContract({
      address: NGT_TOKEN,
      abi: [{ inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], name: 'allowance', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' }],
      functionName: 'allowance',
      args: [USER, GRID_STAKER],
    });
    console.log('NGT Allowance:', formatUnits(allowance, 18), 'NGT');
    console.log('Required:', '3333 NGT');
    console.log('Status:', allowance >= 3333n * 10n ** 18n ? '✅ SUFFICIENT' : '❌ INSUFFICIENT');
  } catch (err) {
    console.log('Could not check allowance:', err.message);
  }
  
  // Check if NFTs are still owned by user
  console.log('\nChecking NFT ownership:');
  for (const tokenId of TOKEN_IDS) {
    try {
      const owner = await client.readContract({
        address: COLLECTION,
        abi: [{ inputs: [{ name: 'tokenId', type: 'uint256' }], name: 'ownerOf', outputs: [{ name: '', type: 'address' }], stateMutability: 'view', type: 'function' }],
        functionName: 'ownerOf',
        args: [tokenId],
      });
      const isOwned = owner.toLowerCase() === USER.toLowerCase();
      console.log(`Token ${tokenId}: ${isOwned ? '✅ Still owned by you' : '❌ Owned by ' + owner}`);
    } catch (err) {
      console.log(`Token ${tokenId}: Could not check - ${err.message}`);
    }
  }
  
  // Check if any NFTs ended up in the contract (partial transfer)
  console.log('\nChecking if any NFTs are in GridStaker contract:');
  for (const tokenId of TOKEN_IDS) {
    try {
      const owner = await client.readContract({
        address: COLLECTION,
        abi: [{ inputs: [{ name: 'tokenId', type: 'uint256' }], name: 'ownerOf', outputs: [{ name: '', type: 'address' }], stateMutability: 'view', type: 'function' }],
        functionName: 'ownerOf',
        args: [tokenId],
      });
      if (owner.toLowerCase() === GRID_STAKER.toLowerCase()) {
        console.log(`⚠️  Token ${tokenId} is stuck in GridStaker contract!`);
      }
    } catch (err) {
      // Ignore
    }
  }
  
  console.log('\n📋 View failed transaction on ApeScan:');
  console.log('https://apescan.io/tx/0xa0094e78dfbbfbfb601c2fe5cae5bc7ae31d83b06d16017dd6a3e0fe6ccbddd8');
}

diagnose();

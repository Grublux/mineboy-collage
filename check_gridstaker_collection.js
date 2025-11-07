const { createPublicClient, http } = require('viem');

const apechain = {
  id: 33139,
  name: 'ApeChain',
  network: 'apechain',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: { default: { http: ['https://apechain.calderachain.xyz/http'] } },
};

const client = createPublicClient({ chain: apechain, transport: http() });

const GRID_STAKER = '0xECef7AA17077e4a8f86F734fCbfa0E608122D09a';
const MINEBOY = '0xa8A16C3259aD84162a0868E7927523B81eF8BF2D';

const GridStakerABI = require('./frontend/abi/GridStaker.json');

async function checkCollection() {
  console.log('🔍 Checking GridStaker contract configuration...\n');
  
  try {
    // Check what collection address is stored in GridStaker
    // GridStaker has a public `collection` variable
    const collection = await client.readContract({
      address: GRID_STAKER,
      abi: GridStakerABI,
      functionName: 'collection',
    });
    
    console.log('GridStaker.collection:', collection);
    console.log('Expected MineBoy:', MINEBOY);
    console.log('Match?', collection.toLowerCase() === MINEBOY.toLowerCase() ? '✅ YES' : '❌ NO');
    
    if (collection.toLowerCase() !== MINEBOY.toLowerCase()) {
      console.log('\n⚠️  ISSUE FOUND!');
      console.log('   GridStaker was deployed with a different collection address!');
      console.log(`   Deployed with: ${collection}`);
      console.log(`   Expected: ${MINEBOY}`);
    }
    
  } catch (err) {
    console.log('Error reading collection:', err.message);
    
    // Try alternative - check via getUnderlying if we have a grid
    console.log('\nTrying alternative method...');
    try {
      // Try to get grid #1 if it exists
      const underlying = await client.readContract({
        address: GRID_STAKER,
        abi: GridStakerABI,
        functionName: 'getUnderlying',
        args: [1n],
      });
      console.log('Grid #1 underlying collection:', underlying[0]);
    } catch {
      console.log('No grids exist yet');
    }
  }
}

checkCollection();

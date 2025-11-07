const { createPublicClient, http, decodeErrorResult } = require('viem');

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

// Import ABI
const GridStakerABI = require('./frontend/abi/GridStaker.json');

async function simulateFullMint() {
  console.log('🔍 Simulating full mintGrid20 call...\n');
  
  try {
    const result = await client.simulateContract({
      account: USER,
      address: GRID_STAKER,
      abi: GridStakerABI,
      functionName: 'mintGrid20',
      args: [
        NGT_TOKEN,
        2,
        2,
        [370n, 1030n, 2549n, 1283n],
        [0, 1, 2, 3],
      ],
    });
    console.log('✅ Full simulation succeeded!');
    console.log('Result:', result);
  } catch (err) {
    console.log('❌ Full simulation failed');
    console.log('Error:', err.message);
    
    // Try to get more details
    if (err.cause?.reason) {
      console.log('\n📋 Revert reason:', err.cause.reason);
    }
    
    if (err.cause?.data) {
      console.log('\n📋 Error data:', err.cause.data);
      try {
        const decoded = decodeErrorResult({
          abi: GridStakerABI,
          data: err.cause.data,
        });
        console.log('📋 Decoded error:', decoded);
      } catch (decodeErr) {
        console.log('📋 Could not decode (might be from external contract)');
        console.log('📋 Error signature:', err.cause.data?.slice(0, 10));
      }
    }
    
    // Check if it's an ERC20 error
    if (err.message?.includes('allowance') || err.cause?.reason?.includes('allowance')) {
      console.log('\n💡 TIP: This is an ERC20 allowance error.');
      console.log('   Even though allowance shows as sufficient, the simulation might be checking');
      console.log('   at a different block state. Try approving again or wait for next block.');
    }
  }
}

simulateFullMint();

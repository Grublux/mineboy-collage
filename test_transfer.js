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

async function testTransfers() {
  console.log('🔍 Testing NFT transfers:\n');
  
  for (const tokenId of TOKEN_IDS) {
    try {
      // Try to simulate transferFrom
      const result = await client.simulateContract({
        account: USER,
        address: COLLECTION,
        abi: [{
          name: 'safeTransferFrom',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'tokenId', type: 'uint256' },
          ],
          outputs: [],
        }],
        functionName: 'safeTransferFrom',
        args: [USER, GRID_STAKER, tokenId],
      });
      console.log(`✅ Token ${tokenId}: Transfer simulation succeeded`);
    } catch (err) {
      console.log(`❌ Token ${tokenId}: Transfer failed - ${err.message}`);
      if (err.data) {
        console.log(`   Error data: ${err.data}`);
      }
    }
  }
}

testTransfers();

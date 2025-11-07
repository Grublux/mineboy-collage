const { createPublicClient, http, decodeFunctionResult } = require('viem');

const apechain = {
  id: 33139,
  name: 'ApeChain',
  network: 'apechain',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: { default: { http: ['https://apechain.calderachain.xyz/http'] } },
};

const client = createPublicClient({ chain: apechain, transport: http() });

const MINEBOY = '0xa8A16C3259aD84162a0868E7927523B81eF8BF2D';
const GRID_STAKER = '0xECef7AA17077e4a8f86F734fCbfa0E608122D09a';

async function checkContract() {
  console.log('🔍 Checking MineBoy contract restrictions...\n');
  
  // Check if it implements onERC721Received
  try {
    // Try to call onERC721Received directly
    const result = await client.readContract({
      address: GRID_STAKER,
      abi: [{
        name: 'onERC721Received',
        type: 'function',
        inputs: [
          { name: 'operator', type: 'address' },
          { name: 'from', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
          { name: 'data', type: 'bytes' },
        ],
        outputs: [{ name: '', type: 'bytes4' }],
        stateMutability: 'view',
      }],
      functionName: 'onERC721Received',
      args: [MINEBOY, '0x634989990acb7F95d07Ac09a6c35491Ac8dFa3Cf', 370n, '0x'],
    });
    console.log('✅ GridStaker onERC721Received returns:', result);
  } catch (err) {
    console.log('❌ Error calling onERC721Received:', err.message);
  }
  
  // Check if MineBoy has any transfer restrictions
  // Look for common restriction patterns
  console.log('\n📋 Checking for common transfer restriction patterns...');
  
  // Check if there's a whitelist or blacklist
  const commonFunctions = [
    'isWhitelisted',
    'isBlacklisted', 
    'canTransfer',
    'transferAllowed',
    'isApprovedContract',
  ];
  
  for (const func of commonFunctions) {
    try {
      const result = await client.readContract({
        address: MINEBOY,
        abi: [{
          name: func,
          type: 'function',
          inputs: [{ name: 'address', type: 'address' }],
          outputs: [{ name: '', type: 'bool' }],
          stateMutability: 'view',
        }],
        functionName: func,
        args: [GRID_STAKER],
      });
      console.log(`${func}(${GRID_STAKER}):`, result);
    } catch {
      // Function doesn't exist, skip
    }
  }
  
  console.log('\n💡 Recommendation: Check the verified source code on ApeScan');
  console.log('   https://apescan.io/address/' + MINEBOY + '#code');
  console.log('\n   Look for:');
  console.log('   - onERC721Received implementation');
  console.log('   - safeTransferFrom restrictions');
  console.log('   - Any require statements blocking transfers');
}

checkContract();

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

async function checkContract() {
  console.log('🔍 Checking GridStaker contract state:\n');
  
  // Check if paused
  try {
    const paused = await client.readContract({
      address: GRID_STAKER,
      abi: [{ inputs: [], name: 'paused', outputs: [{ name: '', type: 'bool' }], stateMutability: 'view', type: 'function' }],
      functionName: 'paused',
    });
    console.log('Paused:', paused, paused ? '❌ CONTRACT IS PAUSED' : '✅ Not paused');
  } catch (err) {
    console.log('Paused check failed:', err.message);
  }
  
  // Check ticket checker
  try {
    const ticketChecker = await client.readContract({
      address: GRID_STAKER,
      abi: [{ inputs: [], name: 'ticketChecker', outputs: [{ name: '', type: 'address' }], stateMutability: 'view', type: 'function' }],
      functionName: 'ticketChecker',
    });
    console.log('Ticket Checker:', ticketChecker === '0x0000000000000000000000000000000000000000' ? '✅ Disabled' : `⚠️ Set to ${ticketChecker}`);
  } catch (err) {
    console.log('Ticket checker check failed:', err.message);
  }
  
  // Check NGT price again
  try {
    const price = await client.readContract({
      address: GRID_STAKER,
      abi: [{ inputs: [{ name: '', type: 'address' }], name: 'erc20Price', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' }],
      functionName: 'erc20Price',
      args: ['0x72CddB64A72176B442bdfD9C8Bb7968E652d8D1a'],
    });
    console.log('NGT Price:', price.toString(), price > 0n ? '✅ Set' : '❌ Not set');
  } catch (err) {
    console.log('Price check failed:', err.message);
  }
}

checkContract();

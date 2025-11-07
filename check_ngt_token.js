const { createPublicClient, http } = require('viem');

const apechain = {
  id: 33139,
  name: 'ApeChain',
  network: 'apechain',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: { default: { http: ['https://apechain.calderachain.xyz/http'] } },
};

const client = createPublicClient({ chain: apechain, transport: http() });

const NGT_TOKEN = '0x72CddB64A72176B442bdfD9C8Bb7968E652d8D1a';
const GRID_STAKER = '0xECef7AA17077e4a8f86F734fCbfa0E608122D09a';
const USER = '0x634989990acb7F95d07Ac09a6c35491Ac8dFa3Cf';
const PRICE = 3333n * 10n ** 18n;

async function checkToken() {
  console.log('🔍 Checking NGT token contract:\n');
  
  // Check if it's a contract
  try {
    const code = await client.getBytecode({ address: NGT_TOKEN });
    console.log('Is contract:', code && code !== '0x' ? '✅ Yes' : '❌ No');
  } catch (err) {
    console.log('Code check failed:', err.message);
  }
  
  // Try to simulate a transferFrom
  try {
    const result = await client.simulateContract({
      account: USER,
      address: NGT_TOKEN,
      abi: [{
        name: 'transferFrom',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
      }],
      functionName: 'transferFrom',
      args: [USER, GRID_STAKER, PRICE],
    });
    console.log('✅ transferFrom simulation succeeded');
  } catch (err) {
    console.log('❌ transferFrom simulation failed:', err.message);
    if (err.cause) {
      console.log('Cause:', err.cause);
    }
  }
}

checkToken();

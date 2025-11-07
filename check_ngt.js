const { createPublicClient, http, formatUnits } = require('viem');

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

async function checkNGT() {
  console.log('🔍 Checking NGT balance and allowance:\n');
  
  try {
    const balance = await client.readContract({
      address: NGT_TOKEN,
      abi: [{ inputs: [{ name: 'account', type: 'address' }], name: 'balanceOf', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' }],
      functionName: 'balanceOf',
      args: [USER],
    });
    console.log('NGT Balance:', formatUnits(balance, 18), 'NGT');
    console.log('Required:', formatUnits(PRICE, 18), 'NGT');
    console.log('Has enough:', balance >= PRICE ? '✅' : '❌');
  } catch (err) {
    console.log('Balance check failed:', err.message);
  }
  
  try {
    const allowance = await client.readContract({
      address: NGT_TOKEN,
      abi: [{ inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], name: 'allowance', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' }],
      functionName: 'allowance',
      args: [USER, GRID_STAKER],
    });
    console.log('\nNGT Allowance:', formatUnits(allowance, 18), 'NGT');
    console.log('Required:', formatUnits(PRICE, 18), 'NGT');
    console.log('Has enough allowance:', allowance >= PRICE ? '✅' : '❌');
  } catch (err) {
    console.log('Allowance check failed:', err.message);
  }
}

checkNGT();

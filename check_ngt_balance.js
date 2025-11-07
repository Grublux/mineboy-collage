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
const USER = '0x634989990acb7F95d07Ac09a6c35491Ac8dFa3Cf';
const PRICE = 3333n * 10n ** 18n;

async function checkBalance() {
  console.log('🔍 Checking your NGT balance:\n');
  
  try {
    const balance = await client.readContract({
      address: NGT_TOKEN,
      abi: [{ inputs: [{ name: 'account', type: 'address' }], name: 'balanceOf', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' }],
      functionName: 'balanceOf',
      args: [USER],
    });
    
    console.log('Your NGT Balance:', formatUnits(balance, 18), 'NGT');
    console.log('Required for Mint:', formatUnits(PRICE, 18), 'NGT');
    console.log('Status:', balance >= PRICE ? '✅ SUFFICIENT' : '❌ INSUFFICIENT');
    
    if (balance < PRICE) {
      console.log('\n⚠️  ISSUE: You don\'t have enough NGT!');
      console.log(`   You need ${formatUnits(PRICE - balance, 18)} more NGT`);
    } else {
      console.log('\n✅ You have enough NGT to mint!');
    }
  } catch (err) {
    console.log('Balance check failed:', err.message);
  }
}

checkBalance();

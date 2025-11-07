const { createPublicClient, http, formatUnits } = require('viem');

const apechain = {
  id: 33139,
  name: 'ApeChain',
  network: 'apechain',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: { default: { http: ['https://apechain.calderachain.xyz/http'] } },
};

const client = createPublicClient({ chain: apechain, transport: http() });

const GRID_STAKER = '0xaDBCBb5C031cF7AEbB09d4fFE8906cfbcDdAd1c0';
const NGT_TOKEN = '0x72CddB64A72176B442bdfD9C8Bb7968E652d8D1a';

const GridStakerABI = require('./frontend/abi/GridStaker.json');

async function verifyPrice() {
  console.log('🔍 Verifying NGT price configuration...\n');
  
  try {
    const price = await client.readContract({
      address: GRID_STAKER,
      abi: GridStakerABI,
      functionName: 'erc20Price',
      args: [NGT_TOKEN],
    });
    
    console.log('NGT Price on contract:', formatUnits(price, 18), 'NGT');
    console.log('Expected:', '3333 NGT');
    console.log('Status:', price === 3333n * 10n ** 18n ? '✅ CORRECT' : '❌ MISMATCH');
    
    if (price === 3333n * 10n ** 18n) {
      console.log('\n✅ Price is correctly configured!');
    } else {
      console.log('\n❌ Price mismatch! Expected 3333 NGT but got', formatUnits(price, 18));
    }
  } catch (err) {
    console.log('Error:', err.message);
  }
}

verifyPrice();

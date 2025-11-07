const { createPublicClient, http } = require('viem');

const apechain = {
  id: 33139,
  name: 'ApeChain',
  network: 'apechain',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: { default: { http: ['https://apechain.calderachain.xyz/http'] } },
};

const client = createPublicClient({ chain: apechain, transport: http() });

const TX_HASH = '0xa0094e78dfbbfbfb601c2fe5cae5bc7ae31d83b06d16017dd6a3e0fe6ccbddd8';

async function check() {
  try {
    const receipt = await client.getTransactionReceipt({ hash: TX_HASH });
    console.log('Status:', receipt.status === 'success' ? '✅ SUCCESS' : '❌ FAILED');
    console.log('Block:', receipt.blockNumber.toString());
    console.log('Gas Used:', receipt.gasUsed.toString());
    
    if (receipt.status === 'reverted') {
      console.log('\n❌ Transaction reverted on-chain');
      console.log('\nPossible reasons:');
      console.log('1. NFT transfer failed (MineBoy contract rejected)');
      console.log('2. NGT allowance insufficient at execution time');
      console.log('3. Contract validation failed (grid size, cell indices, etc.)');
      console.log('4. Contract is paused');
    }
    
    console.log('\n📋 View on ApeScan:');
    console.log('https://apescan.io/tx/' + TX_HASH);
    
  } catch (err) {
    console.log('Error:', err.message);
  }
}

check();

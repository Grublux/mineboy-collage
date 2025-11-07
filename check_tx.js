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

async function checkTx() {
  console.log('🔍 Checking transaction status...\n');
  console.log('Transaction Hash:', TX_HASH);
  console.log('ApeScan Link: https://apescan.io/tx/' + TX_HASH);
  console.log('');
  
  try {
    const receipt = await client.waitForTransactionReceipt({
      hash: TX_HASH,
      timeout: 30000, // 30 seconds
    });
    
    console.log('✅ Transaction confirmed!');
    console.log('Block Number:', receipt.blockNumber.toString());
    console.log('Status:', receipt.status === 'success' ? '✅ SUCCESS' : '❌ FAILED');
    console.log('Gas Used:', receipt.gasUsed.toString());
    
    if (receipt.status === 'success') {
      console.log('\n🎉 Your grid was minted successfully!');
      console.log('View on ApeScan: https://apescan.io/tx/' + TX_HASH);
    } else {
      console.log('\n❌ Transaction failed. Check ApeScan for details.');
    }
  } catch (err) {
    if (err.message?.includes('timeout')) {
      console.log('⏳ Transaction still pending (waiting for confirmation)...');
      console.log('\nThe transaction has been submitted but not yet confirmed.');
      console.log('This can take a few minutes on ApeChain.');
      console.log('\nView on ApeScan: https://apescan.io/tx/' + TX_HASH);
    } else {
      console.log('❌ Error checking transaction:', err.message);
      console.log('\nView on ApeScan: https://apescan.io/tx/' + TX_HASH);
    }
  }
}

checkTx();

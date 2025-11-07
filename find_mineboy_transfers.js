const { createPublicClient, http } = require('viem');

const apechain = {
  id: 33139,
  name: 'ApeChain',
  network: 'apechain',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: { default: { http: ['https://apechain.calderachain.xyz/http'] } },
};

const client = createPublicClient({ chain: apechain, transport: http() });

const MINEBOY = '0xa8A16C3259aD84162a0868E7927523B81eF8BF2D';
const USER = '0x634989990acb7F95d07Ac09a6c35491Ac8dFa3Cf';
const TOKEN_ID = 370n;

async function findTransfers() {
  console.log('🔍 Looking for recent transfers of token 370...\n');
  
  try {
    // Get recent Transfer events for this token
    const latestBlock = await client.getBlockNumber();
    const fromBlock = latestBlock - 10000n; // Last 10k blocks
    
    const logs = await client.getLogs({
      address: MINEBOY,
      event: {
        type: 'event',
        name: 'Transfer',
        inputs: [
          { name: 'from', type: 'address', indexed: true },
          { name: 'to', type: 'address', indexed: true },
          { name: 'tokenId', type: 'uint256', indexed: true },
        ],
      },
      args: {
        tokenId: TOKEN_ID,
      },
      fromBlock,
      toBlock: latestBlock,
    });
    
    console.log(`Found ${logs.length} transfer(s) for token 370:\n`);
    for (const log of logs.slice(-5)) { // Last 5
      console.log(`From: ${log.args.from}`);
      console.log(`To: ${log.args.to}`);
      console.log(`Block: ${log.blockNumber}`);
      console.log(`Tx: https://apescan.io/tx/${log.transactionHash}`);
      console.log('');
    }
    
    if (logs.length > 0) {
      const lastTransfer = logs[logs.length - 1];
      console.log('📋 Most recent transfer details:');
      console.log('   This will show how the token was successfully transferred');
      console.log(`   View: https://apescan.io/tx/${lastTransfer.transactionHash}`);
    }
    
  } catch (err) {
    console.log('Error:', err.message);
  }
}

findTransfers();

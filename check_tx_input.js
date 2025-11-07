const { createPublicClient, http, decodeFunctionData } = require('viem');

const apechain = {
  id: 33139,
  name: 'ApeChain',
  network: 'apechain',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: { default: { http: ['https://apechain.calderachain.xyz/http'] } },
};

const client = createPublicClient({ chain: apechain, transport: http() });

const TX_HASH = '0xa0094e78dfbbfbfb601c2fe5cae5bc7ae31d83b06d16017dd6a3e0fe6ccbddd8';
const GridStakerABI = require('./frontend/abi/GridStaker.json');

async function checkInput() {
  try {
    const tx = await client.getTransaction({ hash: TX_HASH });
    
    console.log('📋 Transaction Input Decoded:\n');
    try {
      const decoded = decodeFunctionData({
        abi: GridStakerABI,
        data: tx.input,
      });
      
      console.log('Function:', decoded.functionName);
      console.log('Args:', JSON.stringify(decoded.args, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));
      
      if (decoded.functionName === 'mintGrid20') {
        const [token, rows, cols, tokenIds, cellIndices] = decoded.args;
        console.log('\nValidation:');
        console.log('- Rows:', rows);
        console.log('- Cols:', cols);
        console.log('- Total cells:', rows * cols);
        console.log('- Token IDs:', tokenIds.map(t => t.toString()));
        console.log('- Cell indices:', cellIndices);
        console.log('- Token count:', tokenIds.length);
        console.log('- Cell count:', cellIndices.length);
        
        // Check for duplicates
        const uniqueCells = new Set(cellIndices);
        if (cellIndices.length !== uniqueCells.size) {
          console.log('\n❌ DUPLICATE CELL INDICES FOUND!');
        }
        
        // Check bounds
        const totalCells = Number(rows) * Number(cols);
        const outOfBounds = cellIndices.filter(c => Number(c) >= totalCells);
        if (outOfBounds.length > 0) {
          console.log('\n❌ OUT OF BOUNDS CELL INDICES:', outOfBounds);
        }
      }
    } catch (decodeErr) {
      console.log('Could not decode:', decodeErr.message);
      console.log('Raw input (first 100 chars):', tx.input.slice(0, 100));
    }
    
  } catch (err) {
    console.log('Error:', err.message);
  }
}

checkInput();

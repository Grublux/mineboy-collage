const { createPublicClient, http, encodeFunctionData } = require('viem');

const apechain = {
  id: 33139,
  name: 'ApeChain',
  network: 'apechain',
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: { default: { http: ['https://apechain.calderachain.xyz/http'] } },
};

const client = createPublicClient({ chain: apechain, transport: http() });

const GRID_STAKER = '0xECef7AA17077e4a8f86F734fCbfa0E608122D09a';
const USER = '0x634989990acb7F95d07Ac09a6c35491Ac8dFa3Cf';
const NGT_TOKEN = '0x72CddB64A72176B442bdfD9C8Bb7968E652d8D1a';

async function simulateMint() {
  try {
    const result = await client.simulateContract({
      account: USER,
      address: GRID_STAKER,
      abi: [{
        name: 'mintGrid20',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'token', type: 'address' },
          { name: 'rows', type: 'uint16' },
          { name: 'cols', type: 'uint16' },
          { name: 'tokenIds', type: 'uint256[]' },
          { name: 'cellIndexOfToken', type: 'uint16[]' },
        ],
        outputs: [{ name: '', type: 'uint256' }],
      }],
      functionName: 'mintGrid20',
      args: [
        NGT_TOKEN,
        2,
        2,
        [370n, 1030n, 2549n, 1283n],
        [0, 1, 2, 3],
      ],
    });
    console.log('✅ Simulation succeeded:', result);
  } catch (err) {
    console.log('❌ Simulation failed:', err.message);
    if (err.cause) {
      console.log('Cause:', err.cause);
    }
  }
}

simulateMint();

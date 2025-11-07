// Check how viem exports waitForTransactionReceipt
const viem = require('viem');
console.log('waitForTransactionReceipt:', typeof viem.waitForTransactionReceipt);
console.log('Available exports:', Object.keys(viem).filter(k => k.includes('wait') || k.includes('receipt')).slice(0, 10));

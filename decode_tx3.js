const data = "0x372bfb9600000000000000000000000072cddb64a72176b442bdfd9c8bb7968e652d8d1a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000172000000000000000000000000000000000000000000000000000000000000040600000000000000000000000000000000000000000000000000000000000009f5000000000000000000000000000000000000000000000000000000000000050300000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003";

// Remove 0x and function selector (first 10 chars = 4 bytes)
const params = data.slice(10);

// Each param is 64 hex chars = 32 bytes
const token = "0x" + params.slice(24, 64); // bytes 4-23 (skip padding)
const rows = parseInt(params.slice(64, 128).slice(-4), 16); // last 2 bytes of uint16
const cols = parseInt(params.slice(128, 192).slice(-4), 16);
const tokenIdsOffset = parseInt(params.slice(192, 256), 16);
const cellOffset = parseInt(params.slice(256, 320), 16);

// tokenIds array starts at offset 0xa0 = 160 bytes = 320 hex chars
const tokenIdsPos = tokenIdsOffset * 2; // convert bytes to hex chars
const tokenIdsLength = parseInt(params.slice(tokenIdsPos, tokenIdsPos + 64), 16);
const tokenIds = [];
for (let i = 0; i < tokenIdsLength; i++) {
  const start = tokenIdsPos + 64 + (i * 64);
  tokenIds.push(BigInt("0x" + params.slice(start, start + 64)));
}

// cellIndexOfToken array starts at offset 0x140 = 320 bytes = 640 hex chars
const cellPos = cellOffset * 2;
const cellLength = parseInt(params.slice(cellPos, cellPos + 64), 16);
const cellIndices = [];
for (let i = 0; i < cellLength; i++) {
  const start = cellPos + 64 + (i * 64);
  const val = parseInt(params.slice(start, start + 64).slice(-4), 16); // uint16 = last 2 bytes
  cellIndices.push(val);
}

console.log("\n📊 Decoded Transaction:");
console.log("  Token:", token);
console.log("  Rows:", rows);
console.log("  Cols:", cols);
console.log("  Total Cells:", rows * cols);
console.log("\n  Token IDs:", tokenIds.map(t => t.toString()).join(", "));
console.log("  Cell Indices:", cellIndices.join(", "));
console.log("\n✅ Validation:");
console.log("  Token count:", tokenIds.length);
console.log("  Cell count:", cellIndices.length);
console.log("  Lengths match:", tokenIds.length === cellIndices.length);
console.log("  Unique cells:", new Set(cellIndices).size === cellIndices.length);
console.log("  All in bounds:", cellIndices.every(c => c >= 0 && c < rows * cols));
console.log("\n🔍 Per-token check:");
tokenIds.forEach((tid, i) => {
  const cell = cellIndices[i];
  const inBounds = cell >= 0 && cell < rows * cols;
  console.log(`  Token ${tid} → Cell ${cell} ${inBounds ? '✅' : '❌ OUT OF BOUNDS'}`);
});

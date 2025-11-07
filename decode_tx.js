// Decode the transaction
const data = "0x372bfb9600000000000000000000000072cddb64a72176b442bdfd9c8bb7968e652d8d1a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000172000000000000000000000000000000000000000000000000000000000000040600000000000000000000000000000000000000000000000000000000000009f5000000000000000000000000000000000000000000000000000000000000050300000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003";

const token = "0x" + data.slice(34, 74);
const rows = parseInt(data.slice(74, 138), 16);
const cols = parseInt(data.slice(138, 202), 16);
const tokenIdsOffset = parseInt(data.slice(202, 266), 16);
const cellOffset = parseInt(data.slice(266, 330), 16);

// Token IDs start at offset 0xa0 (160)
const tokenIdsLength = parseInt(data.slice(330, 394), 16);
const tokenIds = [];
for (let i = 0; i < tokenIdsLength; i++) {
  const start = 330 + (i + 1) * 64;
  const end = start + 64;
  tokenIds.push(BigInt("0x" + data.slice(start, end)));
}

// Cell indices start at offset 0x140 (320)
const cellLength = parseInt(data.slice(394 + tokenIdsLength * 64, 458 + tokenIdsLength * 64), 16);
const cellIndices = [];
const cellStart = 458 + tokenIdsLength * 64;
for (let i = 0; i < cellLength; i++) {
  const start = cellStart + (i + 1) * 64;
  const end = start + 64;
  cellIndices.push(parseInt(data.slice(start, end), 16));
}

console.log("Decoded Transaction:");
console.log("  Token:", token);
console.log("  Rows:", rows);
console.log("  Cols:", cols);
console.log("  Token IDs:", tokenIds.map(t => t.toString()).join(", "));
console.log("  Cell Indices:", cellIndices.join(", "));
console.log("  Total Cells:", rows * cols);
console.log("\nValidation:");
console.log("  Token count:", tokenIds.length);
console.log("  Cell count:", cellIndices.length);
console.log("  Match:", tokenIds.length === cellIndices.length);
console.log("  Unique cells:", new Set(cellIndices).size === cellIndices.length);
console.log("  All cells in bounds:", cellIndices.every(c => c >= 0 && c < rows * cols));

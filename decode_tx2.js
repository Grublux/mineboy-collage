// Decode transaction data properly
const data = "0x372bfb9600000000000000000000000072cddb64a72176b442bdfd9c8bb7968e652d8d1a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000172000000000000000000000000000000000000000000000000000000000000040600000000000000000000000000000000000000000000000000000000000009f5000000000000000000000000000000000000000000000000000000000000050300000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003";

// Function selector: 0x372bfb96 = mintGrid20(address,uint16,uint16,uint256[],uint16[])
// Params start at offset 4 (after selector)

let offset = 4; // Skip function selector

// Read token address (32 bytes)
const token = "0x" + data.slice(offset * 2, (offset + 32) * 2);
offset += 32;

// Read rows (uint16, padded to 32 bytes)
const rows = parseInt(data.slice(offset * 2 + 60, (offset + 32) * 2), 16);
offset += 32;

// Read cols (uint16, padded to 32 bytes)
const cols = parseInt(data.slice(offset * 2 + 60, (offset + 32) * 2), 16);
offset += 32;

// Read tokenIds array offset (uint256)
const tokenIdsOffset = parseInt(data.slice(offset * 2, (offset + 32) * 2), 16);
offset += 32;

// Read cellIndexOfToken array offset (uint256)
const cellOffset = parseInt(data.slice(offset * 2, (offset + 32) * 2), 16);

// Parse tokenIds array (starts at offset 0xa0 = 160 bytes = position 80 in hex)
const tokenIdsStart = tokenIdsOffset * 2;
const tokenIdsLength = parseInt(data.slice(tokenIdsStart, tokenIdsStart + 64), 16);
const tokenIds = [];
for (let i = 0; i < tokenIdsLength; i++) {
  const start = tokenIdsStart + 64 + (i * 64);
  const end = start + 64;
  tokenIds.push(BigInt("0x" + data.slice(start, end)));
}

// Parse cellIndexOfToken array (starts at offset 0x140 = 320 bytes = position 160 in hex)
const cellStart = cellOffset * 2;
const cellLength = parseInt(data.slice(cellStart, cellStart + 64), 16);
const cellIndices = [];
for (let i = 0; i < cellLength; i++) {
  const start = cellStart + 64 + (i * 64);
  const end = start + 64;
  const val = parseInt(data.slice(start, end), 16);
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
console.log("  All cells unique:", new Set(cellIndices).size === cellIndices.length);
console.log("  All cells in bounds:", cellIndices.every(c => c >= 0 && c < rows * cols));
console.log("\n🔍 Cell Index Check:");
cellIndices.forEach((cell, idx) => {
  const inBounds = cell >= 0 && cell < rows * cols;
  console.log(`  Token ${tokenIds[idx]} → Cell ${cell} ${inBounds ? '✅' : '❌ OUT OF BOUNDS'}`);
});

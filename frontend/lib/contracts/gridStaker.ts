import { getAddress } from "viem";
import GridStakerABI from "@/frontend/abi/GridStaker.json";
import MintMulticallABI from "@/frontend/abi/MintMulticall.json";

// MineBoy Collection on ApeChain
export const sourceCollectionAddress = getAddress(
  "0xa8A16C3259aD84162a0868E7927523B81eF8BF2D"
);

// NGT Token on ApeChain
export const ngtTokenAddress = getAddress(
  "0x72cddb64a72176b442bdfd9c8bb7968e652d8d1a"
);

// Grid Staker address (set after deployment)
// Default to deployed address if env var not set
const GRID_STAKER_ADDRESS_ENV = process.env.NEXT_PUBLIC_GRID_STAKER_ADDRESS;
const defaultAddress = "0x9E16F09ef9d1B122D90Cca704fdB9415207b2F8c"; // Latest deployment (with APE withdrawal fix)
const addressToUse = (GRID_STAKER_ADDRESS_ENV && GRID_STAKER_ADDRESS_ENV.trim() !== "") 
  ? GRID_STAKER_ADDRESS_ENV.trim()
  : defaultAddress;

// Validate and checksum the address
let gridStakerAddress: `0x${string}`;
try {
  gridStakerAddress = getAddress(addressToUse);
  
  // CRITICAL: Ensure address is not zero
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  if (gridStakerAddress.toLowerCase() === zeroAddress.toLowerCase()) {
    throw new Error("GridStaker address cannot be zero address!");
  }
  
  // Log in development to help debug
  if (typeof window !== "undefined") {
    console.log("🔧 GridStaker Config:");
    console.log("  - Env var:", GRID_STAKER_ADDRESS_ENV || "(not set)");
    console.log("  - Address used:", gridStakerAddress);
    console.log("  - Default fallback:", GRID_STAKER_ADDRESS_ENV ? "No" : "Yes");
  }
} catch (error) {
  console.error("❌ Invalid GridStaker address:", addressToUse, error);
  // Fallback to default if env var is invalid
  gridStakerAddress = getAddress(defaultAddress);
  
  if (typeof window !== "undefined") {
    console.warn("⚠️ Using default GridStaker address:", gridStakerAddress);
  }
}

export { gridStakerAddress };

export { GridStakerABI };
export { MintMulticallABI };

// MintMulticall address (REAL solution - user calls it, authorizes GridStaker directly)
const MINT_MULTICALL_ADDRESS_ENV = process.env.NEXT_PUBLIC_MINT_MULTICALL_ADDRESS;
const defaultMulticallAddress = "0x96C7611fcAf57132F74310daa7970c20559FcBD0"; // Latest deployment
const multicallAddressToUse = (MINT_MULTICALL_ADDRESS_ENV && MINT_MULTICALL_ADDRESS_ENV.trim() !== "") 
  ? MINT_MULTICALL_ADDRESS_ENV.trim()
  : defaultMulticallAddress;

let mintMulticallAddress: `0x${string}`;
try {
  mintMulticallAddress = getAddress(multicallAddressToUse);
} catch (error) {
  console.error("❌ Invalid MintMulticall address:", multicallAddressToUse, error);
  mintMulticallAddress = getAddress(defaultMulticallAddress);
}

export { mintMulticallAddress };

// Create config object - ensure address is not frozen/stale
export const gridStakerConfig = {
  address: gridStakerAddress,
  abi: GridStakerABI,
};

// Multicall contract config (user calls it, authorizes GridStaker directly)
export const mintMulticallConfig = {
  address: mintMulticallAddress,
  abi: MintMulticallABI,
};

// Standard ERC20 ABI for NGT approval
export const ERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;


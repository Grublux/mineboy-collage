import { getAddress } from "viem";
import SimpleGridStakerABI from "@/frontend/abi/SimpleGridStaker.json";

// MineBoy Collection on ApeChain
export const sourceCollectionAddress = getAddress(
  "0xa8A16C3259aD84162a0868E7927523B81eF8BF2D"
);

// Simple Grid Staker address (set after deployment)
const SIMPLE_GRID_STAKER_ADDRESS_ENV = process.env.NEXT_PUBLIC_SIMPLE_GRID_STAKER_ADDRESS;
const defaultAddress = "0x40932EdcAb0376d46D8De92bcCF645fc164910dB"; // Deployed address
const addressToUse = (SIMPLE_GRID_STAKER_ADDRESS_ENV && SIMPLE_GRID_STAKER_ADDRESS_ENV.trim() !== "") 
  ? SIMPLE_GRID_STAKER_ADDRESS_ENV.trim()
  : defaultAddress;

// Validate and checksum the address
let simpleGridStakerAddress: `0x${string}`;
try {
  simpleGridStakerAddress = getAddress(addressToUse);
  
  if (typeof window !== "undefined") {
    console.log("🔧 SimpleGridStaker Config:");
    console.log("  - Env var:", SIMPLE_GRID_STAKER_ADDRESS_ENV || "(not set)");
    console.log("  - Address used:", simpleGridStakerAddress);
    console.log("  - Default fallback:", SIMPLE_GRID_STAKER_ADDRESS_ENV ? "No" : "Yes");
  }
} catch (error) {
  console.error("❌ Invalid SimpleGridStaker address:", addressToUse, error);
  simpleGridStakerAddress = getAddress(defaultAddress);
  
  if (typeof window !== "undefined") {
    console.warn("⚠️ Using default SimpleGridStaker address:", simpleGridStakerAddress);
  }
}

export const simpleGridStakerConfig = {
  address: simpleGridStakerAddress,
  abi: SimpleGridStakerABI,
} as const;


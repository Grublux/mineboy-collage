import CollageStakerABI from "../../abi/CollageStaker.json";
import { Address } from "viem";

/**
 * CollageStaker contract address from environment
 * Set NEXT_PUBLIC_COLLAGE_STAKER_ADDRESS after deployment
 */
export const collageStakerAddress = (process.env.NEXT_PUBLIC_COLLAGE_STAKER_ADDRESS || "0x0000000000000000000000000000000000000000") as Address;

/**
 * Source collection address (MineBoy on ApeChain)
 */
export const sourceCollectionAddress = (process.env.NEXT_PUBLIC_COLLECTION_ADDRESS ||
  "0xa8A16C3259aD84162a0868E7927523B81eF8BF2D") as Address;

/**
 * CollageStaker contract configuration for wagmi
 */
export const collageStakerConfig = {
  address: collageStakerAddress,
  abi: CollageStakerABI,
} as const;

export { CollageStakerABI };


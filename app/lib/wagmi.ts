import { createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

// ApeChain configuration
const apechain = {
  id: 33139,
  name: "ApeChain",
  nativeCurrency: {
    name: "APE",
    symbol: "APE",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || "https://apechain.calderachain.xyz/rpc"],
    },
  },
  blockExplorers: {
    default: {
      name: "ApeScan",
      url: "https://apescan.io",
    },
  },
} as const;

export const config = createConfig({
  chains: [apechain as any],
  transports: {
    [apechain.id]: http(),
  },
});

export function defineConfig(overrides?: any) {
  return config;
}


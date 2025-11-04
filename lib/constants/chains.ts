import { defineChain } from "viem";

/**
 * ApeChain configuration
 * Chain ID: 33139
 * RPC: https://apechain.calderachain.xyz/http
 */
export const apechain = defineChain({
  id: 33139,
  name: "ApeChain",
  nativeCurrency: {
    decimals: 18,
    name: "ApeCoin",
    symbol: "APE",
  },
  rpcUrls: {
    default: {
      http: ["https://apechain.calderachain.xyz/http"],
    },
  },
  blockExplorers: {
    default: {
      name: "ApeChain Explorer",
      url: "https://apechain.calderachain.xyz",
    },
  },
  testnet: false,
});


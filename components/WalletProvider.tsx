"use client";

import { createConfig, http, WagmiProvider } from "wagmi";
import { RainbowKitProvider, connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { apechain } from "@/lib/constants/chains";

// Create connectors for RainbowKit
const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, injectedWallet],
    },
  ],
  {
    appName: "MineBoy Collage",
    projectId: "", // Empty to disable WalletConnect
  }
);

// Create config with only injected wallets (no WalletConnect)
const config = createConfig({
  chains: [apechain],
  connectors,
  transports: {
    [apechain.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          modalSize="compact" 
          showRecentTransactions={false}
          initialChain={apechain}
          locale="en-US"
          appInfo={{
            appName: "MineBoy Collage",
            learnMoreUrl: undefined,
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}


"use client";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, sepolia, polygon, arbitrum, optimism } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";
import { apechain } from "@/lib/constants/chains";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "temp-placeholder-id";

const config = getDefaultConfig({
  appName: "NFT Collage",
  projectId,
  chains: [apechain, mainnet, sepolia, polygon, arbitrum, optimism],
  ssr: true,
});

const queryClient = new QueryClient();

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  useEffect(() => {
    // Suppress WalletConnect errors when no valid project ID
    const originalError = console.error;
    console.error = (...args: any[]) => {
      if (
        args[0]?.toString().includes('Connection interrupted') ||
        args[0]?.toString().includes('WebSocket') ||
        args[0]?.toString().includes('WalletConnect')
      ) {
        return; // Suppress WalletConnect errors
      }
      originalError.apply(console, args);
    };
    
    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          modalSize="compact" 
          showRecentTransactions={false}
          initialChain={apechain}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}


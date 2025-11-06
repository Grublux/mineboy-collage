"use client";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";
import { apechain } from "@/lib/constants/chains";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "temp-placeholder-id";

const config = getDefaultConfig({
  appName: "MineBoy Collage",
  projectId,
  chains: [apechain],
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
  useEffect(() => {
    // Suppress WalletConnect errors when no valid project ID
    const originalError = console.error;
    console.error = (...args: any[]) => {
      if (
        args[0]?.toString().includes('Connection interrupted') ||
        args[0]?.toString().includes('WebSocket') ||
        args[0]?.toString().includes('WalletConnect') ||
        args[0]?.toString().includes('subscribe')
      ) {
        return; // Suppress WalletConnect errors
      }
      originalError.apply(console, args);
    };
    
    // Catch unhandled errors from WalletConnect
    const handleError = (event: ErrorEvent) => {
      if (
        event.message?.includes('Connection interrupted') ||
        event.message?.includes('subscribe') ||
        event.message?.includes('WalletConnect')
      ) {
        event.preventDefault();
        return false;
      }
    };
    
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || '';
      if (
        reason.includes('Connection interrupted') ||
        reason.includes('subscribe') ||
        reason.includes('WalletConnect')
      ) {
        event.preventDefault();
        return false;
      }
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    
    return () => {
      console.error = originalError;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

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


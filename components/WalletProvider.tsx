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
    const originalWarn = console.warn;
    
    console.error = (...args: any[]) => {
      const errorStr = args.map(a => a?.toString() || '').join(' ');
      if (
        errorStr.includes('Connection interrupted') ||
        errorStr.includes('WebSocket') ||
        errorStr.includes('WalletConnect') ||
        errorStr.includes('subscribe') ||
        errorStr.includes('trying to subscribe')
      ) {
        return; // Suppress WalletConnect errors
      }
      originalError.apply(console, args);
    };
    
    console.warn = (...args: any[]) => {
      const warnStr = args.map(a => a?.toString() || '').join(' ');
      if (
        warnStr.includes('Connection interrupted') ||
        warnStr.includes('WalletConnect') ||
        warnStr.includes('subscribe')
      ) {
        return; // Suppress WalletConnect warnings
      }
      originalWarn.apply(console, args);
    };
    
    // Catch unhandled errors from WalletConnect - more aggressive
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || event.error?.message || event.error?.toString() || '';
      if (
        errorMessage.includes('Connection interrupted') ||
        errorMessage.includes('subscribe') ||
        errorMessage.includes('WalletConnect') ||
        errorMessage.includes('trying to subscribe') ||
        errorMessage.includes('WebSocket')
      ) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };
    
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || event.reason?.toString() || '';
      if (
        reason.includes('Connection interrupted') ||
        reason.includes('subscribe') ||
        reason.includes('WalletConnect') ||
        reason.includes('trying to subscribe')
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };
    
    // Add listeners with capture phase to catch early
    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleRejection, true);
    
    // Also catch at the document level
    document.addEventListener('error', handleError, true);
    
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleRejection, true);
      document.removeEventListener('error', handleError, true);
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


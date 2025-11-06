"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import Link from "next/link";
import { ngtTokenAddress, ERC20_ABI } from "@/frontend/lib/contracts/gridStaker";
import { formatUnits } from "viem";

export function WalletHeader() {
  const { address } = useAccount();
  
  // Read NGT balance
  const { data: ngtBalance } = useReadContract({
    address: ngtTokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
  
  const ngtBalanceFormatted = ngtBalance 
    ? parseFloat(formatUnits(ngtBalance, 18)).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    : "0";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        flexWrap: "wrap",
        gap: "20px",
      }}
    >
      <Link
        href="/my-grids"
        style={{
          color: "#ffffff",
          textDecoration: "none",
          fontSize: "16px",
          fontFamily: "monospace",
          textTransform: "uppercase",
          padding: "10px 20px",
          border: "2px solid #ffffff",
          backgroundColor: "transparent",
          display: "inline-block",
        }}
      >
        My Grids
      </Link>
      <ConnectButton.Custom>
        {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          return (
            <button
              onClick={connected ? openAccountModal : openConnectModal}
              style={{
                color: '#ffffff',
                fontSize: '14px',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                padding: '8px 16px',
                border: '2px solid #ffffff',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px'
              }}
              type="button"
            >
              <span>{connected ? `${account.displayName}` : 'Connect Wallet'}</span>
              {connected && (
                <span style={{ fontSize: '11px', opacity: 0.8 }}>
                  {ngtBalanceFormatted} NGT
                </span>
              )}
            </button>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}


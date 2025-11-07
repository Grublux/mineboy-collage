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
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px",
        flexWrap: "nowrap",
        position: "relative",
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <Link
          href="/my-blocks"
          style={{
            color: "rgba(255, 255, 255, 0.85)",
            textDecoration: "none",
            fontSize: "16px",
            fontFamily: "monospace",
            textTransform: "uppercase",
            padding: "10px 20px",
            border: "2px solid rgba(255, 255, 255, 0.85)",
            backgroundColor: "transparent",
            display: "inline-block",
          }}
        >
          My Blocks
        </Link>
      </div>
      {/* Logo - centered over header */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          pointerEvents: "none",
          paddingTop: "33px",
        }}
      >
        <img
          src="/logo.png"
          alt="Blocked Logo"
          style={{
            height: "120px",
            width: "auto",
            display: "block",
          }}
        />
      </div>
      <div style={{ flexShrink: 0 }}>
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <button
                onClick={connected ? openAccountModal : openConnectModal}
                style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  padding: '8px 16px',
                  border: '2px solid rgba(255, 255, 255, 0.85)',
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
    </div>
  );
}

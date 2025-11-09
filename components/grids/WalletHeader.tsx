"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ngtTokenAddress, ERC20_ABI } from "@/frontend/lib/contracts/gridStaker";
import { formatUnits } from "viem";

interface WalletHeaderProps {
  showCollectionNav?: boolean;
}

const STORAGE_KEY = "site_unlocked";

export function WalletHeader({ showCollectionNav = false }: WalletHeaderProps = {}) {
  const { address } = useAccount();
  const pathname = usePathname();
  const [showLogout, setShowLogout] = useState(false);
  
  // Check if we're on a locked page (not homepage)
  const isHomepage = pathname === "/";
  
  useEffect(() => {
    if (!isHomepage && typeof window !== "undefined") {
      const unlocked = sessionStorage.getItem(STORAGE_KEY);
      setShowLogout(unlocked === "true");
    } else {
      setShowLogout(false);
    }
  }, [isHomepage, pathname]);
  
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

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "clamp(10px, 3vw, 20px)",
        flexWrap: "nowrap",
        position: "relative",
      }}
    >
      <div style={{ flexShrink: 0 }}>
        {showCollectionNav ? (
          <Link
            href="/"
            style={{
              color: "rgba(255, 255, 255, 0.85)",
              textDecoration: "none",
              fontSize: "clamp(9px, 2.5vw, 12px)",
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: "clamp(1px, 0.5vw, 2px)",
              marginBottom: "20px",
              display: "inline-block",
            }}
          >
            ← Blocks
          </Link>
        ) : (
          <Link
            href="/my-blocks"
            style={{
              color: "rgba(255, 255, 255, 0.85)",
              textDecoration: "none",
              fontSize: "clamp(10px, 2.5vw, 16px)",
              fontFamily: "monospace",
              textTransform: "uppercase",
              padding: "clamp(6px, 1.5vw, 10px) clamp(12px, 3vw, 20px)",
              border: "2px solid rgba(255, 255, 255, 0.85)",
              backgroundColor: "transparent",
              display: "inline-block",
              whiteSpace: "nowrap",
            }}
          >
            My Blocks
          </Link>
        )}
      </div>
      {/* Logo - centered over header */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          pointerEvents: "none",
          paddingTop: "clamp(15px, 4vw, 33px)",
        }}
      >
        <img
          src="/logo.png"
          alt="Blocked Logo"
          style={{
            height: "clamp(60px, 15vw, 120px)",
            width: "auto",
            display: "block",
          }}
        />
      </div>
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <button
                onClick={connected ? openAccountModal : openConnectModal}
                style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: 'clamp(7px, 1.7vw, 14px)',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  padding: 'clamp(4px, 1vw, 9px) clamp(7px, 1.7vw, 16px)',
                  border: '2px solid rgba(255, 255, 255, 0.85)',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  whiteSpace: 'nowrap',
                }}
                type="button"
              >
                <span>{connected ? `${account.displayName}` : 'Connect Wallet'}</span>
                {connected && (
                  <span style={{ fontSize: 'clamp(6px, 1.4vw, 11px)', opacity: 0.8 }}>
                    {ngtBalanceFormatted} NGT
                  </span>
                )}
              </button>
            );
          }}
        </ConnectButton.Custom>
        {/* Logout button - only show on locked pages when unlocked */}
        {showLogout && (
          <button
            onClick={handleLogout}
            style={{
              padding: "6px 12px",
              backgroundColor: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              borderRadius: "4px",
              color: "rgba(255, 255, 255, 0.7)",
              fontFamily: "monospace",
              fontSize: "clamp(6px, 1.4vw, 11px)",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.85)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
            }}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

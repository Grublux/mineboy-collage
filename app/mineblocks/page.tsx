"use client";

export const dynamic = 'force-dynamic';

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import Link from "next/link";
import { gridStakerConfig, sourceCollectionAddress } from "@/frontend/lib/contracts/gridStaker";
import { ngtTokenAddress, ERC20_ABI } from "@/frontend/lib/contracts/gridStaker";
import { formatUnits } from "viem";
import { useTokenMetadata } from "@/frontend/hooks/useTokenMetadata";
import { UnbindButton } from "@/components/collage/UnbindButton";
import { MintGridButton } from "@/components/collage/MintGridButton";
import { SnapshotDialog } from "@/components/collage/SnapshotDialog";
import { useState, useEffect } from "react";
import { getOwnerTokensSmart } from "@/frontend/lib/nft/ownerTokensSmart";
import { Header } from "@/components/grids/Header";
import { WalletHeader } from "@/components/grids/WalletHeader";
import { ConnectButton } from "@rainbow-me/rainbowkit";

// CollageCard component for displaying minted MineBlocks
function CollageCard({
  collageId,
  onUnbind,
}: {
  collageId: bigint;
  onUnbind: () => void;
}) {
  const { data: tokenURI } = useReadContract({
    ...gridStakerConfig,
    functionName: "tokenURI",
    args: [collageId],
  });

  const { data: underlying } = useReadContract({
    ...gridStakerConfig,
    functionName: "getUnderlying",
    args: [collageId],
  });

  const { metadata } = useTokenMetadata(tokenURI as string);

  const underlyingData = underlying as [string, number, number, bigint[]] | undefined;
  const [collection, rows, cols, tokenIds] = underlyingData || ["", 0, 0, [] as bigint[]];

  return (
    <div
      style={{
        border: "2px solid rgba(255, 255, 255, 0.85)",
        padding: "20px",
        backgroundColor: "#111111",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
      }}
    >
      {metadata?.image && (
        <Link href={`/collage/${collageId.toString()}`}>
          <div
            style={{
              width: "100%",
              aspectRatio: "1",
              backgroundColor: "#000000",
              border: "2px solid #333333",
              overflow: "hidden",
              cursor: "pointer",
            }}
          >
            <img
              src={metadata.image}
              alt={metadata.name || `MineBlocks Block #${collageId}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                imageRendering: "pixelated",
              }}
            />
          </div>
        </Link>
      )}

      <div>
        <h3
          style={{
            margin: "0 0 10px 0",
            fontSize: "18px",
            fontWeight: "bold",
            color: "rgba(255, 255, 255, 0.85)",
            fontFamily: "monospace",
            textTransform: "uppercase",
          }}
        >
          {metadata?.name || `MineBlocks Block #${collageId}`}
        </h3>
        <div style={{ fontSize: "14px", color: "#888888", fontFamily: "monospace", marginBottom: "5px" }}>
          Block: {rows.toString()}×{cols.toString()}
        </div>
        <div style={{ fontSize: "14px", color: "#888888", fontFamily: "monospace" }}>
          Tokens: {(tokenIds as bigint[])?.length || 0}
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
        <Link
          href={`/collage/${collageId.toString()}`}
          style={{
            flex: 1,
            padding: "10px",
            backgroundColor: "#ffffff",
            color: "rgba(0, 0, 0, 0.85)",
            border: "2px solid rgba(255, 255, 255, 0.85)",
            textAlign: "center",
            textDecoration: "none",
            fontFamily: "monospace",
            textTransform: "uppercase",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          View
        </Link>
        <UnbindButton collageId={collageId} onSuccess={onUnbind} />
      </div>
    </div>
  );
}

export default function MyCollagesPage() {
  const { address, isConnected } = useAccount();
  
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

  // Read MineBoy total supply
  const { data: mineboyTotalSupply } = useReadContract({
    address: sourceCollectionAddress,
    abi: [
      {
        inputs: [],
        name: "totalSupply",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "totalSupply",
  });

  const totalSupplyFormatted = mineboyTotalSupply 
    ? Number(mineboyTotalSupply).toLocaleString()
    : "0";
  
  const [activeTab, setActiveTab] = useState<"create" | "my-grids">("create");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<number | null>(null);

  // State for Create MineBlocks Block tab
  const [selectedNFTs, setSelectedNFTs] = useState<string[]>([]);
  const [gridSize, setGridSize] = useState<number>(2); // Default 2x2, but supports 1x1 now
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [cellSize, setCellSize] = useState(100);
  const [showSnapshotDialog, setShowSnapshotDialog] = useState(false);
  const [mintedCollageId, setMintedCollageId] = useState<bigint | null>(null);
  const [loadedTileImages, setLoadedTileImages] = useState<HTMLImageElement[]>([]);

  const totalSlots = gridSize * gridSize;

  // Fetch user\'s MineBlocks NFTs using ERC721Enumerable
  // Defer loading until after initial render to improve perceived performance
  const [shouldLoadNFTs, setShouldLoadNFTs] = useState(false);
  
  useEffect(() => {
    // Reset when address changes or component mounts
    setShouldLoadNFTs(false);
    
    // Small delay to allow page to render first
    const timer = setTimeout(() => {
      setShouldLoadNFTs(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [address]); // Reset and reload when address changes

  const { data: balance } = useReadContract({
    address: sourceCollectionAddress,
    abi: [
      {
        inputs: [{ name: "owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "balance", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected && shouldLoadNFTs,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  });

  const balanceNum = balance ? Number(balance) : 0;

  // Convert owned token IDs to NFT objects
  const [ownedNFTs, setOwnedNFTs] = useState<any[]>([]);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [renderingProgress, setRenderingProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    if (!address || !balanceNum || balanceNum === 0 || !isConnected || !shouldLoadNFTs) {
      console.log("Not loading NFTs:", { address, balanceNum, isConnected, shouldLoadNFTs });
      setOwnedNFTs([]);
      return;
    }

    const loadNFTs = async (incrementalUpdate = false) => {
      if (!incrementalUpdate) {
        setLoadingNFTs(true);
        setLoadingProgress(0);
      }
      console.log(`Loading NFTs for address: ${address} (incremental: ${incrementalUpdate})`);
      
      try {
        // Check for incremental update possibility
        const cacheKey = `mineboy_nfts_${address.toLowerCase()}`;
        const blockCacheKey = `mineboy_lastblock_${address.toLowerCase()}`;
        
        if (incrementalUpdate) {
          const cached = localStorage.getItem(cacheKey);
          const lastBlock = localStorage.getItem(blockCacheKey);
          
          if (cached && lastBlock) {
            console.log('🔄 Checking for new transfers since last scan...');
            const cacheData = JSON.parse(cached);
            const fromBlock = BigInt(lastBlock);
            
            // Get current block
            const blockResponse = await fetch(`https://apechain.calderachain.xyz/http`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_blockNumber',
                params: [],
                id: 1
              })
            });
            const blockResult = await blockResponse.json();
            const currentBlock = BigInt(blockResult.result);
            
            console.log(`Checking blocks ${fromBlock} → ${currentBlock}`);
            
            // Quick check: has balance changed?
            if (balanceNum !== cacheData.nfts.length) {
              console.log(`Balance changed: ${cacheData.nfts.length} → ${balanceNum}, need full scan`);
              // Balance changed, do full scan
              return loadNFTs(false);
            }
            
            // Check for transfers in recent blocks only
            const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
            const me = address.toLowerCase();
            
            // Check inbound transfers
            const inboundResponse = await fetch(`https://apechain.calderachain.xyz/http`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_getLogs',
                params: [{
                  address: sourceCollectionAddress,
                  fromBlock: `0x${fromBlock.toString(16)}`,
                  toBlock: `0x${currentBlock.toString(16)}`,
                  topics: [
                    TRANSFER_TOPIC,
                    null,
                    `0x000000000000000000000000${me.slice(2)}`
                  ]
                }],
                id: 1
              })
            });
            const inboundResult = await inboundResponse.json();
            
            // Check outbound transfers
            const outboundResponse = await fetch(`https://apechain.calderachain.xyz/http`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_getLogs',
                params: [{
                  address: sourceCollectionAddress,
                  fromBlock: `0x${fromBlock.toString(16)}`,
                  toBlock: `0x${currentBlock.toString(16)}`,
                  topics: [
                    TRANSFER_TOPIC,
                    `0x000000000000000000000000${me.slice(2)}`
                  ]
                }],
                id: 1
              })
            });
            const outboundResult = await outboundResponse.json();
            
            const hasNewTransfers = (inboundResult.result?.length > 0) || (outboundResult.result?.length > 0);
            
            if (!hasNewTransfers) {
              console.log('✅ No new transfers detected, cache is current!');
              // Update last block checked
              localStorage.setItem(blockCacheKey, currentBlock.toString());
              return; // Cache is still valid
            } else {
              console.log(`Found ${inboundResult.result?.length || 0} inbound, ${outboundResult.result?.length || 0} outbound transfers, need full scan`);
              // New transfers detected, do full scan
              return loadNFTs(false);
            }
          }
        }
        
        console.log(`🔍 Full scan: Checking MineBlocks collection for your tokens...`);
        console.log(`Collection: ${sourceCollectionAddress}`);
        console.log(`Your wallet: ${address}`);
        
        // Try to get totalSupply first
        let maxToken = 3000; // Default to current supply
        try {
          const supplyResponse = await fetch(`https://apechain.calderachain.xyz/http`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [{
                to: sourceCollectionAddress,
                data: `0x18160ddd` // totalSupply()
              }, 'latest'],
              id: 1
            })
          });
          const supplyResult = await supplyResponse.json();
          if (supplyResult.result && !supplyResult.error) {
            maxToken = parseInt(supplyResult.result, 16);
            console.log(`📊 Total supply: ${maxToken} tokens`);
          }
        } catch {
          console.log(`⚠️ Could not get totalSupply, checking 1-3000`);
        }
        
        // Brute-force check ownerOf for all token IDs
        console.log(`Checking ownership of tokens 1-${maxToken}...`);
        const ownedIds: string[] = [];
        const batchSize = 100; // Check 100 at a time
        
        for (let startId = 1; startId <= maxToken; startId += batchSize) {
          const batch = [];
          for (let i = startId; i < startId + batchSize && i <= maxToken; i++) {
            batch.push(i);
          }
          
          const percent = Math.floor((startId / maxToken) * 100);
          setLoadingProgress(percent);
          console.log(`📊 Progress: ${percent}% (checking tokens ${batch[0]}-${batch[batch.length - 1]})`);
          
          const promises = batch.map(async (id) => {
            try {
              const response = await fetch(`https://apechain.calderachain.xyz/http`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  method: 'eth_call',
                  params: [{
                    to: sourceCollectionAddress,
                    data: `0x6352211e${BigInt(id).toString(16).padStart(64, '0')}` // ownerOf
                  }, 'latest'],
                  id: 1
                })
              });
              
              const result = await response.json();
              if (result.result && !result.error) {
                const owner = `0x${result.result.slice(-40)}`.toLowerCase();
                if (owner === address.toLowerCase()) {
                  console.log(`  ✅ Found yours: Token #${id}`);
                  return id.toString();
                }
              }
              return null;
            } catch (err) {
              return null;
            }
          });
          
          const batchResults = await Promise.all(promises);
          const found = batchResults.filter(id => id !== null) as string[];
          ownedIds.push(...found);
          
          if (found.length > 0) {
            console.log(`  Found ${found.length} in this batch`);
          }
        }
        
        setLoadingProgress(100);
        console.log(`✅ Scan complete! You own ${ownedIds.length} MineBoys:`, ownedIds);
        
        // Show "Rendering" message after scan completes
        setLoadingProgress(101); // Special value to trigger rendering message
        
        const tokenIds = ownedIds.map(id => BigInt(id));
        setRenderingProgress({ current: 0, total: tokenIds.length });
        
        const nfts: any[] = [];
        
        // Now fetch metadata for each token ID
        for (let i = 0; i < tokenIds.length; i++) {
          const tokenId = tokenIds[i];
          setRenderingProgress({ current: i + 1, total: tokenIds.length });
          try {
            // Fetch tokenURI for this token
            const response = await fetch(`https://apechain.calderachain.xyz/http`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_call',
                params: [{
                  to: sourceCollectionAddress,
                  data: `0xc87b56dd${tokenId.toString(16).padStart(64, '0')}`
                }, 'latest'],
                id: 1
              })
            });
            
            const result = await response.json();
            
            if (result.error) {
              console.error(`RPC error for token ${tokenId}:`, result.error);
              continue;
            }
            
            // Decode the hex response to get the URI
            const hexData = result.result;
            let uri = '';
            
            if (hexData && hexData.length > 130) {
              const dataStart = 130;
              const hexString = hexData.slice(dataStart);
              const bytes = hexString.match(/.{1,2}/g) || [];
              
              for (const byte of bytes) {
                const charCode = parseInt(byte, 16);
                if (charCode === 0) break;
                if (charCode >= 32 && charCode <= 126) {
                  uri += String.fromCharCode(charCode);
                }
              }
            }
            
            console.log(`Token ${tokenId} URI:`, uri);
            
            if (uri) {
              try {
                const metadataResponse = await fetch(uri);
                const metadata = await metadataResponse.json();
                
                nfts.push({
                  id: `owned-${tokenId}`,
                  name: metadata.name || `MineBlocks #${tokenId}`,
                  image: metadata.image || '',
                  tokenId: tokenId.toString(),
                  contract: sourceCollectionAddress,
                });
                
                console.log(`Successfully loaded token ${tokenId}`);
              } catch (err) {
                console.error(`Failed to fetch metadata for ${tokenId}:`, err);
              }
            }
          } catch (err) {
            console.error(`Error loading token ${tokenId}:`, err);
          }
        }
        
        console.log("Finished loading NFTs. Total:", nfts.length);
        
        // Cache the loaded NFTs and current block in localStorage
        if (address && nfts.length > 0) {
          try {
            // Get current block for incremental updates
            const blockResponse = await fetch(`https://apechain.calderachain.xyz/http`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_blockNumber',
                params: [],
                id: 1
              })
            });
            const blockResult = await blockResponse.json();
            const currentBlock = BigInt(blockResult.result);
            
            const cacheKey = `mineboy_nfts_${address.toLowerCase()}`;
            const blockCacheKey = `mineboy_lastblock_${address.toLowerCase()}`;
            const cacheData = {
              nfts,
              timestamp: Date.now(),
              expiry: 24 * 60 * 60 * 1000 // 24 hours cache (we check for transfers)
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
            localStorage.setItem(blockCacheKey, currentBlock.toString());
            console.log(`💾 Cached ${nfts.length} NFTs at block ${currentBlock}`);
          } catch (err) {
            console.warn('Failed to cache NFTs:', err);
          }
        }
        
        setOwnedNFTs(nfts);
      } catch (err) {
        console.error("Failed to load NFTs:", err);
        setOwnedNFTs([]);
      } finally {
        if (!incrementalUpdate) {
          setLoadingNFTs(false);
          setLoadingProgress(0);
          setRenderingProgress({ current: 0, total: 0 });
        }
      }
    };

    // Try to load from cache first
    if (address) {
      try {
        const cacheKey = `mineboy_nfts_${address.toLowerCase()}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const cacheData = JSON.parse(cached);
          const age = Date.now() - cacheData.timestamp;
          if (age < cacheData.expiry) {
            console.log(`⚡ Instant load from cache (${cacheData.nfts.length} MineBoys)`);
            setOwnedNFTs(cacheData.nfts);
            // Check for new transfers in background (smart incremental update)
            setTimeout(() => loadNFTs(true), 500);
            return;
          } else {
            console.log('Cache expired, full reload needed');
          }
        }
      } catch (err) {
        console.warn('Cache read failed:', err);
      }
    }

    loadNFTs(false);
  }, [balanceNum, address, isConnected, shouldLoadNFTs]); // Include shouldLoadNFTs to trigger when it becomes true

  // Auto-expand grid when more NFTs selected than current capacity
  useEffect(() => {
    const count = selectedNFTs.filter(id => id).length;
    const currentCapacity = gridSize * gridSize;
    
    // Only expand if we have more NFTs than current capacity
    // GridStaker requires minimum 2x2 (MIN_CELLS = 4)
    if (count > currentCapacity && gridSize < 6) {
      let newSize = gridSize;
      // Find the next size that can fit all selected NFTs
      if (count <= 4 && gridSize < 2) {
        newSize = 2;
      } else if (count <= 9 && gridSize < 3) {
        newSize = 3;
      } else if (count <= 16 && gridSize < 4) {
        newSize = 4;
      } else if (count <= 25 && gridSize < 5) {
        newSize = 5;
      } else if (count <= 36 && gridSize < 6) {
        newSize = 6;
      }
      
      // If we're expanding, ensure selectedNFTs array length matches new grid size
      if (newSize > gridSize) {
        const newTotalSlots = newSize * newSize;
        const preserved = [...selectedNFTs];
        while (preserved.length < newTotalSlots) {
          preserved.push('');
        }
        setSelectedNFTs(preserved);
        setGridSize(newSize);
      }
    }
  }, [selectedNFTs, gridSize]);

  // Defer loading blocks until after initial render
  const [shouldLoadGrids, setShouldLoadGrids] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoadGrids(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Read user\'s MineBlocks
  const { data: collageBalance, isLoading: loadingCollages } = useReadContract({
    ...gridStakerConfig,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected && shouldLoadGrids,
    },
  });

  const collageBalanceNum = collageBalance ? Number(collageBalance) : 0;

  const { data: collageTokenIds } = useReadContracts({
    contracts: Array.from({ length: collageBalanceNum }, (_, i) => ({
      ...gridStakerConfig,
      functionName: "tokenOfOwnerByIndex" as const,
      args: [address!, BigInt(i)] as const,
    })) as any,
    query: {
      enabled: !!address && collageBalanceNum > 0 && isConnected && shouldLoadGrids,
    },
  });

  // Fetch underlying data for all collages to determine sizes
  const validTokenIds = collageTokenIds?.filter((r: any) => r.status === "success" && r.result) || [];
  const { data: allUnderlying } = useReadContracts({
    contracts: validTokenIds.map((r: any) => ({
      ...gridStakerConfig,
      functionName: "getUnderlying" as const,
      args: [r.result] as const,
    })) as any,
    query: {
      enabled: validTokenIds.length > 0 && isConnected,
    },
  });

  // Create a map of tokenId -> underlying data for quick lookup
  const tokenIdToUnderlying = new Map<bigint, [string, number, number, bigint[]]>();
  if (allUnderlying && validTokenIds.length > 0) {
    allUnderlying.forEach((result: any, index: number) => {
      if (result.status === "success" && result.result && validTokenIds[index]) {
        const tokenId = validTokenIds[index].result as bigint;
        tokenIdToUnderlying.set(tokenId, result.result as [string, number, number, bigint[]]);
      }
    });
  }

  // Calculate which sizes the user owns
  const ownedSizes = new Set<number>();
  tokenIdToUnderlying.forEach((underlying) => {
    const [, rows, cols] = underlying;
    if (rows === cols && rows > 0) {
      ownedSizes.add(rows);
    }
  });

  // Filter collages by selected size
  const filteredCollageTokenIds = selectedSizeFilter === null 
    ? collageTokenIds
    : collageTokenIds?.filter((result: any) => {
        if (result.status === "success" && result.result) {
          const tokenId = result.result as bigint;
          const underlying = tokenIdToUnderlying.get(tokenId);
          if (underlying) {
            const [, rows, cols] = underlying;
            return rows === cols && rows === selectedSizeFilter;
          }
        }
        return false;
      });

  // Cell size calculation - debounced to prevent excessive updates
  useEffect(() => {
    const getGridCellSize = () => {
      if (typeof window === 'undefined') return 150;
      const viewportWidth = window.innerWidth;
      const maxGridWidth = Math.min(viewportWidth - 40, 1000);
      const calculatedSize = Math.floor(maxGridWidth / gridSize);
      return Math.max(Math.min(calculatedSize, 180), 80);
    };

    let resizeTimeout: NodeJS.Timeout;
    const updateSize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setCellSize(getGridCellSize());
      }, 150); // Debounce resize events
    };
    
    setCellSize(getGridCellSize());
    window.addEventListener('resize', updateSize);
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', updateSize);
    };
  }, [gridSize]);

  // State to track which NFT is being dragged from inventory
  const [draggedNFTId, setDraggedNFTId] = useState<string | null>(null);

  // Drag and drop handlers - only for reordering within grid
  const handleDragStart = (nftId: string) => {
    const index = selectedNFTs.findIndex((id) => id === nftId);
    if (index !== -1) {
      setDraggedIndex(index);
    }
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null) return;

    // Only allow reordering within grid (not from inventory)
    const newSelectedNFTs = [...selectedNFTs];
    const draggedNFT = newSelectedNFTs[draggedIndex];
    const targetNFT = newSelectedNFTs[targetIndex];
    newSelectedNFTs[draggedIndex] = targetNFT || '';
    newSelectedNFTs[targetIndex] = draggedNFT;
    
    setSelectedNFTs(newSelectedNFTs);
    setDraggedIndex(null);
  };

  // Click handler to add/remove NFT to grid
  const handleNFTClick = (nftId: string) => {
    // Check if NFT is already in grid - remove it
    if (selectedNFTs.includes(nftId)) {
      const newSelectedNFTs = selectedNFTs.map(id => id === nftId ? '' : id);
      setSelectedNFTs(newSelectedNFTs);
      return;
    }

    // Prevent duplicates - already checked above, but double-check for safety
    if (selectedNFTs.includes(nftId)) {
      return; // Already in grid, do nothing
    }

    // Find first empty slot
    const emptyIndex = selectedNFTs.findIndex(id => !id);
    if (emptyIndex !== -1) {
      const newSelectedNFTs = [...selectedNFTs];
      newSelectedNFTs[emptyIndex] = nftId;
      setSelectedNFTs(newSelectedNFTs);
    } else {
      // Grid full, need to expand if possible
      if (gridSize < 6) {
        const newSize = gridSize + 1;
        const newSlots = newSize * newSize;
        const newSelectedNFTs = [...selectedNFTs];
        while (newSelectedNFTs.length < newSlots) {
          newSelectedNFTs.push('');
        }
        newSelectedNFTs[selectedNFTs.length] = nftId;
        setSelectedNFTs(newSelectedNFTs);
        // Grid size will auto-adjust via useEffect
      }
    }
  };

  // Handle drag out of grid to remove
  const handleGridDragEnd = (e: React.DragEvent, index: number) => {
    const gridElement = e.currentTarget.parentElement;
    if (gridElement) {
      const rect = gridElement.getBoundingClientRect();
      const isOutside = 
        e.clientX < rect.left || 
        e.clientX > rect.right || 
        e.clientY < rect.top || 
        e.clientY > rect.bottom;
      
      if (isOutside && selectedNFTs[index]) {
        // Remove NFT from grid
        const newSelectedNFTs = [...selectedNFTs];
        newSelectedNFTs[index] = '';
        setSelectedNFTs(newSelectedNFTs);
      }
    }
    setDraggedIndex(null);
  };

  // Mint handlers
  const handleMintSuccess = async (collageId: bigint) => {
    setMintedCollageId(collageId);
    
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };
    
    try {
      const tilesToLoad: HTMLImageElement[] = [];
      for (let i = 0; i < totalSlots; i++) {
        const nftId = selectedNFTs[i];
        if (nftId) {
          const nft = ownedNFTs.find((n: any) => n.id === nftId);
          if (nft?.image) {
            const img = await loadImage(nft.image);
            tilesToLoad.push(img);
          }
        }
      }
      setLoadedTileImages(tilesToLoad);
      setShowSnapshotDialog(true);
    } catch (err) {
      console.error('Error loading tile images:', err);
      setShowSnapshotDialog(true);
    }
  };

  const handleSnapshotDialogClose = () => {
    setShowSnapshotDialog(false);
    setMintedCollageId(null);
    setLoadedTileImages([]);
    setRefreshKey(prev => prev + 1);
    setActiveTab("my-grids");
  };

  const handleSnapshotSuccess = () => {
    handleSnapshotDialogClose();
  };

  const getSelectedTokenIds = (): number[] => {
    return selectedNFTs
      .map(nftId => {
        const nft = ownedNFTs.find((n: any) => n.id === nftId);
        return nft ? parseInt(nft.tokenId) : null;
      })
      .filter((id): id is number => id !== null);
  };

  // Check if grid is completely full
  const isGridFull = selectedNFTs.length >= totalSlots && selectedNFTs.filter(id => id).length === totalSlots;
  
  // Check if user has enough NFTs for current grid size
  const hasEnoughNFTs = ownedNFTs.length >= totalSlots;

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (!isConnected) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#000000",
          color: "rgba(255, 255, 255, 0.85)",
          padding: "20px",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <WalletHeader showCollectionNav />
          <Header title="MineBlocks" />
          
          {/* Staking Banner */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "clamp(8px, 2vw, 20px)",
              flexWrap: "wrap",
              marginBottom: "clamp(15px, 4vw, 30px)",
              padding: "clamp(10px, 2vw, 15px) clamp(10px, 3vw, 20px)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "4px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center",
              gap: "4px",
              minWidth: "fit-content",
            }}>
              <div style={{ fontSize: "clamp(9px, 2vw, 11px)", color: "rgba(255, 255, 255, 0.6)", fontFamily: "monospace", textTransform: "uppercase" }}>
                Pooled Rewards
              </div>
              <div style={{ fontSize: "clamp(11px, 2.5vw, 14px)", color: "#00ff00", fontFamily: "monospace", fontWeight: "bold" }}>
                1,000 APE
              </div>
            </div>
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center",
              gap: "4px",
              minWidth: "fit-content",
            }}>
            <div style={{ fontSize: "clamp(9px, 2vw, 11px)", color: "rgba(255, 255, 255, 0.6)", fontFamily: "monospace", textTransform: "uppercase" }}>
              Total Blocked
            </div>
            <div style={{ fontSize: "clamp(11px, 2.5vw, 14px)", color: "rgba(255, 255, 255, 0.85)", fontFamily: "monospace" }}>
              0 / {totalSupplyFormatted}
            </div>
          </div>
          <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center",
              gap: "4px",
              minWidth: "fit-content",
            }}>
              <div style={{ fontSize: "clamp(9px, 2vw, 11px)", color: "rgba(255, 255, 255, 0.6)", fontFamily: "monospace", textTransform: "uppercase" }}>
                My Blocks
              </div>
              <div style={{ fontSize: "clamp(11px, 2.5vw, 14px)", color: "rgba(255, 255, 255, 0.4)", fontFamily: "monospace" }}>
                -
              </div>
            </div>
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center",
              gap: "4px",
              minWidth: "fit-content",
            }}>
              <div style={{ fontSize: "clamp(9px, 2vw, 11px)", color: "rgba(255, 255, 255, 0.6)", fontFamily: "monospace", textTransform: "uppercase" }}>
                My Shares
              </div>
              <div style={{ fontSize: "clamp(11px, 2.5vw, 14px)", color: "rgba(255, 255, 255, 0.4)", fontFamily: "monospace" }}>
                -
              </div>
            </div>
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center",
              gap: "4px",
              minWidth: "fit-content",
            }}>
              <div style={{ fontSize: "clamp(9px, 2vw, 11px)", color: "rgba(255, 255, 255, 0.6)", fontFamily: "monospace", textTransform: "uppercase" }}>
                Pending Share
              </div>
              <div style={{ fontSize: "clamp(11px, 2.5vw, 14px)", color: "rgba(255, 255, 255, 0.4)", fontFamily: "monospace" }}>
                -
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "60vh",
            }}
          >
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
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
                          {account.displayBalance ? `${account.displayBalance}` : ''}
                        </span>
                      )}
                    </button>
                  );
                }}
              </ConnectButton.Custom>
            </div>
            <p
              style={{
                fontSize: "clamp(12px, 3vw, 16px)",
                fontFamily: "monospace",
                textAlign: "center",
                marginTop: "20px",
                opacity: 0.7,
                width: "100%",
                maxWidth: "100%",
                padding: "0 20px",
                boxSizing: "border-box",
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              To View and create MineBlocks
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        color: "rgba(255, 255, 255, 0.85)",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <WalletHeader showCollectionNav />
        
        {/* Page Header */}
        <Header title="MineBlocks" />

        {/* Staking Banner */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "clamp(8px, 2vw, 20px)",
            flexWrap: "wrap",
            marginBottom: "clamp(15px, 4vw, 30px)",
            padding: "clamp(10px, 2vw, 15px) clamp(10px, 3vw, 20px)",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "4px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            gap: "4px",
            minWidth: "fit-content",
          }}>
            <div style={{ fontSize: "clamp(9px, 2vw, 11px)", color: "rgba(255, 255, 255, 0.6)", fontFamily: "monospace", textTransform: "uppercase" }}>
              Pooled Rewards
            </div>
            <div style={{ fontSize: "clamp(11px, 2.5vw, 14px)", color: "#00ff00", fontFamily: "monospace", fontWeight: "bold" }}>
              1,000 APE
            </div>
          </div>
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            gap: "4px",
            minWidth: "fit-content",
          }}>
            <div style={{ fontSize: "clamp(9px, 2vw, 11px)", color: "rgba(255, 255, 255, 0.6)", fontFamily: "monospace", textTransform: "uppercase" }}>
              Total Blocked
            </div>
            <div style={{ fontSize: "clamp(11px, 2.5vw, 14px)", color: "rgba(255, 255, 255, 0.85)", fontFamily: "monospace" }}>
              0 / {totalSupplyFormatted}
            </div>
          </div>
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            gap: "4px",
            minWidth: "fit-content",
          }}>
            <div style={{ fontSize: "clamp(9px, 2vw, 11px)", color: "rgba(255, 255, 255, 0.6)", fontFamily: "monospace", textTransform: "uppercase" }}>
              My Blocks
            </div>
            <div style={{ fontSize: "clamp(11px, 2.5vw, 14px)", color: isConnected ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.4)", fontFamily: "monospace" }}>
              {isConnected ? "0" : "-"}
            </div>
          </div>
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            gap: "4px",
            minWidth: "fit-content",
          }}>
            <div style={{ fontSize: "clamp(9px, 2vw, 11px)", color: "rgba(255, 255, 255, 0.6)", fontFamily: "monospace", textTransform: "uppercase" }}>
              My Shares
            </div>
            <div style={{ fontSize: "clamp(11px, 2.5vw, 14px)", color: isConnected ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.4)", fontFamily: "monospace" }}>
              {isConnected ? "0 / 0" : "-"}
            </div>
          </div>
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            gap: "4px",
            minWidth: "fit-content",
          }}>
            <div style={{ fontSize: "clamp(9px, 2vw, 11px)", color: "rgba(255, 255, 255, 0.6)", fontFamily: "monospace", textTransform: "uppercase" }}>
              Pending Share
            </div>
            <div style={{ fontSize: "clamp(11px, 2.5vw, 14px)", color: isConnected ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.4)", fontFamily: "monospace" }}>
              {isConnected ? "0 APE" : "-"}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: "flex", 
          gap: "clamp(5px, 2vw, 10px)", 
          marginBottom: "clamp(15px, 4vw, 30px)", 
          borderBottom: "2px solid #333333",
          justifyContent: "center",
          flexWrap: "wrap",
          width: "100%",
          boxSizing: "border-box",
          padding: "0 clamp(10px, 3vw, 20px)"
        }}>
          <button
            onClick={() => setActiveTab("create")}
            style={{
              padding: "clamp(10px, 2.5vw, 15px) clamp(15px, 4vw, 30px)",
              backgroundColor: "transparent",
              color: activeTab === "create" ? "rgba(255, 255, 255, 0.85)" : "#666666",
              border: "none",
              borderBottom: activeTab === "create" ? "2px solid #ffffff" : "2px solid transparent",
              cursor: "pointer",
              fontFamily: "monospace",
              textTransform: "uppercase",
              fontSize: "clamp(11px, 3vw, 16px)",
              fontWeight: "bold",
              marginBottom: "-2px",
              whiteSpace: "nowrap",
              boxSizing: "border-box",
              wordWrap: "break-word",
              overflowWrap: "break-word",
            }}
          >
            Create Block
          </button>
          <button
            onClick={() => setActiveTab("my-grids")}
            style={{
              padding: "clamp(10px, 2.5vw, 15px) clamp(15px, 4vw, 30px)",
              backgroundColor: "transparent",
              color: activeTab === "my-grids" ? "rgba(255, 255, 255, 0.85)" : "#666666",
              border: "none",
              borderBottom: activeTab === "my-grids" ? "2px solid #ffffff" : "2px solid transparent",
              cursor: "pointer",
              fontFamily: "monospace",
              textTransform: "uppercase",
              fontSize: "clamp(11px, 3vw, 16px)",
              fontWeight: "bold",
              marginBottom: "-2px",
              whiteSpace: "nowrap",
              boxSizing: "border-box",
              wordWrap: "break-word",
              overflowWrap: "break-word",
            }}
          >
            My MineBlocks ({collageBalanceNum})
          </button>
        </div>

        {/* Create MineBlocks Block Tab */}
        {activeTab === "create" && (
          <div>
            <h2
              style={{
                fontSize: "clamp(20px, 6vw, 33px)",
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "clamp(1px, 0.5vw, 2px)",
                marginBottom: "20px",
                textAlign: "center",
                color: "rgba(255, 255, 255, 0.85)",
                WebkitFontSmoothing: "none",
                MozOsxFontSmoothing: "grayscale",
                textRendering: "optimizeSpeed",
                filter: "contrast(1.2)",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                padding: "0 clamp(10px, 3vw, 20px)",
                boxSizing: "border-box",
                width: "100%",
              } as React.CSSProperties}
            >
              Create New MineBlock
            </h2>

            {/* Grid Size Selector - Button Style */}
            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <div style={{ marginBottom: "10px", fontSize: "14px", fontFamily: "monospace", textTransform: "uppercase" }}>
                Block Size: (Current: {gridSize}×{gridSize})
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(5px, 1.5vw, 10px)", flexWrap: "nowrap", marginBottom: "15px", width: "100%", boxSizing: "border-box", padding: "0 clamp(5px, 2vw, 10px)", overflowX: "auto" }}>
                {[2, 3, 4, 5, 6].map((size) => {
                  const requiredNFTs = size * size;
                  const hasEnough = ownedNFTs.length >= requiredNFTs;
                  return (
                    <button
                      key={size}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Grid size button clicked! New size:', size);
                        const newSize = size;
                        const oldSize = gridSize;
                        const oldTotalSlots = oldSize * oldSize;
                        const newTotalSlots = newSize * newSize;
                        
                        // Preserve NFTs in their current cell positions
                        if (newSize < oldSize) {
                          // Downsizing: keep only NFTs that fit in the new grid
                          const preserved = selectedNFTs.slice(0, newTotalSlots);
                          setSelectedNFTs(preserved);
                        } else {
                          // Upsizing: keep existing NFTs and add empty slots
                          const preserved = [...selectedNFTs];
                          // Ensure array length matches new grid size
                          while (preserved.length < newTotalSlots) {
                            preserved.push('');
                          }
                          setSelectedNFTs(preserved);
                        }
                        
                        setGridSize(newSize);
                      }}
                      style={{
                        padding: "clamp(5px, 1.5vw, 10px) clamp(10px, 3vw, 20px)",
                        backgroundColor: gridSize === size ? "#ffffff" : "#000000",
                        color: gridSize === size ? "#000000" : "#ffffff",
                        border: "2px solid rgba(255, 255, 255, 0.85)",
                        cursor: "pointer",
                        fontFamily: "monospace",
                        fontSize: "clamp(10px, 2.5vw, 14px)",
                        fontWeight: gridSize === size ? "bold" : "normal",
                        opacity: hasEnough ? 1 : 0.5,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                      onMouseOver={(e) => {
                        if (gridSize !== size && hasEnough) {
                          e.currentTarget.style.backgroundColor = "#333333";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (gridSize !== size) {
                          e.currentTarget.style.backgroundColor = "#000000";
                        }
                      }}
                    >
                      {size}×{size}
                      {!hasEnough && <div style={{ fontSize: "10px", marginTop: "2px" }}>Need {requiredNFTs}</div>}
                    </button>
                  );
                })}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: hasEnoughNFTs ? "#00ff00" : "#ff4444",
                  fontFamily: "monospace",
                }}
              >
                {hasEnoughNFTs ? `✓ You have ${ownedNFTs.length} MineBoys` : `⚠ Need ${totalSlots} MineBoys (you have ${ownedNFTs.length})`}
              </div>
            </div>

            {/* My NFTs List */}
            <div style={{ marginBottom: "80px" }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  marginBottom: "15px",
                }}
              >
                Your MineBoy NFTs ({ownedNFTs.length})
              </h3>
              <div
                style={{
                  fontSize: "14px",
                  fontFamily: "monospace",
                  color: "#00ff00",
                  marginBottom: "15px",
                  textAlign: "center",
                }}
              >
                Click/Tap to add to Block
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: "10px",
                  padding: "10px",
                  border: "2px solid #333333",
                  boxSizing: "border-box",
                  width: "100%",
                }}
              >
                {loadingNFTs ? (
                  <div style={{ padding: "20px", gridColumn: "1 / -1" }}>
                    <div style={{ color: "#00ff00", marginBottom: "15px" }}>
                      {loadingProgress > 100 ? "Rendering Your MineBoys..." : "Loading your MineBoy NFTs..."}
                    </div>
                    
                    {loadingProgress > 100 ? (
                      // Rendering phase - show counter
                      <div style={{
                        fontSize: "32px",
                        fontFamily: "monospace",
                        fontWeight: "bold",
                        color: "#00ff00",
                        textAlign: "center",
                        padding: "10px 0"
                      }}>
                        {renderingProgress.current} / {renderingProgress.total}
                      </div>
                    ) : (
                      // Scanning phase - show progress bar
                      <div style={{ 
                        width: "100%", 
                        height: "20px", 
                        backgroundColor: "#333333", 
                        border: "2px solid rgba(255, 255, 255, 0.85)",
                        position: "relative",
                        overflow: "hidden"
                      }}>
                        <div style={{ 
                          position: "absolute", 
                          left: 0, 
                          top: 0, 
                          height: "100%", 
                          width: `${Math.min(loadingProgress, 100)}%`, 
                          backgroundColor: "#00ff00",
                          transition: "width 0.3s ease"
                        }} />
                        <div style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontFamily: "monospace",
                          fontWeight: "bold",
                          color: loadingProgress > 50 ? "#000000" : "#ffffff",
                          textShadow: "0 0 2px rgba(0,0,0,0.5)"
                        }}>
                          {loadingProgress}%
                        </div>
                      </div>
                    )}
                    
                    <div style={{ fontSize: "12px", color: "#888888", marginTop: "10px" }}>
                      {loadingProgress > 100 ? "Fetching metadata and images..." : "Scanning collection ownership..."}
                    </div>
                  </div>
                ) : ownedNFTs.length === 0 ? (
                  <div style={{ padding: "20px", color: "rgba(102, 102, 102, 0.85)", gridColumn: "1 / -1" }}>
                    No MineBlocks NFTs found in your wallet
                  </div>
                ) : (
                  ownedNFTs.map((nft) => {
                    const isSelected = selectedNFTs.includes(nft.id);
                    return (
                      <div
                        key={nft.id}
                        onClick={() => handleNFTClick(nft.id)}
                        style={{
                          cursor: "pointer",
                          border: isSelected ? "3px solid #00ff00" : "2px solid #ffffff",
                          padding: "5px",
                          backgroundColor: isSelected ? "#1a3d1a" : "#111111",
                          transition: "all 0.2s",
                          opacity: isSelected ? 0.6 : 1,
                        }}
                        title={isSelected ? "Click to remove from block" : "Click to add to block"}
                      >
                        {nft.image && (
                          <img
                            src={nft.image}
                            alt={nft.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              imageRendering: "pixelated",
                              pointerEvents: "none",
                            }}
                          />
                        )}
                        <div
                          style={{
                            fontSize: "10px",
                            textAlign: "center",
                            marginTop: "5px",
                            color: isSelected ? "#00ff00" : "#ffffff",
                            fontFamily: "monospace",
                          }}
                        >
                          #{nft.tokenId}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* MineBlocks Block */}
            <div style={{ marginBottom: "30px" }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  marginBottom: "15px",
                }}
              >
                MineBlocks Block ({gridSize}×{gridSize})
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                  gap: "0px",
                  marginBottom: "20px",
                  backgroundColor: "#536AB3",
                  width: "100%",
                  maxWidth: `${cellSize * gridSize}px`,
                  margin: "0 auto 20px auto",
                  aspectRatio: "1 / 1"
                }}
              >
                {Array.from({ length: totalSlots }).map((_, index) => {
                  const nftId = selectedNFTs[index];
                  const nft = nftId ? ownedNFTs.find((n) => n.id === nftId) : null;

                  return (
                    <div
                      key={index}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        // Only allow reordering within grid (not from inventory)
                        if (draggedIndex !== null && draggedIndex !== -1) {
                          handleDrop(index);
                        }
                      }}
                      draggable={!!nft}
                      onDragStart={() => nft && handleDragStart(nft.id)}
                      onDragEnd={(e) => nft && handleGridDragEnd(e, index)}
                      style={{
                        width: "100%",
                        aspectRatio: "1",
                        backgroundColor: "#536AB3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: nft ? "move" : "default",
                        opacity: draggedIndex === index ? 0.5 : 1,
                        outline: draggedIndex === index ? "3px dashed #00ff00" : "none",
                        outlineOffset: "-3px",
                      }}
                      title={nft ? "Drag to reorder or drag outside to remove" : "Drag or click an NFT to add to block"}
                    >
                      {nft?.image && (
                        <img
                          src={nft.image}
                          alt={nft.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            imageRendering: "pixelated",
                            pointerEvents: "none",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mint Button */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                {!isGridFull ? (
                  <div style={{ fontSize: "14px", color: "#ff4444", fontFamily: "monospace", textAlign: "center" }}>
                    Block must be completely full to mint
                  </div>
                ) : (
                  <div style={{ fontSize: "14px", color: "#ffff00", fontFamily: "monospace", textAlign: "center", fontWeight: "bold" }}>
                    Coming soon
                  </div>
                )}
                <MintGridButton
                  rows={gridSize}
                  cols={gridSize}
                  selectedNFTs={selectedNFTs}
                  onMinted={handleMintSuccess}
                  disabled={true}
                  showFilledCount={!isGridFull}
                  totalSlots={totalSlots}
                />
              </div>
            </div>
          </div>
        )}

        {/* My MineBlocks Tab */}
        {activeTab === "my-grids" && (
          <div>
            <h2
              style={{
                fontSize: "clamp(20px, 6vw, 33px)",
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "clamp(1px, 0.5vw, 2px)",
                marginBottom: "20px",
                textAlign: "center",
                color: "rgba(255, 255, 255, 0.85)",
                WebkitFontSmoothing: "none",
                MozOsxFontSmoothing: "grayscale",
                textRendering: "optimizeSpeed",
                filter: "contrast(1.2)",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                padding: "0 clamp(10px, 3vw, 20px)",
                boxSizing: "border-box",
                width: "100%",
              } as React.CSSProperties}
            >
              My MineBlocks
            </h2>

            {/* Block Size Filter */}
            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <div style={{ marginBottom: "10px", fontSize: "14px", fontFamily: "monospace", textTransform: "uppercase" }}>
                Block Size: {selectedSizeFilter ? `(Filtered: ${selectedSizeFilter}×${selectedSizeFilter})` : "(All Sizes)"}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(5px, 1.5vw, 10px)", flexWrap: "nowrap", marginBottom: "15px", width: "100%", boxSizing: "border-box", padding: "0 clamp(5px, 2vw, 10px)", overflowX: "auto" }}>
                <button
                  onClick={() => setSelectedSizeFilter(null)}
                  style={{
                    padding: "clamp(5px, 1.5vw, 10px) clamp(10px, 3vw, 20px)",
                    backgroundColor: selectedSizeFilter === null ? "#ffffff" : "#000000",
                    color: selectedSizeFilter === null ? "#000000" : "#ffffff",
                    border: "2px solid rgba(255, 255, 255, 0.85)",
                    cursor: "pointer",
                    fontFamily: "monospace",
                    fontSize: "clamp(10px, 2.5vw, 14px)",
                    fontWeight: selectedSizeFilter === null ? "bold" : "normal",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  All
                </button>
                {[2, 3, 4, 5, 6].map((size) => {
                  const hasSize = ownedSizes.has(size);
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSizeFilter(hasSize ? size : null)}
                      style={{
                        padding: "clamp(5px, 1.5vw, 10px) clamp(10px, 3vw, 20px)",
                        backgroundColor: selectedSizeFilter === size ? "#ffffff" : "#000000",
                        color: selectedSizeFilter === size ? "#000000" : (hasSize ? "#ffffff" : "#666666"),
                        border: "2px solid rgba(255, 255, 255, 0.85)",
                        cursor: hasSize ? "pointer" : "not-allowed",
                        fontFamily: "monospace",
                        fontSize: "clamp(10px, 2.5vw, 14px)",
                        fontWeight: selectedSizeFilter === size ? "bold" : "normal",
                        opacity: hasSize ? 1 : 0.5,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {size}×{size}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                marginBottom: "30px",
              }}
            >
              <button
                onClick={handleRefresh}
                style={{
                  padding: "7px 14px",
                  backgroundColor: "transparent",
                  color: "rgba(255, 255, 255, 0.85)",
                  border: "2px solid rgba(255, 255, 255, 0.85)",
                  cursor: "pointer",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  fontSize: "clamp(8px, 2vw, 9px)",
                }}
              >
                Refresh
              </button>
            </div>

            {loadingCollages ? (
              <div style={{ textAlign: "center", padding: "40px", color: "rgba(102, 102, 102, 0.85)" }}>Loading...</div>
            ) : collageBalanceNum === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  border: "2px dashed #333333",
                  color: "rgba(102, 102, 102, 0.85)",
                }}
              >
                <p style={{ fontSize: "18px", marginBottom: "10px" }}>No MineBlocks yet</p>
                <p style={{ fontSize: "14px" }}>
                  Create your first block using the "Create Block" tab!
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "30px",
                }}
              >
                {(filteredCollageTokenIds || collageTokenIds)?.map((result: any, index: number) => {
                  if (result.status === "success" && result.result) {
                    return (
                      <CollageCard
                        key={index}
                        collageId={result.result as bigint}
                        onUnbind={handleRefresh}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Snapshot Dialog */}
      {showSnapshotDialog && mintedCollageId !== null && (
        <SnapshotDialog
          collageId={mintedCollageId}
          tiles={loadedTileImages}
          rows={gridSize}
          cols={gridSize}
          onClose={handleSnapshotDialogClose}
          onSuccess={handleSnapshotSuccess}
        />
      )}
    </div>
  );
}

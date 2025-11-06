"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { collageStakerConfig, sourceCollectionAddress } from "@/frontend/lib/contracts/collageStaker";
import { useTokenMetadata } from "@/frontend/hooks/useTokenMetadata";
import { UnbindButton } from "@/components/collage/UnbindButton";
import { MintCollageButton } from "@/components/collage/MintCollageButton";
import { SnapshotDialog } from "@/components/collage/SnapshotDialog";
import { useState, useEffect } from "react";
import { getOwnerTokensSmart } from "@/frontend/lib/nft/ownerTokensSmart";

// CollageCard component for displaying minted MineBoy grids
function CollageCard({
  collageId,
  onUnbind,
}: {
  collageId: bigint;
  onUnbind: () => void;
}) {
  const { data: tokenURI } = useReadContract({
    ...collageStakerConfig,
    functionName: "tokenURI",
    args: [collageId],
  });

  const { data: underlying } = useReadContract({
    ...collageStakerConfig,
    functionName: "getUnderlying",
    args: [collageId],
  });

  const { metadata } = useTokenMetadata(tokenURI as string);

  const underlyingData = underlying as [string, number, number, bigint[]] | undefined;
  const [collection, rows, cols, tokenIds] = underlyingData || ["", 0, 0, [] as bigint[]];

  return (
    <div
      style={{
        border: "2px solid #ffffff",
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
              alt={metadata.name || `MineBoy Grid #${collageId}`}
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
            color: "#ffffff",
            fontFamily: "monospace",
            textTransform: "uppercase",
          }}
        >
          {metadata?.name || `MineBoy Grid #${collageId}`}
        </h3>
        <div style={{ fontSize: "14px", color: "#888888", fontFamily: "monospace", marginBottom: "5px" }}>
          Grid: {rows.toString()}×{cols.toString()}
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
            color: "#000000",
            border: "2px solid #ffffff",
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
  const [activeTab, setActiveTab] = useState<"create" | "my-collages">("create");
  const [refreshKey, setRefreshKey] = useState(0);

  // State for Create MineBoy Grid tab
  const [selectedNFTs, setSelectedNFTs] = useState<string[]>([]);
  const [gridSize, setGridSize] = useState<number>(3);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [cellSize, setCellSize] = useState(100);
  const [showSnapshotDialog, setShowSnapshotDialog] = useState(false);
  const [mintedCollageId, setMintedCollageId] = useState<bigint | null>(null);
  const [loadedTileImages, setLoadedTileImages] = useState<HTMLImageElement[]>([]);

  const totalSlots = gridSize * gridSize;

  // Fetch user's MineBoy NFTs using ERC721Enumerable
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
      enabled: !!address && isConnected,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  const balanceNum = balance ? Number(balance) : 0;

  // Convert owned token IDs to NFT objects
  const [ownedNFTs, setOwnedNFTs] = useState<any[]>([]);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [renderingProgress, setRenderingProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    if (!address || !balanceNum || balanceNum === 0 || !isConnected) {
      console.log("Not loading NFTs:", { address, balanceNum, isConnected });
      setOwnedNFTs([]);
      return;
    }

    const loadNFTs = async () => {
      setLoadingNFTs(true);
      setLoadingProgress(0);
      console.log(`Loading NFTs for address: ${address}`);
      
      try {
        console.log(`🔍 Scanning MineBoy collection for your tokens...`);
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
                  name: metadata.name || `MineBoy #${tokenId}`,
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
        
        // Cache the loaded NFTs in localStorage
        if (address && nfts.length > 0) {
          try {
            const cacheKey = `mineboy_nfts_${address.toLowerCase()}`;
            const cacheData = {
              nfts,
              timestamp: Date.now(),
              expiry: 5 * 60 * 1000 // 5 minutes cache
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
          } catch (err) {
            console.warn('Failed to cache NFTs:', err);
          }
        }
        
        setOwnedNFTs(nfts);
      } catch (err) {
        console.error("Failed to load NFTs:", err);
        setOwnedNFTs([]);
      } finally {
        setLoadingNFTs(false);
        setLoadingProgress(0);
        setRenderingProgress({ current: 0, total: 0 });
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
            console.log('Loading NFTs from cache...');
            setOwnedNFTs(cacheData.nfts);
            // Still refresh in background
            setTimeout(loadNFTs, 100);
            return;
          }
        }
      } catch (err) {
        console.warn('Cache read failed:', err);
      }
    }

    loadNFTs();
  }, [balanceNum, address, isConnected]);

  // Auto-adjust grid size based on selected NFT count
  useEffect(() => {
    const count = selectedNFTs.filter(id => id).length;
    if (count === 0) {
      setGridSize(2); // Start with 2x2
    } else if (count <= 4) {
      setGridSize(2); // 2x2
    } else if (count <= 9) {
      setGridSize(3); // 3x3
    } else if (count <= 16) {
      setGridSize(4); // 4x4
    } else if (count <= 25) {
      setGridSize(5); // 5x5
    } else {
      setGridSize(6); // 6x6 max
    }
  }, [selectedNFTs]);

  // Read user's MineBoy grids
  const { data: collageBalance, isLoading: loadingCollages } = useReadContract({
    ...collageStakerConfig,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  const collageBalanceNum = collageBalance ? Number(collageBalance) : 0;

  const { data: collageTokenIds } = useReadContracts({
    contracts: Array.from({ length: collageBalanceNum }, (_, i) => ({
      ...collageStakerConfig,
      functionName: "tokenOfOwnerByIndex" as const,
      args: [address!, BigInt(i)] as const,
    })) as any,
    query: {
      enabled: !!address && collageBalanceNum > 0 && isConnected,
    },
  });

  // Cell size calculation
  useEffect(() => {
    const getGridCellSize = () => {
      if (typeof window === 'undefined') return 150;
      const viewportWidth = window.innerWidth;
      const maxGridWidth = Math.min(viewportWidth - 40, 1000);
      const calculatedSize = Math.floor(maxGridWidth / gridSize);
      return Math.max(Math.min(calculatedSize, 180), 80);
    };

    const updateSize = () => {
      setCellSize(getGridCellSize());
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [gridSize]);

  // Drag and drop handlers
  const handleDragStart = (nftId: string) => {
    const index = selectedNFTs.findIndex((id) => id === nftId);
    if (index !== -1) {
      setDraggedIndex(index);
    } else {
      setDraggedIndex(-1);
    }
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null) return;

    const newSelectedNFTs = [...selectedNFTs];
    
    if (draggedIndex === -1) {
      const sourceNFT = ownedNFTs.find((nft) => nft.id === selectedNFTs[targetIndex]);
      if (sourceNFT) {
        newSelectedNFTs[targetIndex] = sourceNFT.id;
      }
    } else {
      const draggedNFT = newSelectedNFTs[draggedIndex];
      const targetNFT = newSelectedNFTs[targetIndex];
      newSelectedNFTs[draggedIndex] = targetNFT || '';
      newSelectedNFTs[targetIndex] = draggedNFT;
    }
    
    setSelectedNFTs(newSelectedNFTs);
    setDraggedIndex(null);
  };

  const handleListItemDragStart = (nftId: string) => {
    setDraggedIndex(-1);
  };

  const handleListItemDrop = (targetIndex: number, nftId: string) => {
    const newSelectedNFTs = [...selectedNFTs];
    newSelectedNFTs[targetIndex] = nftId;
    setSelectedNFTs(newSelectedNFTs);
    setDraggedIndex(null);
  };

  // Click handler to add NFT to grid
  const handleNFTClick = (nftId: string) => {
    // Check if NFT is already in grid
    if (selectedNFTs.includes(nftId)) {
      // Remove it
      const newSelectedNFTs = selectedNFTs.map(id => id === nftId ? '' : id);
      setSelectedNFTs(newSelectedNFTs);
      return;
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
    setActiveTab("my-collages");
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
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontFamily: "monospace",
            textTransform: "uppercase",
            marginBottom: "30px",
            letterSpacing: "2px",
          }}
        >
          My Collages
        </h1>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        color: "#ffffff",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "40px",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <Link
              href="/"
              style={{
                color: "#ffffff",
                textDecoration: "none",
                fontSize: "24px",
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              ← MineBoy Grids
            </Link>
          </div>
          <ConnectButton />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "30px", borderBottom: "2px solid #333333" }}>
          <button
            onClick={() => setActiveTab("create")}
            style={{
              padding: "15px 30px",
              backgroundColor: "transparent",
              color: activeTab === "create" ? "#ffffff" : "#666666",
              border: "none",
              borderBottom: activeTab === "create" ? "2px solid #ffffff" : "2px solid transparent",
              cursor: "pointer",
              fontFamily: "monospace",
              textTransform: "uppercase",
              fontSize: "16px",
              fontWeight: "bold",
              marginBottom: "-2px",
            }}
          >
            Create Grid
          </button>
          <button
            onClick={() => setActiveTab("my-collages")}
            style={{
              padding: "15px 30px",
              backgroundColor: "transparent",
              color: activeTab === "my-collages" ? "#ffffff" : "#666666",
              border: "none",
              borderBottom: activeTab === "my-collages" ? "2px solid #ffffff" : "2px solid transparent",
              cursor: "pointer",
              fontFamily: "monospace",
              textTransform: "uppercase",
              fontSize: "16px",
              fontWeight: "bold",
              marginBottom: "-2px",
            }}
          >
            My Grids ({collageBalanceNum})
          </button>
        </div>

        {/* Create MineBoy Grid Tab */}
        {activeTab === "create" && (
          <div>
            <h2
              style={{
                fontSize: "24px",
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "2px",
                marginBottom: "20px",
              }}
            >
              Create New MineBoy Grid
            </h2>

            {/* Grid Size Selector */}
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  fontSize: "14px",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  marginRight: "10px",
                }}
              >
                Grid Size:
              </label>
              <select
                value={gridSize}
                onChange={(e) => {
                  setGridSize(parseInt(e.target.value));
                  setSelectedNFTs([]); // Clear selections when changing grid size
                }}
                style={{
                  padding: "8px",
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  border: "2px solid #ffffff",
                  fontFamily: "monospace",
                  fontSize: "14px",
                }}
              >
                <option value={2}>2x2 {ownedNFTs.length > 0 && ownedNFTs.length < 4 ? "(Need 4 NFTs)" : ""}</option>
                <option value={3}>3x3 {ownedNFTs.length > 0 && ownedNFTs.length < 9 ? "(Need 9 NFTs)" : ""}</option>
                <option value={4}>4x4 {ownedNFTs.length > 0 && ownedNFTs.length < 16 ? "(Need 16 NFTs)" : ""}</option>
                <option value={5}>5x5 {ownedNFTs.length > 0 && ownedNFTs.length < 25 ? "(Need 25 NFTs)" : ""}</option>
                <option value={6}>6x6 {ownedNFTs.length > 0 && ownedNFTs.length < 36 ? "(Need 36 NFTs)" : ""}</option>
              </select>
              <span
                style={{
                  marginLeft: "15px",
                  fontSize: "14px",
                  color: hasEnoughNFTs ? "#00ff00" : "#ff4444",
                  fontFamily: "monospace",
                }}
              >
                {hasEnoughNFTs ? `✓ You have ${ownedNFTs.length} NFTs` : `⚠ Need ${totalSlots} NFTs (you have ${ownedNFTs.length})`}
              </span>
            </div>

            {/* My NFTs List */}
            <div style={{ marginBottom: "30px" }}>
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
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: "10px",
                  maxHeight: "400px",
                  overflowY: "auto",
                  padding: "10px",
                  border: "2px solid #333333",
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
                        border: "2px solid #ffffff",
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
                  <div style={{ padding: "20px", color: "#666666", gridColumn: "1 / -1" }}>
                    No MineBoy NFTs found in your wallet
                  </div>
                ) : (
                  ownedNFTs.map((nft) => {
                    const isSelected = selectedNFTs.includes(nft.id);
                    return (
                      <div
                        key={nft.id}
                        draggable
                        onClick={() => handleNFTClick(nft.id)}
                        onDragStart={() => handleListItemDragStart(nft.id)}
                        style={{
                          cursor: "pointer",
                          border: isSelected ? "3px solid #00ff00" : "2px solid #ffffff",
                          padding: "5px",
                          backgroundColor: isSelected ? "#1a3d1a" : "#111111",
                          transition: "all 0.2s",
                          opacity: isSelected ? 0.6 : 1,
                        }}
                        title={isSelected ? "Click to remove from grid" : "Click or drag to add to grid"}
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

            {/* MineBoy Grid */}
            <div style={{ marginTop: "40px", marginBottom: "30px" }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  marginBottom: "15px",
                }}
              >
                MineBoy Grid ({gridSize}×{gridSize})
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
                  gap: "0px",
                  marginBottom: "20px",
                  backgroundColor: "#536AB3",
                  width: "fit-content",
                  margin: "0 auto 20px auto",
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
                        if (draggedIndex === -1) {
                          // Dragged from list
                          handleListItemDrop(index, ownedNFTs[0]?.id);
                        } else if (draggedIndex !== null) {
                          // Dragged from grid (reorder)
                          handleDrop(index);
                        }
                      }}
                      draggable={!!nft}
                      onDragStart={() => nft && handleDragStart(nft.id)}
                      onDragEnd={(e) => nft && handleGridDragEnd(e, index)}
                      style={{
                        width: `${cellSize}px`,
                        height: `${cellSize}px`,
                        backgroundColor: "#536AB3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: nft ? "move" : "default",
                        opacity: draggedIndex === index ? 0.5 : 1,
                        outline: draggedIndex === index ? "3px dashed #00ff00" : "none",
                        outlineOffset: "-3px",
                      }}
                      title={nft ? "Drag to reorder or drag outside to remove" : "Drag or click an NFT to add here"}
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
                {!isGridFull && (
                  <div style={{ fontSize: "14px", color: "#ff4444", fontFamily: "monospace", textAlign: "center" }}>
                    Grid must be completely full to mint ({selectedNFTs.filter(id => id).length}/{totalSlots} filled)
                  </div>
                )}
                <MintCollageButton
                  rows={gridSize}
                  cols={gridSize}
                  selectedTokenIds={getSelectedTokenIds()}
                  onMinted={handleMintSuccess}
                  disabled={!isConnected || !isGridFull}
                />
              </div>
            </div>
          </div>
        )}

        {/* My MineBoy Grids Tab */}
        {activeTab === "my-collages" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "30px",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  margin: 0,
                }}
              >
                Your Minted MineBoy Grids
              </h2>
              <button
                onClick={handleRefresh}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "transparent",
                  color: "#ffffff",
                  border: "2px solid #ffffff",
                  cursor: "pointer",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  fontSize: "12px",
                }}
              >
                Refresh
              </button>
            </div>

            {loadingCollages ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#666666" }}>Loading...</div>
            ) : collageBalanceNum === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  border: "2px dashed #333333",
                  color: "#666666",
                }}
              >
                <p style={{ fontSize: "18px", marginBottom: "10px" }}>No MineBoy grids yet</p>
                <p style={{ fontSize: "14px" }}>
                  Create your first grid using the "Create Grid" tab!
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
                {collageTokenIds?.map((result: any, index: number) => {
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

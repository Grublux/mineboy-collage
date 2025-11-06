"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import Link from "next/link";
import { gridStakerConfig } from "@/frontend/lib/contracts/gridStaker";
import { ngtTokenAddress, ERC20_ABI } from "@/frontend/lib/contracts/gridStaker";
import { formatUnits } from "viem";
import { useTokenMetadata } from "@/frontend/hooks/useTokenMetadata";
import { UnbindButton } from "@/components/collage/UnbindButton";
import { MintGridButton } from "@/components/collage/MintGridButton";
import { SnapshotDialog } from "@/components/collage/SnapshotDialog";
import { useState, useEffect } from "react";
import { WalletHeader } from "@/components/grids/WalletHeader";
import { Header } from "@/components/grids/Header";

// TODO: Replace with Goobaloo collection address
const Goobaloo_COLLECTION_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;

// GridCard component for displaying minted grids
function GridCard({
  gridId,
  onUnbind,
}: {
  gridId: bigint;
  onUnbind: () => void;
}) {
  const { data: tokenURI } = useReadContract({
    ...gridStakerConfig,
    functionName: "tokenURI",
    args: [gridId],
  });

  const { data: underlying } = useReadContract({
    ...gridStakerConfig,
    functionName: "getUnderlying",
    args: [gridId],
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
        <Link href={`/collage/${gridId.toString()}`}>
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
              alt={metadata.name || `Goobaloo Grid #${gridId}`}
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
          {metadata?.name || `Goobaloo Grid #${gridId}`}
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
          href={`/collage/${gridId.toString()}`}
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
        <UnbindButton collageId={gridId} onSuccess={onUnbind} />
      </div>
    </div>
  );
}

export default function GoobalooGridsPage() {
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

  const [activeTab, setActiveTab] = useState<"create" | "my-grids">("create");
  const [refreshKey, setRefreshKey] = useState(0);

  // State for Create Grid tab
  const [selectedNFTs, setSelectedNFTs] = useState<string[]>([]);
  const [gridSize, setGridSize] = useState<number>(2);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [cellSize, setCellSize] = useState(100);
  const [showSnapshotDialog, setShowSnapshotDialog] = useState(false);
  const [mintedCollageId, setMintedCollageId] = useState<bigint | null>(null);
  const [loadedTileImages, setLoadedTileImages] = useState<HTMLImageElement[]>([]);

  const totalSlots = gridSize * gridSize;

  // TODO: Implement NFT fetching for Goobaloo collection
  const [ownedNFTs, setOwnedNFTs] = useState<any[]>([]);
  const [loadingNFTs, setLoadingNFTs] = useState(false);

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
    if (selectedNFTs.includes(nftId)) {
      const newSelectedNFTs = selectedNFTs.map(id => id === nftId ? '' : id);
      setSelectedNFTs(newSelectedNFTs);
      return;
    }

    const emptyIndex = selectedNFTs.findIndex(id => !id);
    if (emptyIndex !== -1) {
      const newSelectedNFTs = [...selectedNFTs];
      newSelectedNFTs[emptyIndex] = nftId;
      setSelectedNFTs(newSelectedNFTs);
    } else {
      if (gridSize < 6) {
        const newSize = gridSize + 1;
        const newSlots = newSize * newSize;
        const newSelectedNFTs = [...selectedNFTs];
        while (newSelectedNFTs.length < newSlots) {
          newSelectedNFTs.push('');
        }
        newSelectedNFTs[selectedNFTs.length] = nftId;
        setSelectedNFTs(newSelectedNFTs);
      }
    }
  };

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

  const isGridFull = selectedNFTs.length >= totalSlots && selectedNFTs.filter(id => id).length === totalSlots;
  const hasEnoughNFTs = ownedNFTs.length >= totalSlots;

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Read user's Goobaloo grids
  const { data: gridBalance, isLoading: loadingGrids } = useReadContract({
    ...gridStakerConfig,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  const gridBalanceNum = gridBalance ? Number(gridBalance) : 0;

  const { data: gridTokenIds } = useReadContracts({
    contracts: Array.from({ length: gridBalanceNum }, (_, i) => ({
      ...gridStakerConfig,
      functionName: "tokenOfOwnerByIndex" as const,
      args: [address!, BigInt(i)] as const,
    })) as any,
    query: {
      enabled: !!address && gridBalanceNum > 0 && isConnected,
    },
  });

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
        <WalletHeader />
        <Header title="Goobaloo Grids" />
        <div style={{ textAlign: "center", padding: "40px" }}>
          Please connect your wallet to continue.
        </div>
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
        <WalletHeader />
        
        <div style={{ marginBottom: "40px" }}>
          <Link
            href="/"
            style={{
              color: "#ffffff",
              textDecoration: "none",
              fontSize: "24px",
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: "2px",
              marginBottom: "20px",
              display: "inline-block",
            }}
          >
            ← Grids
          </Link>
          <Header title="Goobaloo Grids" />
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
            onClick={() => setActiveTab("my-grids")}
            style={{
              padding: "15px 30px",
              backgroundColor: "transparent",
              color: activeTab === "my-grids" ? "#ffffff" : "#666666",
              border: "none",
              borderBottom: activeTab === "my-grids" ? "2px solid #ffffff" : "2px solid transparent",
              cursor: "pointer",
              fontFamily: "monospace",
              textTransform: "uppercase",
              fontSize: "16px",
              fontWeight: "bold",
              marginBottom: "-2px",
            }}
          >
            My Goobaloo Grids ({gridBalanceNum})
          </button>
        </div>

        {/* Create Grid Tab */}
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
              Create New Goobaloo Grid
            </h2>

            {/* Grid Size Selector */}
            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <div style={{ marginBottom: "10px", fontSize: "14px", fontFamily: "monospace", textTransform: "uppercase" }}>
                Grid Size: (Current: {gridSize}×{gridSize})
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
                {[2, 3, 4, 5, 6].map((size) => (
                  <button
                    key={size}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setGridSize(size);
                      setSelectedNFTs([]);
                    }}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: gridSize === size ? "#ffffff" : "#000000",
                      color: gridSize === size ? "#000000" : "#ffffff",
                      border: "2px solid #ffffff",
                      cursor: "pointer",
                      fontFamily: "monospace",
                      fontSize: "14px",
                      fontWeight: gridSize === size ? "bold" : "normal",
                    }}
                  >
                    {size}×{size}
                  </button>
                ))}
              </div>
            </div>

            {/* TODO: Implement Goobaloo NFT fetching and display */}
            <div style={{ marginBottom: "80px", paddingBottom: "40px" }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  marginBottom: "15px",
                }}
              >
                Your Goobaloo NFTs ({ownedNFTs.length})
              </h3>
              <div style={{ padding: "20px", color: "#666666", textAlign: "center" }}>
                Goobaloo collection integration coming soon
              </div>
            </div>

            {/* Goobaloo Grid */}
            <div style={{ marginBottom: "30px", paddingTop: "40px" }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  marginBottom: "15px",
                }}
              >
                Goobaloo Grid ({gridSize}×{gridSize})
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
                      onDrop={() => handleDrop(index)}
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
                      }}
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

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                {!isGridFull && (
                  <div style={{ fontSize: "14px", color: "#ff4444", fontFamily: "monospace", textAlign: "center" }}>
                    Grid must be completely full to mint ({selectedNFTs.filter(id => id).length}/{totalSlots} filled)
                  </div>
                )}
                <MintGridButton
                  rows={gridSize}
                  cols={gridSize}
                  selectedNFTs={selectedNFTs}
                  onMinted={handleMintSuccess}
                  disabled={!isConnected || !isGridFull}
                />
              </div>
            </div>
          </div>
        )}

        {/* My Goobaloo Grids Tab */}
        {activeTab === "my-grids" && (
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
                Your Minted Goobaloo Grids
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

            {loadingGrids ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#666666" }}>Loading...</div>
            ) : gridBalanceNum === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  border: "2px dashed #333333",
                  color: "#666666",
                }}
              >
                <p style={{ fontSize: "18px", marginBottom: "10px" }}>No Goobaloo grids yet</p>
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
                {gridTokenIds?.map((result: any, index: number) => {
                  if (result.status === "success" && result.result) {
                    return (
                      <GridCard
                        key={index}
                        gridId={result.result as bigint}
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


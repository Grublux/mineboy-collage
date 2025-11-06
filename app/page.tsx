"use client";

export const dynamic = 'force-dynamic';

import { useAccount, useReadContract } from "wagmi";
import { useState, useEffect } from "react";
import { SnapshotDialog } from "@/components/collage/SnapshotDialog";
import { WalletHeader } from "@/components/grids/WalletHeader";
import { Header } from "@/components/grids/Header";
import { CollectionLinks } from "@/components/grids/CollectionLinks";
import { ngtTokenAddress, ERC20_ABI } from "@/frontend/lib/contracts/gridStaker";
import { formatUnits } from "viem";

const collections = [
  { name: "MineBoy Grids", href: "/mineboy-grids" },
  { name: "NPC Grids", href: "/npc-grids" },
  { name: "Goobaloo Grids", href: "/goobaloo-grids" },
];

export default function HomePage() {
  const { isConnected } = useAccount();
  const [selectedNFTs, setSelectedNFTs] = useState<string[]>([]);
  const [gridSize, setGridSize] = useState<number>(2);
  const [manualMode, setManualMode] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [manualNFTs, setManualNFTs] = useState<any[]>([]);
  const [loadingManual, setLoadingManual] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [touchStartIndex, setTouchStartIndex] = useState<number | null>(null);
  const [touchCurrentPos, setTouchCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingTouch, setIsDraggingTouch] = useState(false);
  
  // Snapshot dialog state
  const [showSnapshotDialog, setShowSnapshotDialog] = useState(false);
  const [mintedCollageId, setMintedCollageId] = useState<bigint | null>(null);
  const [loadedTileImages, setLoadedTileImages] = useState<HTMLImageElement[]>([]);

  const totalSlots = gridSize * gridSize;

  const [cellSize, setCellSize] = useState(200);

  // Update cell size on mount and resize
  useEffect(() => {
    const getGridCellSize = () => {
      if (typeof window === 'undefined') return 200;
      const viewportWidth = window.innerWidth;
      const maxGridWidth = Math.min(viewportWidth - 40, 1200); // 20px padding on each side, max 1200px
      const calculatedSize = Math.floor(maxGridWidth / gridSize);
      return Math.max(Math.min(calculatedSize, 200), 80); // Min 80px, max 200px per cell
    };

    const updateSize = () => {
      setCellSize(getGridCellSize());
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [gridSize]);

  // Auto-expand grid when more NFTs selected than current capacity
  useEffect(() => {
    const count = selectedNFTs.filter(id => id).length;
    const currentCapacity = gridSize * gridSize;
    
    // Only expand if we have more NFTs than current capacity
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
          preserved.push(undefined as any);
        }
        setSelectedNFTs(preserved);
        setGridSize(newSize);
      }
    }
  }, [selectedNFTs, gridSize]);

  const fetchManualNFTs = async () => {
    if (!manualInput.trim()) return;
    
    setLoadingManual(true);
    try {
      const tokenIds = manualInput.split(',').map(id => id.trim()).filter(id => id);
      
      // Filter out already loaded token IDs
      const existingIds = manualNFTs.map(nft => nft.tokenId);
      const newTokenIds = tokenIds.filter(id => !existingIds.includes(id));
      
      if (newTokenIds.length === 0) {
        setLoadingManual(false);
        setManualInput('');
        return;
      }
      
      const nftPromises = newTokenIds.map(async (tokenId) => {
        try {
          // Use public RPC to fetch tokenURI
          const response = await fetch(`https://apechain.calderachain.xyz/http`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_call',
              params: [{
                to: '0xa8A16C3259aD84162a0868E7927523B81eF8BF2D',
                data: `0xc87b56dd${BigInt(tokenId).toString(16).padStart(64, '0')}`
              }, 'latest'],
              id: 1
            })
          });
          
          const result = await response.json();
          console.log(`Token ${tokenId} RPC result:`, result);
          
          if (result.error) {
            console.error(`RPC error for token ${tokenId}:`, result.error);
            throw new Error(result.error.message);
          }
          
          // Decode the hex response to get the URI
          const hexData = result.result;
          let uri = '';
          
          // The response is ABI-encoded, skip first 64 chars (0x + offset), then get the string
          if (hexData && hexData.length > 130) {
            const dataStart = 130; // Skip 0x + 64 bytes offset
            const hexString = hexData.slice(dataStart);
            const bytes = hexString.match(/.{1,2}/g) || [];
            
            for (const byte of bytes) {
              const charCode = parseInt(byte, 16);
              if (charCode === 0) break; // Stop at null terminator
              if (charCode >= 32 && charCode <= 126) { // Only printable ASCII
                uri += String.fromCharCode(charCode);
              }
            }
          }
          
          console.log(`Token ${tokenId} URI:`, uri);
          
          let metadata;
          let image = '';
          
          if (uri) {
            try {
              const metadataResponse = await fetch(uri);
              metadata = await metadataResponse.json();
              image = metadata.image || '';
              console.log(`Token ${tokenId} metadata:`, metadata);
            } catch (err) {
              console.error(`Failed to fetch metadata for ${tokenId}:`, err);
            }
          }
          
          return {
            id: `manual-${tokenId}`,
            name: metadata?.name || `MineBoy #${tokenId}`,
            image: image,
            tokenId: tokenId,
            contract: '0xa8A16C3259aD84162a0868E7927523B81eF8BF2D'
          };
        } catch (err) {
          console.error(`Error fetching token ${tokenId}:`, err);
          return null;
        }
      });
      
      const fetched = (await Promise.all(nftPromises)).filter(nft => nft !== null);
      
      // Append to existing NFTs instead of replacing
      setManualNFTs([...manualNFTs, ...fetched]);
      setManualInput(''); // Clear input after successful fetch
    } catch (err) {
      console.error('Error fetching manual NFTs:', err);
    } finally {
      setLoadingManual(false);
    }
  };

  // const displayedNFTs = manualMode ? manualNFTs : nfts;
  const displayedNFTs = manualNFTs;

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }

    // Create a copy with all slots filled (pad with undefined if needed)
    const newSelectedNFTs = [...selectedNFTs];
    
    // Ensure array is large enough
    while (newSelectedNFTs.length < totalSlots) {
      newSelectedNFTs.push(undefined as any);
    }
    
    // Swap the NFTs at draggedIndex and targetIndex
    const temp = newSelectedNFTs[draggedIndex];
    newSelectedNFTs[draggedIndex] = newSelectedNFTs[targetIndex];
    newSelectedNFTs[targetIndex] = temp;
    
    // Filter out undefined at the end (unless they're in the middle)
    setSelectedNFTs(newSelectedNFTs);
    setDraggedIndex(null);
  };

  const toggleNFTSelection = (nftId: string) => {
    setSelectedNFTs((prev) => {
      if (prev.includes(nftId)) {
        // Remove this NFT from the grid
        return prev.filter((id) => id !== nftId);
      } else {
        // Find the first available slot (allow adding beyond current grid size for auto-expansion)
        const newSelectedNFTs = [...prev];
        
        // Find first empty slot - search through current array
        for (let i = 0; i < newSelectedNFTs.length; i++) {
          if (!newSelectedNFTs[i]) {
            newSelectedNFTs[i] = nftId;
            return newSelectedNFTs;
          }
        }
        
        // No empty slot found - add to the end (will trigger auto-expand)
        newSelectedNFTs.push(nftId);
        return newSelectedNFTs;
      }
    });
  };

  const handleDragStartFromGallery = (e: React.DragEvent, nftId: string) => {
    e.dataTransfer.setData('nftId', nftId);
  };

  const handleDropIntoGrid = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    const nftId = e.dataTransfer.getData('nftId');
    
    if (nftId) {
      // Dragging from gallery into grid
      setSelectedNFTs((prev) => {
        const newSelectedNFTs = [...prev];
        
        // Ensure array is large enough
        while (newSelectedNFTs.length <= targetIndex) {
          newSelectedNFTs.push(undefined as any);
        }
        
        // Check if this NFT is already in the grid
        const existingIndex = newSelectedNFTs.findIndex(id => id === nftId);
        if (existingIndex !== -1) {
          // Remove from old position
          newSelectedNFTs[existingIndex] = undefined as any;
        }
        
        // Place in new position (swap if occupied)
        if (newSelectedNFTs[targetIndex]) {
          // Slot is occupied, find next empty slot for the displaced NFT
          const displacedNFT = newSelectedNFTs[targetIndex];
          newSelectedNFTs[targetIndex] = nftId;
          
          // Try to place displaced NFT in the first empty slot
          for (let i = 0; i < totalSlots; i++) {
            if (!newSelectedNFTs[i]) {
              newSelectedNFTs[i] = displacedNFT;
              break;
            }
          }
        } else {
          newSelectedNFTs[targetIndex] = nftId;
        }
        
        return newSelectedNFTs;
      });
    } else if (draggedIndex !== null) {
      // Dragging within grid (existing logic)
      handleDrop(e, targetIndex);
    }
  };

  // Touch handlers for mobile - grid drag only
  const handleTouchStartFromGrid = (e: React.TouchEvent, index: number) => {
    e.preventDefault();
    const touch = e.touches[0];
    setTouchStartIndex(index);
    setTouchCurrentPos({ x: touch.clientX, y: touch.clientY });
    setIsDraggingTouch(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartIndex === null) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    setTouchCurrentPos({ x: touch.clientX, y: touch.clientY });
    setIsDraggingTouch(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDraggingTouch) {
      // Just a tap, not a drag - clear states
      setTouchStartIndex(null);
      setTouchCurrentPos(null);
      setIsDraggingTouch(false);
      return;
    }

    e.preventDefault();
    const touch = e.changedTouches[0];
    
    // Find which grid slot we're over
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    let targetIndex = -1;
    
    for (const el of elements) {
      const dataIndex = el.getAttribute('data-grid-index');
      if (dataIndex !== null) {
        targetIndex = parseInt(dataIndex);
        break;
      }
    }

    if (targetIndex !== -1 && touchStartIndex !== null && touchStartIndex !== targetIndex) {
      // Touch drag within grid (swap)
      const newSelectedNFTs = [...selectedNFTs];
      
      // Ensure array is large enough
      while (newSelectedNFTs.length < totalSlots) {
        newSelectedNFTs.push(undefined as any);
      }
      
      // Swap the NFTs
      const temp = newSelectedNFTs[touchStartIndex];
      newSelectedNFTs[touchStartIndex] = newSelectedNFTs[targetIndex];
      newSelectedNFTs[targetIndex] = temp;
      
      setSelectedNFTs(newSelectedNFTs);
    }

    // Reset all touch states
    setTouchStartIndex(null);
    setTouchCurrentPos(null);
    setIsDraggingTouch(false);
  };

  const handleTouchCancel = () => {
    setTouchStartIndex(null);
    setTouchCurrentPos(null);
    setIsDraggingTouch(false);
  };

  const downloadGrid = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const originalSize = 24; // Original NFT size
    const scale = 20; // Scale factor (20x = 480px per NFT)
    const scaledSize = originalSize * scale;
    canvas.width = gridSize * scaledSize;
    canvas.height = gridSize * scaledSize;

    // Disable smoothing for pixel-perfect rendering
    ctx.imageSmoothingEnabled = false;
    (ctx as any).mozImageSmoothingEnabled = false;
    (ctx as any).webkitImageSmoothingEnabled = false;
    (ctx as any).msImageSmoothingEnabled = false;

    // Fill background with MineBoy blue color
    ctx.fillStyle = '#536AB3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load and draw each NFT image
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
      for (let i = 0; i < totalSlots; i++) {
        const nftId = selectedNFTs[i];
        if (nftId) {
          const nft = displayedNFTs.find((n: any) => n.id === nftId);
          if (nft?.image) {
            const img = await loadImage(nft.image);
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            ctx.drawImage(img, col * scaledSize, row * scaledSize, scaledSize, scaledSize);
          }
        }
      }

      // Download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mineboy_grid_${gridSize}x${gridSize}_${canvas.width}x${canvas.height}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (err) {
      console.error('Error creating grid:', err);
    }
  };

  const downloadScaledImage = async (imageUrl: string, name: string, scale: number = 20) => {
    try {
      // Fetch the image
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const img = new Image();
      
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;
        
        // Set canvas size to scaled dimensions
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        // Disable image smoothing for pixel-perfect scaling
        ctx.imageSmoothingEnabled = false;
        (ctx as any).mozImageSmoothingEnabled = false;
        (ctx as any).webkitImageSmoothingEnabled = false;
        (ctx as any).msImageSmoothingEnabled = false;
        
        // Draw scaled image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (!blob) return;
          
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${name}_${canvas.width}x${canvas.height}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 'image/png');
      };
      
      img.src = URL.createObjectURL(blob);
    } catch (err) {
      console.error('Error downloading image:', err);
    }
  };

  // Get the currently dragged NFT for ghost image (only from grid)
  const getDraggedNFT = () => {
    if (touchStartIndex !== null) {
      const nftId = selectedNFTs[touchStartIndex];
      return nftId ? displayedNFTs.find((n: any) => n.id === nftId) : null;
    }
    return null;
  };

  const draggedNFT = getDraggedNFT();

  // Handle mint success - load tile images and show snapshot dialog
  const handleMintSuccess = async (collageId: bigint) => {
    setMintedCollageId(collageId);
    
    // Load tile images for snapshot dialog
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
          const nft = displayedNFTs.find((n: any) => n.id === nftId);
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
      // Still show dialog even if images fail to load
      setShowSnapshotDialog(true);
    }
  };

  const handleSnapshotDialogClose = () => {
    setShowSnapshotDialog(false);
    setMintedCollageId(null);
    setLoadedTileImages([]);
  };

  const handleSnapshotSuccess = () => {
    handleSnapshotDialogClose();
    // Could navigate to the grid detail page or my-grids
  };

  // Get selected token IDs as numbers for minting
  const getSelectedTokenIds = (): number[] => {
    return selectedNFTs
      .map(nftId => {
        const nft = displayedNFTs.find((n: any) => n.id === nftId);
        return nft ? parseInt(nft.tokenId) : null;
      })
      .filter((id): id is number => id !== null);
  };

  return (
    <>
      <style jsx global>{`
        body {
          overflow-x: hidden !important;
          scroll-behavior: auto !important;
        }
        * {
          scroll-behavior: auto !important;
        }
        [data-rk] {
          z-index: 9999 !important;
        }
        [data-rk] [role="dialog"] {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          max-height: 85vh !important;
          width: fit-content !important;
          min-width: 360px !important;
          max-width: 90vw !important;
          overflow-y: auto !important;
          z-index: 9999 !important;
          display: block !important;
        }
        [data-rk] [role="dialog"] > div {
          max-height: 75vh !important;
          overflow-y: auto !important;
        }
        [data-rk] [data-testid="rk-wallet-option-learn"] {
          display: none !important;
        }
        [data-rk] a[href*="learn"] {
          display: none !important;
        }
        img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: -moz-crisp-edges;
          image-rendering: -o-crisp-edges;
          image-rendering: pixelated;
          -ms-interpolation-mode: nearest-neighbor;
        }
      `}</style>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff',
        fontFamily: 'monospace',
        width: '100%',
        margin: 0,
        padding: 0
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
          {/* Wallet Header */}
          <WalletHeader />
          
          {/* Page Header */}
          <Header title="Grids" />
          
          {/* Collection Links */}
          <CollectionLinks collections={collections} />
          
          {/* Fetch Input Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            padding: '20px'
          }}>
          {/* <ConnectButton /> */}
          
          <div style={{ textAlign: 'center' }}>
            {/* <button
              onClick={() => setManualMode(!manualMode)}
              style={{
                padding: '10px 20px',
                backgroundColor: manualMode ? '#00ff00' : '#ffffff',
                color: '#000000',
                border: '2px solid #ffffff',
                cursor: 'pointer',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                fontSize: '14px',
                marginBottom: '15px'
              }}
            >
              {manualMode ? '✓ Manual Mode' : 'Enter MineBoy Number'}
            </button> */}
            
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <div style={{ fontSize: '14px', fontFamily: 'monospace', color: '#ffffff' }}>
                download MineBoy images below
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '500px' }}>
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    fetchManualNFTs();
                  }
                }}
                placeholder="Enter MineBoy numbers (e.g., 1, 42, 100)"
                style={{
                  padding: '10px',
                  width: '100%',
                  maxWidth: '300px',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  border: '2px solid #ffffff',
                  fontFamily: 'monospace',
                  fontSize: '14px'
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  fetchManualNFTs();
                }}
                disabled={loadingManual}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  border: '2px solid #ffffff',
                  cursor: loadingManual ? 'not-allowed' : 'pointer',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  fontSize: '14px',
                  opacity: loadingManual ? 0.5 : 1,
                  width: '100%',
                  maxWidth: '300px'
                }}
              >
                {loadingManual ? 'Loading...' : 'Fetch'}
              </button>
            </div>
          </div>
        </div>

        {/* {(isConnected || manualMode) && ( */}
        <div style={{
          padding: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {displayedNFTs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              {loadingManual ? 'Loading NFTs...' : 'Enter MineBoy numbers above to display NFTs'}
            </div>
          ) : (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ marginBottom: '10px' }}>
                    Found {displayedNFTs.length} NFT{displayedNFTs.length !== 1 ? 's' : ''}
                    {loadingManual && <span style={{ marginLeft: '10px', color: '#ffff00' }}>Loading more...</span>}
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#00ff00',
                    fontFamily: 'monospace'
                  }}>
                    Click/tap MineBoy to add to grid
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '20px',
                  justifyContent: 'center'
                }}>
                      {displayedNFTs.map((nft) => {
                        const isSelected = selectedNFTs.includes(nft.id);
                        return (
                          <div
                            key={nft.id}
                            style={{
                              border: isSelected ? '4px solid #00ff00' : '2px solid #ffffff',
                              padding: '10px',
                              position: 'relative',
                              width: '120px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              backgroundColor: isSelected ? '#003300' : 'transparent'
                            }}
                          >
                            <div style={{
                              width: '100px',
                              height: '100px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {nft.image && (
                                <img
                                  src={nft.image}
                                  alt={nft.name}
                                  width="100"
                                  height="100"
                                  onClick={() => toggleNFTSelection(nft.id)}
                                  style={{
                                    width: '100px',
                                    height: '100px',
                                    objectFit: 'contain',
                                    imageRendering: 'pixelated',
                                    cursor: 'pointer',
                                    display: 'block'
                                  } as React.CSSProperties}
                                />
                              )}
                            </div>
                      <div style={{ marginTop: '8px', fontSize: '12px' }}>
                        {nft.name}
                      </div>
                      <div style={{ fontSize: '10px', opacity: 0.7 }}>
                        #{nft.tokenId}
                      </div>
                      <button
                        onClick={() => downloadScaledImage(nft.image, nft.name)}
                        style={{
                          marginTop: '8px',
                          padding: '6px 8px',
                          backgroundColor: '#ffffff',
                          color: '#000000',
                          border: '2px solid #ffffff',
                          cursor: 'pointer',
                          fontFamily: 'monospace',
                          textTransform: 'uppercase',
                          fontSize: '9px',
                          width: '100%'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#000000';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.color = '#000000';
                        }}
                      >
                        DL 480x480
                      </button>
                    </div>
                  );
                  })}
                </div>

                {/* Grid Size Selector - Button Style */}
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: '30px',
                  marginBottom: '30px'
                }}>
                  <div style={{ marginBottom: '10px', fontSize: '14px' }}>
                    Grid Size:
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {[2, 3, 4, 5, 6].map((size) => (
                      <button
                        key={size}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setGridSize(size);
                          // Trim selection if it exceeds new grid size
                          const maxSlots = size * size;
                          if (selectedNFTs.length > maxSlots) {
                            setSelectedNFTs(selectedNFTs.slice(0, maxSlots));
                          }
                        }}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: gridSize === size ? '#ffffff' : '#000000',
                          color: gridSize === size ? '#000000' : '#ffffff',
                          border: '2px solid #ffffff',
                          cursor: 'pointer',
                          fontFamily: 'monospace',
                          fontSize: '14px',
                          fontWeight: gridSize === size ? 'bold' : 'normal'
                        }}
                        onMouseOver={(e) => {
                          if (gridSize !== size) {
                            e.currentTarget.style.backgroundColor = '#333333';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (gridSize !== size) {
                            e.currentTarget.style.backgroundColor = '#000000';
                          }
                        }}
                      >
                        {size}×{size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drag Instructions */}
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: '20px',
                  fontSize: '14px',
                  color: '#888888',
                  fontFamily: 'monospace'
                }}>
                  Drag MineBoy to position
                </div>

                {/* MineBoy Grid Area */}
                <div style={{ marginTop: '20px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    MineBoy Grid ({selectedNFTs.filter(id => id).length} selected - {gridSize}x{gridSize})
                  </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '20px'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                        gap: '0',
                        backgroundColor: '#536AB3',
                        width: '100%',
                        maxWidth: `${cellSize * gridSize}px`,
                        margin: '0 auto',
                        aspectRatio: '1 / 1'
                      }}>
                        {Array.from({ length: totalSlots }).map((_, index) => {
                          const nftId = selectedNFTs[index];
                          const nft = nftId ? displayedNFTs.find((n: any) => n.id === nftId) : null;
                          const isDragging = draggedIndex === index;
                          const isTouchActive = (touchStartIndex === index);
                          
                          return (
                            <div
                              key={index}
                              data-grid-index={index}
                              draggable={!!nft}
                              onDragStart={() => handleDragStart(index)}
                              onDragOver={(e) => handleDragOver(e, index)}
                              onDrop={(e) => handleDropIntoGrid(e, index)}
                              onTouchStart={(e) => nft && handleTouchStartFromGrid(e, index)}
                              onTouchMove={handleTouchMove}
                              onTouchEnd={handleTouchEnd}
                              onTouchCancel={handleTouchCancel}
                              style={{
                                width: `${cellSize}px`,
                                height: `${cellSize}px`,
                                backgroundColor: '#536AB3',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: nft ? 'move' : 'default',
                                opacity: isDragging || (touchStartIndex === index) ? 0.5 : 1,
                                border: (isDragging || isTouchActive) ? '3px dashed #00ff00' : 'none',
                                transition: 'opacity 0.2s, border 0.2s',
                                touchAction: 'none'
                              }}
                            >
                              {nft?.image && (
                                <img
                                  src={nft.image}
                                  alt={nft.name}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    imageRendering: 'pixelated',
                                    pointerEvents: 'none'
                                  } as React.CSSProperties}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        gap: '15px',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}>
                        {/* Download Button - local high-res export (separate from on-chain) */}
                        <button
                          onClick={downloadGrid}
                          disabled={selectedNFTs.filter(id => id).length === 0}
                          style={{
                            padding: '12px 24px',
                            backgroundColor: '#ffffff',
                            color: '#000000',
                            border: '2px solid #ffffff',
                            cursor: selectedNFTs.filter(id => id).length === 0 ? 'not-allowed' : 'pointer',
                            fontFamily: 'monospace',
                            textTransform: 'uppercase',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            opacity: selectedNFTs.filter(id => id).length === 0 ? 0.5 : 1
                          }}
                          onMouseOver={(e) => {
                            if (selectedNFTs.filter(id => id).length > 0) {
                              e.currentTarget.style.backgroundColor = '#000000';
                              e.currentTarget.style.color = '#ffffff';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (selectedNFTs.filter(id => id).length > 0) {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                              e.currentTarget.style.color = '#000000';
                            }
                          }}
                        >
                          Download Grid (Local)
                        </button>
                      </div>
                    </div>
                </div>
              </div>
            )}
        </div>
        {/* )} */}
      </div>

      {/* Ghost image for touch drag */}
      {isDraggingTouch && draggedNFT && touchCurrentPos && (
        <div
          style={{
            position: 'fixed',
            left: touchCurrentPos.x - 75,
            top: touchCurrentPos.y - 75,
            width: '150px',
            height: '150px',
            pointerEvents: 'none',
            zIndex: 10000,
            opacity: 0.7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            border: '3px solid #00ff00',
            borderRadius: '8px'
          }}
        >
          <img
            src={draggedNFT.image}
            alt={draggedNFT.name}
            style={{
              width: '120px',
              height: '120px',
              objectFit: 'contain',
              imageRendering: 'pixelated'
            } as React.CSSProperties}
          />
        </div>
      )}

      {/* Snapshot Dialog - shown after minting */}
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
    </>
  );
}

"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";
import { useNFTs } from "@/hooks/useNFTs";
import { useState } from "react";

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { nfts, loading, error } = useNFTs();
  const [selectedNFTs, setSelectedNFTs] = useState<string[]>([]);
  const [gridSize, setGridSize] = useState<number>(2);

  const totalSlots = gridSize * gridSize;

  const toggleNFTSelection = (nftId: string) => {
    setSelectedNFTs((prev) => {
      if (prev.includes(nftId)) {
        return prev.filter((id) => id !== nftId);
      } else {
        // Max selection based on current grid size
        if (prev.length >= totalSlots) return prev;
        return [...prev, nftId];
      }
    });
  };

  const downloadCollage = async () => {
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
          const nft = nfts.find((n) => n.id === nftId);
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
        a.download = `mineboy_collage_${gridSize}x${gridSize}_${canvas.width}x${canvas.height}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (err) {
      console.error('Error creating collage:', err);
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

  return (
    <>
      <style jsx global>{`
        body {
          overflow-x: hidden !important;
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
        <header style={{
          padding: '20px',
          fontSize: '24px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: 0 }}>MineBoy Collage</h1>
        </header>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <ConnectButton />
        </div>

        {isConnected && (
          <div style={{
            padding: '20px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                Loading NFTs...
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#ff6b6b' }}>
                Error: {error}
              </div>
            ) : nfts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                No NFTs found in this wallet
              </div>
            ) : (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  Found {nfts.length} NFT{nfts.length !== 1 ? 's' : ''}
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '20px',
                  justifyContent: 'center'
                }}>
                  {nfts.map((nft) => {
                    const isSelected = selectedNFTs.includes(nft.id);
                    return (
                      <div
                        key={nft.id}
                        style={{
                          border: isSelected ? '4px solid #00ff00' : '2px solid #ffffff',
                          padding: '10px',
                          position: 'relative',
                          width: '220px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          backgroundColor: isSelected ? '#003300' : 'transparent'
                        }}
                      >
                        {nft.image && (
                          <img
                            src={nft.image}
                            alt={nft.name}
                            onClick={() => toggleNFTSelection(nft.id)}
                            style={{
                              width: '200px',
                              height: '200px',
                              objectFit: 'contain',
                              imageRendering: 'pixelated',
                              cursor: 'pointer'
                            } as React.CSSProperties}
                          />
                        )}
                      <div style={{ marginTop: '10px', fontSize: '14px' }}>
                        {nft.name}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.7 }}>
                        #{nft.tokenId}
                      </div>
                      <button
                        onClick={() => downloadScaledImage(nft.image, nft.name)}
                        style={{
                          marginTop: '10px',
                          padding: '8px 16px',
                          backgroundColor: '#ffffff',
                          color: '#000000',
                          border: '2px solid #ffffff',
                          cursor: 'pointer',
                          fontFamily: 'monospace',
                          textTransform: 'uppercase',
                          fontSize: '12px',
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
                        Download 480x480
                      </button>
                    </div>
                  );
                  })}
                </div>

                {/* Grid Size Selector */}
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: '30px',
                  marginBottom: '30px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <label style={{ fontSize: '14px' }}>Grid Size:</label>
                    <select
                      value={gridSize}
                      onChange={(e) => {
                        const newSize = parseInt(e.target.value);
                        setGridSize(newSize);
                        // Trim selection if it exceeds new grid size
                        const maxSlots = newSize * newSize;
                        if (selectedNFTs.length > maxSlots) {
                          setSelectedNFTs(selectedNFTs.slice(0, maxSlots));
                        }
                      }}
                      style={{
                        padding: '8px',
                        backgroundColor: '#000000',
                        color: '#ffffff',
                        border: '2px solid #ffffff',
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      <option value={2}>2x2</option>
                      <option value={3}>3x3</option>
                      <option value={4}>4x4</option>
                      <option value={5}>5x5</option>
                      <option value={6}>6x6</option>
                    </select>
                  </div>
                </div>

                {/* Collage Area */}
                {selectedNFTs.length > 0 && (
                  <div style={{ marginTop: '40px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      Collage ({selectedNFTs.length} selected - {gridSize}x{gridSize} grid)
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '20px'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${gridSize}, 200px)`,
                        gridTemplateRows: `repeat(${gridSize}, 200px)`,
                        gap: '0',
                        border: '2px solid #ffffff'
                      }}>
                        {Array.from({ length: totalSlots }).map((_, index) => {
                          const nftId = selectedNFTs[index];
                          const nft = nftId ? nfts.find((n) => n.id === nftId) : null;
                          
                          return (
                            <div
                              key={index}
                              style={{
                                width: '200px',
                                height: '200px',
                                backgroundColor: '#536AB3',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
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
                                    imageRendering: 'pixelated'
                                  } as React.CSSProperties}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={downloadCollage}
                        style={{
                          padding: '12px 24px',
                          backgroundColor: '#ffffff',
                          color: '#000000',
                          border: '2px solid #ffffff',
                          cursor: 'pointer',
                          fontFamily: 'monospace',
                          textTransform: 'uppercase',
                          fontSize: '14px',
                          fontWeight: 'bold'
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
                        Download Collage
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

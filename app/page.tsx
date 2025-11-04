"use client";

// import { ConnectButton } from "@rainbow-me/rainbowkit";
// import { useAccount, useChainId } from "wagmi";
// import { useNFTs } from "@/hooks/useNFTs";
import { useState } from "react";

export default function HomePage() {
  // const { address, isConnected } = useAccount();
  // const chainId = useChainId();
  // const { nfts, loading, error } = useNFTs();
  const [selectedNFTs, setSelectedNFTs] = useState<string[]>([]);
  const [gridSize, setGridSize] = useState<number>(2);
  const [manualMode, setManualMode] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [manualNFTs, setManualNFTs] = useState<any[]>([]);
  const [loadingManual, setLoadingManual] = useState(false);

  const totalSlots = gridSize * gridSize;

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
                to: '0xa8a16c3259ad84162a0868e7927523b81ef8bf2d',
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
            contract: '0xa8a16c3259ad84162a0868e7927523b81ef8bf2d'
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
            
            <div style={{ marginTop: '15px' }}>
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Enter MineBoy numbers (e.g., 1, 42, 100)"
                style={{
                  padding: '10px',
                  width: '300px',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  border: '2px solid #ffffff',
                  fontFamily: 'monospace',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={fetchManualNFTs}
                disabled={loadingManual}
                style={{
                  padding: '10px 20px',
                  marginLeft: '10px',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  border: '2px solid #ffffff',
                  cursor: loadingManual ? 'not-allowed' : 'pointer',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  fontSize: '14px',
                  opacity: loadingManual ? 0.5 : 1
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
          {loadingManual ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              Loading NFTs...
            </div>
          ) : displayedNFTs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              Enter MineBoy numbers above to display NFTs
            </div>
          ) : (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  Found {displayedNFTs.length} NFT{displayedNFTs.length !== 1 ? 's' : ''}
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
                          const nft = nftId ? displayedNFTs.find((n: any) => n.id === nftId) : null;
                          
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
        {/* )} */}
      </div>
    </>
  );
}

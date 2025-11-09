// CollageCard component for displaying minted MineBlocks blocks
              alt={metadata.name || `MineBlocks Block #${collageId}`}
          {metadata?.name || `MineBlocks Block #${collageId}`}
  // State for Create MineBlocks Block tab
  // Fetch user\'s MineBlocks NFTs using ERC721Enumerable
        console.log(`🔍 Full scan: Checking MineBlocks collection for your tokens...`);
                  name: metadata.name || `MineBlocks #${tokenId}`,
  // Read user\'s MineBlocks blocks
            <Header title="MineBlocks" />
              To View and create MineBlocks blocks
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
              padding: "clamp(10px, 2.5vw, 15px) clamp(15px, 4vw, 30px)",
              fontSize: "clamp(11px, 3vw, 16px)",
              whiteSpace: "nowrap",
              boxSizing: "border-box",
              wordWrap: "break-word",
              overflowWrap: "break-word",
              padding: "clamp(10px, 2.5vw, 15px) clamp(15px, 4vw, 30px)",
              fontSize: "clamp(11px, 3vw, 16px)",
              whiteSpace: "nowrap",
              boxSizing: "border-box",
              wordWrap: "break-word",
              overflowWrap: "break-word",
            My MineBlocks ({collageBalanceNum})
        {/* Create MineBlocks Block Tab */}
              Create New MineBlock
                    No MineBlocks NFTs found in your wallet
            {/* MineBlocks Block */}
                MineBlocks Block ({gridSize}×{gridSize})
        {/* My MineBlocks Blocks Tab */}
                Your Minted MineBlocks Blocks
                <p style={{ fontSize: "18px", marginBottom: "10px" }}>No MineBlocks blocks yet</p>
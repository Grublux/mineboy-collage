import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { NFT_CONTRACT_ADDRESS } from "@/lib/constants/contracts";

export interface NFT {
  id: string;
  name: string;
  image: string;
  tokenId: string;
  contract: string;
}

const ERC721_ABI = [
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
] as const;

export function useNFTs() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNFTs() {
      if (!isConnected || !address || !publicClient) {
        setNfts([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log("Starting NFT fetch for address:", address);
        
        // Get current block number
        const currentBlock = await publicClient.getBlockNumber();
        console.log("Current block:", currentBlock);
        
        // Get Transfer events from recent blocks (last 100k blocks to avoid timeout)
        const fromBlock = currentBlock > 100000n ? currentBlock - 100000n : 0n;
        
        console.log("Fetching logs from block", fromBlock, "to", currentBlock);
        
        const logs = await publicClient.getLogs({
          address: NFT_CONTRACT_ADDRESS,
          event: {
            type: 'event',
            name: 'Transfer',
            inputs: [
              { type: 'address', indexed: true, name: 'from' },
              { type: 'address', indexed: true, name: 'to' },
              { type: 'uint256', indexed: true, name: 'tokenId' },
            ],
          },
          args: {
            to: address,
          },
          fromBlock,
          toBlock: 'latest',
        });

        console.log("Found", logs.length, "transfer events");

        // Get unique token IDs from logs
        const tokenIdSet = new Set<bigint>();
        for (const log of logs) {
          if (log.args.tokenId) {
            tokenIdSet.add(log.args.tokenId);
          }
        }

        console.log("Unique token IDs:", tokenIdSet.size);

        // Filter to only tokens still owned by the user
        const ownedTokenIds: bigint[] = [];
        for (const tokenId of tokenIdSet) {
          try {
            const owner = await publicClient.readContract({
              address: NFT_CONTRACT_ADDRESS,
              abi: ERC721_ABI,
              functionName: "ownerOf",
              args: [tokenId],
            });
            if (owner.toLowerCase() === address.toLowerCase()) {
              ownedTokenIds.push(tokenId);
            }
          } catch (err) {
            console.log("Error checking owner for token", tokenId, err);
            continue;
          }
        }
        
        console.log("Owned token IDs:", ownedTokenIds.length);

        if (ownedTokenIds.length === 0) {
          setNfts([]);
          setLoading(false);
          return;
        }

        // Fetch metadata for each token
        const nftPromises = ownedTokenIds.map(async (tokenId) => {
          try {
            const tokenURI = await publicClient.readContract({
              address: NFT_CONTRACT_ADDRESS,
              abi: ERC721_ABI,
              functionName: "tokenURI",
              args: [tokenId],
            });

            // Fetch metadata from tokenURI
            let metadata;
            try {
              const metadataResponse = await fetch(tokenURI as string);
              metadata = await metadataResponse.json();
            } catch {
              metadata = { name: `Token #${tokenId}`, image: "" };
            }

            return {
              id: `${NFT_CONTRACT_ADDRESS}-${tokenId}`,
              name: metadata.name || `Token #${tokenId}`,
              image: metadata.image || "",
              tokenId: tokenId.toString(),
              contract: NFT_CONTRACT_ADDRESS,
            };
          } catch (err) {
            console.error(`Error fetching token ${tokenId}:`, err);
            return null;
          }
        });

        const fetchedNFTs = (await Promise.all(nftPromises)).filter(
          (nft): nft is NFT => nft !== null
        );

        setNfts(fetchedNFTs);
      } catch (err) {
        console.error("Error fetching NFTs:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch NFTs";
        setError(errorMessage);
        setNfts([]);
      } finally {
        console.log("NFT fetch completed");
        setLoading(false);
      }
    }

    fetchNFTs();
  }, [isConnected, address, publicClient]);

  return { nfts, loading, error };
}


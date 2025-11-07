import { Address } from "viem";

// Contract addresses (set via env vars)
const BLOCK_TOKEN = (process.env.NEXT_PUBLIC_BLOCK_TOKEN || "0x0") as Address;
const BLOCK_VAULT = (process.env.NEXT_PUBLIC_BLOCK_VAULT || "0x0") as Address;
const BLOCK_HUB = (process.env.NEXT_PUBLIC_BLOCK_HUB || "0x0") as Address;

// ApeChain NGT address
export const NGT_ADDRESS = "0x72CddB64A72176B442bdfD9C8Bb7968E652d8D1a" as Address;

// Optional APE token address
export const APE_ADDRESS = (process.env.NEXT_PUBLIC_TOKEN_APE || "0x0") as Address;

export const blockTokenConfig = {
  address: BLOCK_TOKEN,
  abi: [
    {
      type: "function",
      name: "mint",
      inputs: [{ name: "to", type: "address" }, { name: "id", type: "uint256" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "burn",
      inputs: [{ name: "id", type: "uint256" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "ownerOf",
      inputs: [{ name: "id", type: "uint256" }],
      outputs: [{ name: "", type: "address" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "royaltyInfo",
      inputs: [{ name: "tokenId", type: "uint256" }, { name: "salePrice", type: "uint256" }],
      outputs: [{ name: "receiver", type: "address" }, { name: "royaltyAmount", type: "uint256" }],
      stateMutability: "view",
    },
  ],
} as const;

export const blockVaultConfig = {
  address: BLOCK_VAULT,
  abi: [
    {
      type: "function",
      name: "setSnapshotCID",
      inputs: [
        { name: "id", type: "uint256" },
        { name: "cid", type: "bytes" },
        { name: "w", type: "uint16" },
        { name: "h", type: "uint16" },
        { name: "hash", type: "bytes32" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "getBlockMeta",
      inputs: [{ name: "id", type: "uint256" }],
      outputs: [
        {
          type: "tuple",
          components: [
            { name: "rootId", type: "uint256" },
            { name: "scheduleId", type: "uint256" },
            { name: "rows", type: "uint16" },
            { name: "cols", type: "uint16" },
            { name: "lockStartedAt", type: "uint64" },
            { name: "lockDuration", type: "uint32" },
            { name: "cooldownDuration", type: "uint32" },
            { name: "cooldownStart", type: "uint64" },
            { name: "snapshotCid", type: "bytes" },
            { name: "snapshotW", type: "uint16" },
            { name: "snapshotH", type: "uint16" },
            { name: "snapshotHash", type: "bytes32" },
          ],
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getItems",
      inputs: [{ name: "id", type: "uint256" }],
      outputs: [
        { name: "collections", type: "address[]" },
        { name: "tokenIds", type: "uint256[]" },
        { name: "cells", type: "uint16[]" },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getSnapshot",
      inputs: [{ name: "id", type: "uint256" }],
      outputs: [
        { name: "cid", type: "bytes" },
        { name: "w", type: "uint16" },
        { name: "h", type: "uint16" },
        { name: "hash", type: "bytes32" },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "unblock",
      inputs: [{ name: "id", type: "uint256" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "startCooldown",
      inputs: [{ name: "id", type: "uint256" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "emergencyUnblock",
      inputs: [{ name: "id", type: "uint256" }],
      outputs: [],
      stateMutability: "nonpayable",
    },
  ],
} as const;

export const blockHubConfig = {
  address: BLOCK_HUB,
  abi: [
    {
      type: "function",
      name: "createRoot",
      inputs: [{ name: "collection", type: "address" }, { name: "label", type: "string" }],
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "getRoot",
      inputs: [{ name: "rootId", type: "uint256" }],
      outputs: [
        {
          type: "tuple",
          components: [
            { name: "collection", type: "address" },
            { name: "label", type: "string" },
            { name: "creator", type: "address" },
            { name: "priceETH", type: "uint256" },
          ],
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "getPrice20",
      inputs: [{ name: "rootId", type: "uint256" }, { name: "token", type: "address" }],
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "isTokenAllowed",
      inputs: [{ name: "rootId", type: "uint256" }, { name: "token", type: "address" }],
      outputs: [{ name: "", type: "bool" }],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "mintBlockETH",
      inputs: [
        { name: "rootId", type: "uint256" },
        { name: "rows", type: "uint16" },
        { name: "cols", type: "uint16" },
        {
          type: "tuple[]",
          name: "items",
          components: [
            { name: "collection", type: "address" },
            { name: "tokenId", type: "uint256" },
            { name: "cell", type: "uint16" },
          ],
        },
        { name: "scheduleIdOpt", type: "uint256" },
      ],
      outputs: [],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "mintBlock20",
      inputs: [
        { name: "rootId", type: "uint256" },
        { name: "token20", type: "address" },
        { name: "rows", type: "uint16" },
        { name: "cols", type: "uint16" },
        {
          type: "tuple[]",
          name: "items",
          components: [
            { name: "collection", type: "address" },
            { name: "tokenId", type: "uint256" },
            { name: "cell", type: "uint16" },
          ],
        },
        { name: "scheduleIdOpt", type: "uint256" },
      ],
      outputs: [],
      stateMutability: "nonpayable",
    },
  ],
} as const;


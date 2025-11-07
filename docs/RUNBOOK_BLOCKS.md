# Blocks Runbook

## Overview

**Blocked** is a single ERC-721 collection where all roots are metadata filters, not new NFT contracts. Users stake NFTs from underlying collections into Blocks, which are escrowed in BlockVault and represented by BlockToken NFTs.

## Architecture

- **BlockToken**: Minimal ERC-721 (mint/burn, royalties)
- **BlockVault**: Escrow + layout + locks + snapshots (NOT an ERC-721)
- **BlockHub**: Root management, pricing, minting

## Deployment (ApeChain)

```bash
make deploy-ap
```

This will:
1. Deploy BlockToken, BlockVault, BlockHub
2. Wire contracts together
3. Set royalty to deployer (6.9% = 690 bps)
4. Set rewardsSplitter to deployer (mint proceeds go here)
5. Grant Hub roles to deployer
6. Create initial roots (MineBoys, NPC, Goobaloo)

### Initial Configuration

- **Royalties**: 6.9% to deployer (changeable via `token.setRoyalty(receiver, bps)`)
- **Mint Proceeds**: Go to deployer initially (changeable via `hub.setRewardsSplitter(address)`)
- **Root Creation**: Admin-only by default (toggle via `hub.setGlobalRootCreationOpen(true)`)

### Root Defaults

When creating a root:
- `priceETH = 0` (free by default)
- `price20[NGT] = 1_111e18` (NGT price set automatically)
- `erc20Allowed[NGT] = true` (NGT allowed by default)
- Tickets: OFF by default
- Schedules: Optional

## Operations

### Creating Roots

**Admin-only** (unless `globalRootCreationOpen = true`):
```solidity
hub.createRoot(collectionAddress, "Label")
```

**Public** (if enabled):
```solidity
hub.createRootPublic(collectionAddress, "Label")
```

### Setting Prices

```solidity
// ETH price
hub.setPriceETH(rootId, weiAmount)  // 0 = free

// ERC-20 price
hub.setPrice20(rootId, tokenAddress, tokenAmount)  // 0 = free

// Allow/deny ERC-20 tokens
hub.setAllowed20(rootId, tokenAddress, true/false)
```

### Tickets (Optional)

```solidity
// ERC-1155 ticket
hub.setTicket1155(rootId, erc1155Address, ticketId, required)

// ERC-721 ticket
hub.setTicket721(rootId, erc721Address, required)
```

### Schedules (Optional)

```solidity
// Create schedule
hub.createSchedule(rootId, openAt, closeAt, lockDuration, cooldownDuration)

// Enable/disable
hub.setScheduleActive(rootId, scheduleId, true/false)
```

## Snapshot Flow

1. User renders grid on canvas (nearest-neighbor)
2. Export PNG → `Uint8Array`
3. Compute `keccak256(pngBytes)` client-side
4. Upload to NFT.Storage → get CID
5. Convert CID string to bytes
6. Call `vault.setSnapshotCID(blockId, cidBytes, width, height, hash)`
7. Image available at `ipfs://<cid>`

## Pause/Emergency

**Pause**:
```solidity
vault.pause()  // Guardian only
```

**Emergency Unblock** (after 48h grace period):
```solidity
vault.emergencyUnblock(blockId)  // Owner only, requires paused + 48h delay
```

## Updating Configuration

### Change Royalty Receiver
```solidity
token.setRoyalty(newReceiver, bps)  // Admin only
```

### Change Rewards Splitter
```solidity
hub.setRewardsSplitter(newAddress)  // FUNDS_ROLE
```

Later: Consider moving to multisig or RewardsSplitter contract.

## Roles

- **DEFAULT_ADMIN_ROLE**: Full admin access
- **FUNDS_ROLE**: Pricing, rewards splitter
- **GUARDIAN_ROLE**: Pause/unpause (on Vault)
- **COLLECTION_MANAGER_ROLE**: Root creation, tickets
- **DURATION_ROLE**: Schedule management


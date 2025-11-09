# Blocked Greenlight Checklist

## Preflight

### Build & Tests (Blocks only)
```bash
forge clean && forge build -vv
make test-blocks  # Ensure all pass
```

### Fill Real Root Collections
Update actual ERC-721 addresses in `script/DeployBlocks.s.sol`:
- MineBoys collection address
- NPC collection address  
- Goobaloo collection address

### Environment Variables

**Deployment:**
- `RPC_APE` - ApeChain RPC URL
- `PRIVATE_KEY` - Deployer private key

**Frontend:**
- `NEXT_PUBLIC_BLOCK_TOKEN=0x...`
- `NEXT_PUBLIC_BLOCK_VAULT=0x...`
- `NEXT_PUBLIC_BLOCK_HUB=0x...`
- `NEXT_PUBLIC_NFT_STORAGE_KEY=<key>`
- `NEXT_PUBLIC_NGT=0x72cddb64a72176b442bdfd9c8bb7968e652d8d1a`

### Royalties & Proceeds
- ✅ Deployer wallet = royalty receiver (6.9%)
- ✅ Deployer wallet = Hub's rewardsSplitter (mint proceeds)

*(Both changeable later without redeploys)*

## Deploy & Smoke (ApeChain)

### Deploy
```bash
make deploy-ap
```
**Logs:** BlockToken / BlockVault / BlockHub addresses + rootIds

### Smoke
```bash
make smoke-ap
```
**Confirms:** Free ETH mint → snapshot → unblock → NFTs returned → token burned

## Frontend Point

1. Set the three `NEXT_PUBLIC_BLOCK_*` addresses
2. Redeploy FE
3. Test with real wallet:
   - ✅ Free ETH flow (0 value)
   - ✅ Paid NGT flow (approve → mint)
   - ✅ Snapshot: confirm `ipfs://CID` loads in UI

## Explorer Verification (Nice-to-have)

Verify each contract on ApeScan (`via_ir=false`).

If constructor args trip you up, export Standard JSON from Foundry and upload manually.

## Launch Switches (Day-1)

- **Root creation**: Admin-only (`globalRootCreationOpen=false`)
- **Schedules**: Optional (skip for pure "no-lock" at launch)
- **Tickets**: OFF by default
- **ETH price**: Defaults to 0 (free, gas only)
- **NGT price**: Defaults to 1,111e18 per root (set in `createRoot`)

## Operational Sanity

### Emergency Escape
If Vault is paused, owners can `emergencyUnblock` after 48h grace period.

### Proceeds Management
Both ETH and NGT go to deployer initially. Later:
```solidity
hub.setRewardsSplitter(<multisig or splitter>)  // FUNDS_ROLE
token.setRoyalty(<newReceiver>, <bps>)          // Admin only
```

### Public Roots (Later)
Flip `setGlobalRootCreationOpen(true)` only when ready.

## Security Touch-ups (Fast Wins)

Run local rehearsal:
- [ ] Pause Vault → wait 48h (warp) → `emergencyUnblock`
- [ ] Attempt re-mint after pause (should fail)
- [ ] Confirm unique cell check and collection match checks are live
- [ ] Ensure no admin path can move escrowed NFTs (only owner can unblock)
- [ ] Confirm reentrancy guards on mint/unblock flows

## Post-Launch (First 48h)

- [ ] Watch balances for deployer wallet (mint proceeds, royalty test)
- [ ] Monitor failed mints (usually approvals / ticket gates)
- [ ] Snapshot latency: if slow IPFS loads, try multiple gateways:
  - `nft.storage` → `ipfs.io` → `cf-ipfs`

## Optional Nice-to-Haves (After Launch)

- [ ] Add FE read endpoints: "My Blocks", "Blocks by Root", "Blocks by Collection"
- [ ] Lightweight indexer (script) to cache `BlockMinted` + snapshot CID per blockId
- [ ] Admin UI to:
  - Edit root prices (ETH/NGT)
  - Create/activate schedules
  - Toggle global public root creation
  - Switch rewards/royalty receivers

## Quick Command Reference

```bash
# Build & Test
forge clean && forge build -vv
make test-blocks

# Deploy
make deploy-ap

# Smoke
make smoke-ap

# Test specific root
forge test --match-test test_Root_Defaults -vv
```

## Marketplace Notes

`tokenURI` is omitted (by choice) to avoid stack bloat. UI reads from Vault getters, and on-chain snapshot CID points to PNG on IPFS.

If you want marketplace thumbnails later, add minimal `tokenURI`:
```solidity
{ "name": "Blocked #<id>", "image": "ipfs://<cid>" }
```
Avoid extra attributes to keep it simple.



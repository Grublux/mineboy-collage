# Blocks Launch Checklist

## Preflight

### Build & Test
- [ ] `forge clean && forge build` (verify `via_ir = false`)
- [ ] `forge test --match-path "test/blocks/**.t.sol" -vv` (all tests pass)
- [ ] Fill real collection addresses for initial roots:
  - [ ] MineBoys collection address
  - [ ] NPC collection address
  - [ ] Goobaloo collection address

### Environment Variables
- [ ] `RPC_APE` - ApeChain RPC URL
- [ ] `PRIVATE_KEY` - Deployer private key
- [ ] `NEXT_PUBLIC_BLOCK_TOKEN` - BlockToken address (set after deploy)
- [ ] `NEXT_PUBLIC_BLOCK_VAULT` - BlockVault address (set after deploy)
- [ ] `NEXT_PUBLIC_BLOCK_HUB` - BlockHub address (set after deploy)
- [ ] `NEXT_PUBLIC_NFT_STORAGE_KEY` - NFT.Storage API key
- [ ] `NEXT_PUBLIC_TOKEN_APE` - Optional APE token address

### Optional: Dry-run
- [ ] Deploy to testnet/fork
- [ ] Run smoke test on testnet
- [ ] Verify frontend connects correctly

## Deploy

### Deployment
- [ ] `make deploy-ap`
- [ ] Record deployed addresses:
  - [ ] BlockToken: `0x...`
  - [ ] BlockVault: `0x...`
  - [ ] BlockHub: `0x...`
- [ ] Record root IDs:
  - [ ] MineBoys: `rootId = X`
  - [ ] NPC: `rootId = Y`
  - [ ] Goobaloo: `rootId = Z`

### Verification
- [ ] Verify contracts on ApeScan
- [ ] Check initial configuration:
  - [ ] Royalty receiver = deployer (6.9%)
  - [ ] Rewards splitter = deployer
  - [ ] Root prices: ETH=0, NGT=1_111e18
  - [ ] NGT allowed = true

## Smoke

### Smoke Test
- [ ] `make smoke-ap`
- [ ] Validate:
  - [ ] Free mint succeeds
  - [ ] Snapshot CID set
  - [ ] Unblock returns NFTs
  - [ ] Token burned

## Frontend

### Configuration
- [ ] Set `NEXT_PUBLIC_BLOCK_*` env vars
- [ ] Set `NEXT_PUBLIC_NFT_STORAGE_KEY`
- [ ] Rebuild frontend: `npm run build`
- [ ] Deploy frontend

### Testing
- [ ] Test mint flow on desktop
- [ ] Test mint flow on mobile
- [ ] Test snapshot upload
- [ ] Test unblock flow
- [ ] Verify price display (free vs paid)

## Post-Launch

### Monitoring
- [ ] Monitor balances at rewardsSplitter (deployer for now):
  - [ ] ETH balance
  - [ ] NGT balance
- [ ] Monitor BlockToken mints
- [ ] Monitor unblock events

### Optional Updates
- [ ] Consider moving rewardsSplitter to multisig:
  - [ ] `hub.setRewardsSplitter(multisigAddress)`
- [ ] Consider updating royalty receiver:
  - [ ] `token.setRoyalty(newReceiver, bps)`
- [ ] Consider enabling public root creation:
  - [ ] `hub.setGlobalRootCreationOpen(true)`

### Documentation
- [ ] Update `CHANGELOG.md` with deployed addresses
- [ ] Add ApeScan explorer links
- [ ] Document any post-deploy configuration changes

## Emergency Procedures

### Pause
```solidity
vault.pause()  // Guardian only
```

### Emergency Unblock (after 48h)
Users can call:
```solidity
vault.emergencyUnblock(blockId)  // Owner only
```

### Update Rewards Splitter
```solidity
hub.setRewardsSplitter(newAddress)  // FUNDS_ROLE
```

### Update Royalties
```solidity
token.setRoyalty(newReceiver, newBps)  // Admin only
```


# ✅ GridStaker Deployment Summary

**Deployed:** $(date)
**Network:** ApeChain (Chain ID: 33139)
**Block Explorer:** https://apechain.calderachain.xyz/address/0x32C7d8841E3dEfaE125Cd19d8283985e2A2Fe56E

## Contract Address
**GridStaker:** `0x32C7d8841E3dEfaE125Cd19d8283985e2A2Fe56E`

## Configuration

### Collection & Payout
- **MineBoy Collection:** `0xa8A16C3259aD84162a0868E7927523B81eF8BF2D`
- **Payout Address:** `0x634989990acb7F95d07Ac09a6c35491Ac8dFa3Cf`
- **Royalty Receiver:** `0x634989990acb7F95d07Ac09a6c35491Ac8dFa3Cf`
- **Royalty Rate:** 6.9% (690 basis points)

### Pricing
- **NGT Price:** 3333 NGT
- **NGT Token:** `0x72CddB64A72176B442bdfD9C8Bb7968E652d8D1a`
- **Unbind Fee:** 0.05 APE (native currency)

### Validators
- **MineBoy Validator:** `0x721C008fdff27BF06E7E123956E2Fe03B63342e3`
- **GridStaker Validator:** `0x721C008fdff27BF06E7E123956E2Fe03B63342e3`

## Deployment Transactions

1. **Deploy GridStaker**
   - Hash: `0xb4b0865e29c6caeeb597cdecf3089538e61c375ee1e7ebda9bd45fa2e8059799`
   - Gas: 4,865,800
   - Cost: 0.123691993402 APE

2. **Set NGT Price**
   - Hash: `0x423e160249cc02dd706de39ec915c8f3df33bc659ec8273a9cd1d081c4692c99`
   - Gas: 48,600

3. **Set Unbind Fee (0.05 APE)**
   - Hash: `0x360db84f8b6746b55f3fae3c918660d8a64ab80cff398a9e0ae6a12f73651989`
   - Gas: 47,553

4. **Set Transfer Validator**
   - Hash: `0x0dbf3790445119a172557207cc13c2ade4f72b768749a867cd20276e9d5b4d48`
   - Gas: 47,906

## Next Steps

### 1. Update Frontend
```bash
# Add to frontend/.env
NEXT_PUBLIC_GRID_STAKER_ADDRESS=0x32C7d8841E3dEfaE125Cd19d8283985e2A2Fe56E
```

### 2. Pre-fund GridStaker (When Ready for Testing)
Send 0.1 APE to GridStaker contract:
- Address: `0x32C7d8841E3dEfaE125Cd19d8283985e2A2Fe56E`
- This covers authorization gas for unbinds
- The 0.05 APE unbind fee goes to payout, not GridStaker

### 3. Whitelist GridStaker on Validator
- Validator: `0x721C008fdff27BF06E7E123956E2Fe03B63342e3`
- GridStaker must be whitelisted to receive MineBoy NFTs during mint

### 4. Verify Contract (Optional)
Verify on ApeScan:
- Contract: `0x32C7d8841E3dEfaE125Cd19d8283985e2A2Fe56E`
- Use flattened contract code for verification

## Authorization Model

**MINT:**
- User authorizes GridStaker on validator (user owns MineBoys)

**UNBIND:**
- GridStaker authorizes itself on validator (GridStaker owns MineBoys)
- GridStaker needs APE balance for authorization call

## Gas Estimates

**Unbind:**
- Authorization: ~30,000 gas
- Unbind (4 tokens): ~292,000 gas
- Unbind (9 tokens): ~617,000 gas
- Unbind (36 tokens): ~2,372,000 gas

**0.05 APE covers:** 50M+ gas at 1 gwei (huge margin) ✅

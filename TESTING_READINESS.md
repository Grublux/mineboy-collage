# 🧪 Testing Readiness Checklist

## ✅ Completed

### Contract
- ✅ GridStaker deployed: `0x32C7d8841E3dEfaE125Cd19d8283985e2A2Fe56E`
- ✅ Contract verified on ApeScan
- ✅ NGT price set: 3333 NGT
- ✅ Unbind fee set: 0.05 APE
- ✅ Transfer validator configured
- ✅ Royalty set: 6.9% (690 basis points)

### Frontend
- ✅ Frontend address updated to new contract
- ✅ Authorization flow implemented (mint & unbind)
- ✅ Hooks ready (useMintGrid, useUnbind)
- ✅ UI components ready (MintGridButton, UnbindButton)

## ⚠️ REQUIRED BEFORE TESTING

### 1. GridStaker Pre-funding
**Action:** Send 0.1 APE to GridStaker contract
- Address: `0x32C7d8841E3dEfaE125Cd19d8283985e2A2Fe56E`
- Purpose: Covers authorization gas for unbinds
- Command: Send 0.1 APE from deployer wallet

### 2. Whitelist GridStaker on Validator
**Action:** Whitelist GridStaker on MineBoy validator
- Validator: `0x721C008fdff27BF06E7E123956E2Fe03B63342e3`
- GridStaker: `0x32C7d8841E3dEfaE125Cd19d8283985e2A2Fe56E`
- Purpose: Allows GridStaker to receive MineBoys during mint
- Method: Use validator's whitelist functions (addAccountsToList, etc.)

### 3. Frontend Rebuild
**Action:** Rebuild frontend to ensure new contract address is used
- Run: `cd frontend && npm run build` (or `npm run dev` for development)
- Verify: Check browser console for correct GridStaker address

## ✅ Test Flow Confirmation

### MINT FLOW:
1. User connects wallet
2. User approves MineBoys (if needed)
3. User approves NGT (if needed)
4. User authorizes GridStaker on validator (if auth mode enabled)
5. User mints Grid (pays 3333 NGT)
6. Success! Grid NFT minted

### UNBIND FLOW:
1. User navigates to "My Grids"
2. User clicks "Unbind" on a Grid
3. User confirms (pays 0.05 APE)
4. GridStaker authorizes itself on validator
5. GridStaker transfers MineBoys back to user
6. Success! MineBoys returned, Grid NFT burned

## 🎯 READY WHEN:
- ✅ GridStaker pre-funded with 0.1 APE
- ✅ GridStaker whitelisted on validator
- ✅ Frontend rebuilt/restarted

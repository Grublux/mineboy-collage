# ✅ READINESS CHECK FOR TEST MINT

## Contract Status
- ✅ GridStaker deployed: 0xaDBCBb5C031cF7AEbB09d4fFE8906cfbcDdAd1c0
- ✅ Contract verified on ApeScan
- ✅ NGT price must be set: 3333 NGT (3333e18 wei)

## Frontend Status
- ✅ MintGridButton component exists
- ✅ UnbindButton component exists
- ✅ useMintGrid hook implemented
- ✅ useUnbind hook implemented
- ✅ Validator authorization flow implemented
- ✅ GridStaker address configured: 0xd7f6fC339600Eb0cA625E1fa3c53C6b0C9a577cE

## ⚠️ CRITICAL PRE-CHECKS BEFORE TEST MINT

1. **NGT Price Set?**
   - Call: GridStaker.setErc20Price(NGT_ADDRESS, 3333e18)
   - Check: GridStaker.erc20Price(NGT_ADDRESS) should return 3333000000000000000000

2. **Validator Authorization Enabled?**
   - Check: validator.beforeAuthorizedTransfer() should not revert
   - If auth mode disabled, GridStaker must be whitelisted on MineBoy collection

3. **User Has:**
   - ✅ MineBoys in wallet (owned by user)
   - ✅ Enough NGT balance (3333 NGT per grid)
   - ✅ NGT approval for GridStaker (will be prompted if not)
   - ✅ MineBoy approval for GridStaker (will be prompted if not)

## Test Mint Flow (Expected)
1. User selects 4-9 MineBoys on grid
2. Clicks "Mint Grid" button
3. If not approved: Approves MineBoys (1 tx)
4. If not approved: Approves NGT (1 tx)
5. Authorizes validator (1 tx) - ~30k gas
6. Mints grid (1 tx) - ~200k-500k gas
7. Success! Grid NFT minted to user

## Test Unbind Flow (Expected)
1. User navigates to "My Grids"
2. Clicks "Unbind" on a grid
3. Confirms unbind
4. Authorizes validator (1 tx) - ~30k gas
5. Unbinds grid (1 tx) - ~200k-400k gas
6. Success! MineBoys returned to user, Grid NFT burned


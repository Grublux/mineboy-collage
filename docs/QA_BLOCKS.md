# Blocks QA Checklist

## Core Flows

### ✅ Free ETH Mint → Snapshot → Unblock

1. User owns 4 NFTs from root collection
2. Mint Block with `msg.value = 0` (free)
3. BlockToken minted to user
4. Set snapshot CID via `vault.setSnapshotCID(id, cid, w, h, hash)`
5. Unblock immediately (no schedule)
6. NFTs returned to user
7. BlockToken burned

**Expected**: All steps succeed, token burned, NFTs returned.

### ✅ Paid NGT Mint

1. Set NGT price: `hub.setPrice20(rootId, NGT, 1_111e18)`
2. User approves NGT to Hub
3. Mint Block with NGT payment
4. Check `ngt.balanceOf(rewardsSplitter)` increases by `1_111e18`

**Expected**: Payment received, Block minted.

### ✅ Tickets Gating

**OFF by default**:
- Mint succeeds without ticket

**ON (ERC-721)**:
1. `hub.setTicket721(rootId, ticketCollection, true)`
2. Mint without ticket → reverts
3. User mints ticket NFT
4. Mint succeeds

**Expected**: Gating works as configured.

### ✅ Schedules: Lock/Cooldown

**No Schedule**:
- Immediate unblock after mint

**With Schedule**:
1. Create schedule: `hub.createSchedule(rootId, openAt, closeAt, lockDur, coolDur)`
2. Mint with `scheduleId`
3. Block locked for `lockDuration`
4. After lock: `vault.startCooldown(id)`
5. After cooldown: `vault.unblock(id)`

**Expected**: Lock and cooldown enforced.

### ✅ Pause + 48h Emergency Escape

1. `vault.pause()` (guardian)
2. Warp time: `block.timestamp + 48 hours + 1`
3. `vault.emergencyUnblock(id)` (owner)
4. NFTs returned, token burned

**Expected**: Emergency escape works after delay.

### ✅ Royalties 6.9% Calculation

1. `token.royaltyInfo(id, 1e18)` returns `(deployer, 0.069e18)`
2. Update: `token.setRoyalty(newReceiver, 0)`
3. `token.royaltyInfo(id, 1e18)` returns `(newReceiver, 0)`

**Expected**: Royalties calculated correctly, updateable.

## Frontend

### ✅ PNG → NFT.Storage CID → setSnapshotCID

1. Render grid canvas (nearest-neighbor)
2. Export PNG → `Uint8Array`
3. Compute `keccak256(bytes)` client-side
4. Upload to NFT.Storage → get CID string
5. Convert CID to bytes
6. Call `vault.setSnapshotCID(id, cidBytes, w, h, hash)`
7. Image loads from `ipfs://<cid>`

**Expected**: Snapshot uploaded and accessible.

### ✅ Price Display

- `priceETH == 0` → Show "Free (gas only)"
- `price20[NGT] > 0` → Show NGT amount
- Frontend reads live prices via `hub.getPrice20(rootId, token)`

**Expected**: Prices display correctly.

## Edge Cases

- ✅ Mint with 0 items → reverts
- ✅ Mint with >36 items → reverts
- ✅ Mint with rows/cols > 6 → reverts
- ✅ Duplicate cells → reverts
- ✅ Wrong collection → reverts
- ✅ Cell out of bounds → reverts
- ✅ Unblock before lock expires → reverts
- ✅ Unblock before cooldown → reverts
- ✅ Emergency unblock before 48h → reverts



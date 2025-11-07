# COMPREHENSIVE PLAN: GridStaker Mint Authorization

## Problem Analysis
- Validator requires authorization before transfers
- `beforeAuthorizedTransfer()` has time window issues (expires quickly)
- Need atomic authorization + mint

## Options Analyzed

### Option 1: beforeAuthorizedTransfer(operator, token)
- Defaults to tokenId=0
- Time window issue (expires quickly)
- ❌ Not viable

### Option 2: beforeAuthorizedTransfer(operator, token, tokenId)  
- Per-token authorization
- Still has time window issue
- ❌ Not viable

### Option 3: validator.approve() ⭐ BEST
- User calls validator.approve() directly
- **HAS EXPIRATION PARAMETER!**
- For ERC721: tokenType=721, amount=1, expiration=timestamp
- Approval persists until expiration (not just one block!)
- ✅ SOLVES TIME WINDOW PROBLEM

### Option 4: permitTransferFromERC721
- Uses signature-based approval
- More complex, requires signature generation
- ❌ Overkill for this use case

## Implementation Plan

### Step 1: Use validator.approve() with expiration
1. User calls validator.approve() for each token
   - tokenType: 721 (ERC721)
   - token: MineBoy collection address
   - id: tokenId
   - operator: GridStaker address
   - amount: 1 (for ERC721)
   - expiration: current timestamp + 5 minutes

2. Batch all approvals + mint in Multicall3
   - Approve all tokens
   - Then mint
   - All in one transaction!

### Step 2: Fix mineBoyValidator read
- It's a public variable, not a function
- Hardcode validator address: 0x721C008fdff27BF06E7E123956E2Fe03B63342e3

### Step 3: Implementation
- Use Multicall3 to batch validator.approve() calls + mint
- Each token gets approved with expiration
- Mint happens in same transaction
- Approval persists 5 minutes (plenty of time)

## Why This Works
1. ✅ User calls validator.approve() directly (msg.sender = USER)
2. ✅ Approval has expiration (5 minutes) - no time window issue!
3. ✅ All approvals + mint in one Multicall3 transaction
4. ✅ Atomic - all or nothing

## Files to Update
- frontend/hooks/useGridStaker.ts (replace authorization section)

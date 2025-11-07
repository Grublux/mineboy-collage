# Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# CollageStaker Contract Address (fill after deployment)
NEXT_PUBLIC_COLLAGE_STAKER_ADDRESS=

# MineBoy NFT Collection Address (ApeChain)
NEXT_PUBLIC_COLLECTION_ADDRESS=0xa8a16c3259ad84162a0868e7927523b81ef8bf2d

# ApeChain Chain ID
NEXT_PUBLIC_CHAIN_ID=33139
```

## After Deploying CollageStaker

1. Deploy the CollageStaker contract to ApeChain
2. Copy the deployed contract address
3. Update `NEXT_PUBLIC_COLLAGE_STAKER_ADDRESS` in `.env.local`
4. Restart the Next.js dev server

## Contract Addresses

- **MineBoy Collection**: `0xa8a16c3259ad84162a0868e7927523b81ef8bf2d` (ApeChain)
- **CollageStaker**: TBD (deploy using Foundry)

## Quick Deploy Command

```bash
# Deploy to ApeChain
forge create --rpc-url https://apechain.calderachain.xyz/http \
  --private-key $PRIVATE_KEY \
  --constructor-args 0xa8a16c3259ad84162a0868e7927523b81ef8bf2d \
  contracts/CollageStaker.sol:CollageStaker
```



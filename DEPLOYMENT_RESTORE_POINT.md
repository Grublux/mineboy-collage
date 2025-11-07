# Contract Deployment Restore Point

**Date:** $(date)
**Branch:** $(git branch --show-current)
**Commit:** $(git rev-parse --short HEAD)

## Deployed Contracts (ApeChain)

- **BlockToken**: `0x41899158E161eD64fb4Ce33e293618B9c87C35b7`
- **BlockVault**: `0xf71f7cDE2A8B8e7C6a2Af3026679d06b723a4760`
- **BlockHub**: `0x735C31d2CCc4Fa241992EBF07ceEc3e0629729Cd`

## Restore Point

**Stash:** Contract deployment work saved in git stash
**Branch:** Restore point branch created: `contracts-deployed-*`

## Contract Details

- All contracts verified on ApeScan
- Goobaloo root created (Root ID: 1)
- Royalties set to 6.9% (690 bps) → deployer
- Rewards splitter set → deployer
- Contracts compiled with `via_ir = false`

## Frontend Status

- Frontend restored to last working Vercel version
- Contract addresses preserved in `.env.local`
- Ready for integration testing

## To Restore Contract Work

\`\`\`bash
git stash pop
# or
git checkout contracts-deployed-*
\`\`\`

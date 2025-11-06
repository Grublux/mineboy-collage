# CollageStaker Hooks Usage

## Setup

1. Create `.env.local` with contract addresses (see `ENV_SETUP.md`)
2. Ensure wagmi is configured with ApeChain (already done in `WalletProvider.tsx`)

## Available Hooks

### `useCollageStakerReads(collageId?: bigint)`

Read contract data for a collage.

```tsx
import { useCollageStakerReads } from '@/frontend/hooks/useCollageStaker';

function MyComponent() {
  const { balance, underlying, tokenURI, isLoading } = useCollageStakerReads(1n);
  
  // balance: number of collages owned by connected wallet
  // underlying: [collection, rows, cols, tokenIds[]]
  // tokenURI: base64 JSON metadata string
}
```

### `useMintCollage()`

Mint a new collage by staking NFTs.

```tsx
import { useMintCollage } from '@/frontend/hooks/useCollageStaker';

function MintButton() {
  const { mintCollage, isPending, isSuccess } = useMintCollage();
  
  const handleMint = async () => {
    const tokenIds = [1n, 2n, 3n, 4n]; // MineBoy token IDs
    await mintCollage(2, 2, tokenIds); // 2x2 grid
  };
  
  return (
    <button onClick={handleMint} disabled={isPending}>
      {isPending ? 'Minting...' : 'Mint Collage'}
    </button>
  );
}
```

### `useSetSnapshot()`

Upload PNG snapshot to a collage (one-time only).

```tsx
import { useSetSnapshot } from '@/frontend/hooks/useCollageStaker';

function SnapshotUploader({ collageId }: { collageId: bigint }) {
  const { setSnapshot, isPending, isSuccess } = useSetSnapshot();
  
  const handleUpload = async (pngBytes: Uint8Array) => {
    const hexData = `0x${Array.from(pngBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')}` as `0x${string}`;
    
    await setSnapshot(collageId, hexData);
  };
  
  return (
    <button onClick={() => handleUpload(/* bytes */)} disabled={isPending}>
      {isPending ? 'Uploading...' : 'Set Snapshot'}
    </button>
  );
}
```

### `useUnbind()`

Unbind a collage (burn NFT, return staked tokens).

```tsx
import { useUnbind } from '@/frontend/hooks/useCollageStaker';

function UnbindButton({ collageId }: { collageId: bigint }) {
  const { unbind, isPending, isSuccess } = useUnbind();
  
  const handleUnbind = async () => {
    await unbind(collageId);
  };
  
  return (
    <button onClick={handleUnbind} disabled={isPending}>
      {isPending ? 'Unbinding...' : 'Unbind Collage'}
    </button>
  );
}
```

### `useIsApprovedForAll()`

Check if source collection is approved for CollageStaker.

```tsx
import { useIsApprovedForAll } from '@/frontend/hooks/useCollageStaker';

function ApprovalStatus() {
  const { isApproved, isLoading } = useIsApprovedForAll();
  
  return (
    <div>
      {isLoading ? 'Checking...' : isApproved ? 'Approved ✓' : 'Not Approved'}
    </div>
  );
}
```

## Complete Example

```tsx
'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  useCollageStakerReads,
  useMintCollage,
  useIsApprovedForAll
} from '@/frontend/hooks/useCollageStaker';

export default function CollagePage() {
  const { isConnected } = useAccount();
  const { balance } = useCollageStakerReads();
  const { isApproved } = useIsApprovedForAll();
  const { mintCollage, isPending } = useMintCollage();

  if (!isConnected) {
    return <ConnectButton />;
  }

  return (
    <div>
      <h1>My Collages: {balance?.toString() ?? '0'}</h1>
      <p>Approval Status: {isApproved ? 'Ready ✓' : 'Pending'}</p>
      
      <button
        onClick={() => mintCollage(2, 2, [1n, 2n, 3n, 4n])}
        disabled={isPending || !isApproved}
      >
        Mint 2x2 Collage
      </button>
    </div>
  );
}
```

## Constants

Import collage constants from `frontend/lib/constants/collage.ts`:

```tsx
import {
  MAX_ROWS,
  MAX_COLS,
  SNAPSHOT_TARGET,
  SNAPSHOT_MAX_BYTES,
  COLLAGE_SIZE_CHOICES
} from '@/frontend/lib/constants/collage';
```


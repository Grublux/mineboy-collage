import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MineBlocksV1
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const mineBlocksV1Abi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  { type: 'error', inputs: [], name: 'ArrayLengthMismatch' },
  {
    type: 'error',
    inputs: [],
    name: 'CreatorTokenBase__InvalidTransferValidatorContract',
  },
  { type: 'error', inputs: [], name: 'EntryLocked' },
  { type: 'error', inputs: [], name: 'EntryNotOpen' },
  { type: 'error', inputs: [], name: 'EntryWindowClosed' },
  { type: 'error', inputs: [], name: 'InvalidAdminAddress' },
  { type: 'error', inputs: [], name: 'InvalidCollectionReceived' },
  { type: 'error', inputs: [], name: 'InvalidQuantity' },
  { type: 'error', inputs: [], name: 'InvalidSharesMapping' },
  { type: 'error', inputs: [], name: 'InvalidStakeToken' },
  { type: 'error', inputs: [], name: 'InvalidTimestamps' },
  { type: 'error', inputs: [], name: 'InvalidUnstakeFee' },
  { type: 'error', inputs: [], name: 'NoRoyaltiesToWithdraw' },
  { type: 'error', inputs: [], name: 'PeriodNotConfigured' },
  { type: 'error', inputs: [], name: 'PeriodNotEnded' },
  { type: 'error', inputs: [], name: 'ShouldNotMintToBurnAddress' },
  { type: 'error', inputs: [], name: 'StakingLocked' },
  { type: 'error', inputs: [], name: 'TransferFailed' },
  { type: 'error', inputs: [], name: 'UnauthorizedAdmin' },
  { type: 'error', inputs: [], name: 'UnauthorizedUpgrader' },
  { type: 'error', inputs: [], name: 'UpgraderZeroAddress' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousAdmin',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'newAdmin',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'AdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'admin',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'enabled', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'AdminUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'approved',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'autoApproved',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
    ],
    name: 'AutomaticApprovalOfTransferValidatorSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'baseTokenURI',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'BaseTokenURISet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'beacon',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'BeaconUpgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'stakeTokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'earnings',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'tokenIds',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'Claimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'contractURI',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'ContractURISet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ERC20Withdrawn',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'periodId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'EarningsReceived',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'version', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'periodId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'entryStart',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'stakingStart',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'stakingEnd',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'quantities',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'shares',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'PeriodCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'periodId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'entryStart',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'stakingStart',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'stakingEnd',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PeriodUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RoyaltiesReceived',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'admin',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RoyaltiesWithdrawn',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'stakeTokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'periodId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'quantity',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'shares',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'tokenIds',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'Staked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldValidator',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'newValidator',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'TransferValidatorUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'stakeTokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'periodId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'feePaid',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'tokenIds',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'UnstakedEarly',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'upgrader',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'UpgraderUpdated',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_TRANSFER_VALIDATOR',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'autoApproveTransfersFromValidator',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'stakeTokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'calculateEarnings',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'stakeTokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'contractURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'entryStart', internalType: 'uint256', type: 'uint256' },
      { name: 'stakingStart', internalType: 'uint256', type: 'uint256' },
      { name: 'stakingEnd', internalType: 'uint256', type: 'uint256' },
      { name: 'quantities', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'shares', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'createOrUpdatePeriod',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'currentPeriodId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentPeriodEarnings',
    outputs: [
      { name: 'totalEarnings', internalType: 'uint256', type: 'uint256' },
      { name: 'totalShares', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'periodId', internalType: 'uint256', type: 'uint256' }],
    name: 'getPeriod',
    outputs: [
      { name: 'entryStart', internalType: 'uint256', type: 'uint256' },
      { name: 'stakingStart', internalType: 'uint256', type: 'uint256' },
      { name: 'stakingEnd', internalType: 'uint256', type: 'uint256' },
      { name: 'totalShares', internalType: 'uint256', type: 'uint256' },
      { name: 'totalEarnings', internalType: 'uint256', type: 'uint256' },
      {
        name: 'allowedQuantities',
        internalType: 'uint256[]',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'periodId', internalType: 'uint256', type: 'uint256' },
      { name: 'quantity', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getSharesForQuantity',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTransferValidationFunction',
    outputs: [
      { name: 'functionSignature', internalType: 'bytes4', type: 'bytes4' },
      { name: 'isViewFunction', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTransferValidator',
    outputs: [{ name: 'validator', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getUpgrader',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'name_', internalType: 'string', type: 'string' },
      { name: 'symbol_', internalType: 'string', type: 'string' },
      { name: 'collection', internalType: 'address', type: 'address' },
      { name: 'royaltyBps', internalType: 'uint96', type: 'uint96' },
      { name: 'initialAdmins', internalType: 'address[]', type: 'address[]' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'name_', internalType: 'string', type: 'string' },
      { name: 'symbol_', internalType: 'string', type: 'string' },
      { name: 'royaltyBps', internalType: 'uint96', type: 'uint96' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'isAdmin',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: 'isApproved', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nextStakeTokenId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onERC721Received',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'royaltiesEarnedOutsidePeriods',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'salePrice', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'royaltyInfo',
    outputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'admin', internalType: 'address', type: 'address' },
      { name: 'enabled', internalType: 'bool', type: 'bool' },
    ],
    name: 'setAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'autoApprove', internalType: 'bool', type: 'bool' }],
    name: 'setAutomaticApprovalOfTransfersFromValidator',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'baseTokenURI', internalType: 'string', type: 'string' }],
    name: 'setBaseTokenURI',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'contractMetadataURI', internalType: 'string', type: 'string' },
    ],
    name: 'setContractURI',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'transferValidator_', internalType: 'address', type: 'address' },
    ],
    name: 'setTransferValidator',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newUpgrader', internalType: 'address', type: 'address' }],
    name: 'setUpgrader',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'tokenIds', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'stake',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'stakePositions',
    outputs: [{ name: 'periodId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'stakedCollection',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'stakeTokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'unstake',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
    ],
    name: 'upgradeTo',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'withdrawERC20',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'withdrawRoyalties',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  { type: 'receive', stateMutability: 'payable' },
] as const

/**
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const mineBlocksV1Address = {
  33139: '0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f',
} as const

/**
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const mineBlocksV1Config = {
  address: mineBlocksV1Address,
  abi: mineBlocksV1Abi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1 = /*#__PURE__*/ createUseReadContract({
  abi: mineBlocksV1Abi,
  address: mineBlocksV1Address,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"DEFAULT_TRANSFER_VALIDATOR"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1DefaultTransferValidator =
  /*#__PURE__*/ createUseReadContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'DEFAULT_TRANSFER_VALIDATOR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"autoApproveTransfersFromValidator"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1AutoApproveTransfersFromValidator =
  /*#__PURE__*/ createUseReadContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'autoApproveTransfersFromValidator',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"balanceOf"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1BalanceOf = /*#__PURE__*/ createUseReadContract(
  {
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'balanceOf',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"calculateEarnings"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1CalculateEarnings =
  /*#__PURE__*/ createUseReadContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'calculateEarnings',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"contractURI"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1ContractUri =
  /*#__PURE__*/ createUseReadContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'contractURI',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"currentPeriodId"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1CurrentPeriodId =
  /*#__PURE__*/ createUseReadContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'currentPeriodId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"getApproved"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1GetApproved =
  /*#__PURE__*/ createUseReadContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'getApproved',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"getCurrentPeriodEarnings"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1GetCurrentPeriodEarnings =
  /*#__PURE__*/ createUseReadContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'getCurrentPeriodEarnings',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"getPeriod"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1GetPeriod = /*#__PURE__*/ createUseReadContract(
  {
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'getPeriod',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"getSharesForQuantity"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1GetSharesForQuantity =
  /*#__PURE__*/ createUseReadContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'getSharesForQuantity',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"getTransferValidationFunction"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1GetTransferValidationFunction =
  /*#__PURE__*/ createUseReadContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'getTransferValidationFunction',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"getTransferValidator"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1GetTransferValidator =
  /*#__PURE__*/ createUseReadContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'getTransferValidator',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"getUpgrader"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1GetUpgrader =
  /*#__PURE__*/ createUseReadContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'getUpgrader',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"isAdmin"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1IsAdmin = /*#__PURE__*/ createUseReadContract({
  abi: mineBlocksV1Abi,
  address: mineBlocksV1Address,
  functionName: 'isAdmin',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"isApprovedForAll"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1IsApprovedForAll =
  /*#__PURE__*/ createUseReadContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'isApprovedForAll',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"name"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1Name = /*#__PURE__*/ createUseReadContract({
  abi: mineBlocksV1Abi,
  address: mineBlocksV1Address,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"nextStakeTokenId"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1NextStakeTokenId =
  /*#__PURE__*/ createUseReadContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'nextStakeTokenId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"onERC721Received"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1OnErc721Received =
  /*#__PURE__*/ createUseReadContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'onERC721Received',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"owner"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1Owner = /*#__PURE__*/ createUseReadContract({
  abi: mineBlocksV1Abi,
  address: mineBlocksV1Address,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"ownerOf"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1OwnerOf = /*#__PURE__*/ createUseReadContract({
  abi: mineBlocksV1Abi,
  address: mineBlocksV1Address,
  functionName: 'ownerOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"proxiableUUID"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1ProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"royaltiesEarnedOutsidePeriods"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1RoyaltiesEarnedOutsidePeriods =
  /*#__PURE__*/ createUseReadContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'royaltiesEarnedOutsidePeriods',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"royaltyInfo"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1RoyaltyInfo =
  /*#__PURE__*/ createUseReadContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'royaltyInfo',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"stakePositions"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1StakePositions =
  /*#__PURE__*/ createUseReadContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'stakePositions',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"stakedCollection"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1StakedCollection =
  /*#__PURE__*/ createUseReadContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'stakedCollection',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"supportsInterface"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1SupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"symbol"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1Symbol = /*#__PURE__*/ createUseReadContract({
  abi: mineBlocksV1Abi,
  address: mineBlocksV1Address,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"tokenURI"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1TokenUri = /*#__PURE__*/ createUseReadContract({
  abi: mineBlocksV1Abi,
  address: mineBlocksV1Address,
  functionName: 'tokenURI',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"totalSupply"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useReadMineBlocksV1TotalSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'totalSupply',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mineBlocksV1Abi}__
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useWriteMineBlocksV1 = /*#__PURE__*/ createUseWriteContract({
  abi: mineBlocksV1Abi,
  address: mineBlocksV1Address,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"approve"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useWriteMineBlocksV1Approve = /*#__PURE__*/ createUseWriteContract(
  {
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'approve',
  },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"claim"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useWriteMineBlocksV1Claim = /*#__PURE__*/ createUseWriteContract({
  abi: mineBlocksV1Abi,
  address: mineBlocksV1Address,
  functionName: 'claim',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"createOrUpdatePeriod"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useWriteMineBlocksV1CreateOrUpdatePeriod =
  /*#__PURE__*/ createUseWriteContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'createOrUpdatePeriod',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"initialize"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useWriteMineBlocksV1Initialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useWriteMineBlocksV1RenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"safeTransferFrom"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useWriteMineBlocksV1SafeTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"setAdmin"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useWriteMineBlocksV1SetAdmin =
  /*#__PURE__*/ createUseWriteContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'setAdmin',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"setApprovalForAll"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useWriteMineBlocksV1SetApprovalForAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"setAutomaticApprovalOfTransfersFromValidator"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useWriteMineBlocksV1SetAutomaticApprovalOfTransfersFromValidator =
  /*#__PURE__*/ createUseWriteContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'setAutomaticApprovalOfTransfersFromValidator',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"setBaseTokenURI"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useWriteMineBlocksV1SetBaseTokenUri =
  /*#__PURE__*/ createUseWriteContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'setBaseTokenURI',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"setContractURI"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useWriteMineBlocksV1SetContractUri =
  /*#__PURE__*/ createUseWriteContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'setContractURI',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"setTransferValidator"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useWriteMineBlocksV1SetTransferValidator =
  /*#__PURE__*/ createUseWriteContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'setTransferValidator',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"setUpgrader"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useWriteMineBlocksV1SetUpgrader =
  /*#__PURE__*/ createUseWriteContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'setUpgrader',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"stake"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useWriteMineBlocksV1Stake = /*#__PURE__*/ createUseWriteContract({
  abi: mineBlocksV1Abi,
  address: mineBlocksV1Address,
  functionName: 'stake',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"transferFrom"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useWriteMineBlocksV1TransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useWriteMineBlocksV1TransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"unstake"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useWriteMineBlocksV1Unstake = /*#__PURE__*/ createUseWriteContract(
  {
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'unstake',
  },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"upgradeTo"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useWriteMineBlocksV1UpgradeTo =
  /*#__PURE__*/ createUseWriteContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'upgradeTo',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"upgradeToAndCall"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useWriteMineBlocksV1UpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"withdrawERC20"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useWriteMineBlocksV1WithdrawErc20 =
  /*#__PURE__*/ createUseWriteContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'withdrawERC20',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mineBlocksV1Abi}__ and `functionName` set to `"withdrawRoyalties"`
 *
 * [__View Contract on Ape Chain Apescan__](https://apescan.io/address/0x0Bf7e7D6C936FEA58891d8eEb273ed685AD04F5f)
 */
export const useWriteMineBlocksV1WithdrawRoyalties =
  /*#__PURE__*/ createUseWriteContract({
    abi: mineBlocksV1Abi,
    address: mineBlocksV1Address,
    functionName: 'withdrawRoyalties',
  })


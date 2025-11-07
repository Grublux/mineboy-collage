// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IBlockVault {
    struct Item {
        address collection;
        uint256 tokenId;
        uint16 cell;
    }

    struct BlockMeta {
        uint256 rootId;
        uint256 scheduleId;
        uint16 rows;
        uint16 cols;
        uint64 lockStartedAt;
        uint32 lockDuration;
        uint32 cooldownDuration;
        uint64 cooldownStart;
        bytes snapshotCid;
        uint16 snapshotW;
        uint16 snapshotH;
        bytes32 snapshotHash;
    }

    function createBlock(
        address to,
        uint256 newId,
        uint256 rootId,
        uint256 scheduleId,
        uint16 rows,
        uint16 cols,
        Item[] calldata items,
        uint32 lockDur,
        uint32 coolDur
    ) external;

    function getBlockMeta(uint256 id) external view returns (BlockMeta memory);
    function getItems(uint256 id) external view returns (address[] memory, uint256[] memory, uint16[] memory);
    function getSnapshot(uint256 id) external view returns (bytes memory, uint16, uint16, bytes32);
}

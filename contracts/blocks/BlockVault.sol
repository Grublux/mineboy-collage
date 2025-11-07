// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {IBlockToken} from "../../interfaces/IBlockToken.sol";

contract BlockVault is ReentrancyGuard, IERC721Receiver {
    address public admin;
    address public guardian;
    address public hub;
    address public token;

    modifier onlyAdmin() {
        require(msg.sender == admin, "NOT_ADMIN");
        _;
    }

    modifier onlyHub() {
        require(msg.sender == hub, "NOT_HUB");
        _;
    }

    bool public paused;
    uint64 public pausedAt;
    uint64 public pauseEscapeDelay = 48 hours;

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

    mapping(uint256 => BlockMeta) internal _meta;
    mapping(uint256 => Item[]) internal _items;

    event HubSet(address indexed hub);
    event TokenSet(address indexed token);
    event GuardianSet(address indexed guardian);
    event PauseEscapeDelaySet(uint64 delay);
    event BlockCreated(address indexed to, uint256 indexed id, uint256 rootId, uint256 scheduleId, uint16 rows, uint16 cols, uint256 itemsLen);
    event SnapshotCIDSet(uint256 indexed id, bytes cid);
    event CooldownStarted(uint256 indexed id, uint64 when);
    event Unblocked(uint256 indexed id);
    event EmergencyUnblocked(uint256 indexed id);

    constructor() {
        admin = msg.sender;
        guardian = msg.sender;
    }

    function setHub(address h) external onlyAdmin {
        require(hub == address(0), "HUB_SET");
        hub = h;
        emit HubSet(h);
    }

    function setToken(address t) external onlyAdmin {
        require(token == address(0), "TOKEN_SET");
        token = t;
        emit TokenSet(t);
    }

    function setGuardian(address g) external onlyAdmin {
        require(g != address(0), "zero guardian");
        guardian = g;
        emit GuardianSet(g);
    }

    function pause() external {
        require(msg.sender == guardian, "NOT_GUARDIAN");
        paused = true;
        pausedAt = uint64(block.timestamp);
    }

    function unpause() external {
        require(msg.sender == guardian || msg.sender == admin, "NOAUTH");
        paused = false;
    }

    function setPauseEscapeDelay(uint64 d) external onlyAdmin {
        pauseEscapeDelay = d;
        emit PauseEscapeDelaySet(d);
    }

    function _requireOwner(uint256 id) internal view {
        require(IERC721(token).ownerOf(id) == msg.sender, "NOT_OWNER");
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
    ) external onlyHub nonReentrant {
        require(!paused, "PAUSED");
        require(rows > 0 && rows <= 6 && cols > 0 && cols <= 6, "DIM");
        require(items.length > 0 && items.length <= 36, "TOO_MANY");

        uint256 cells = uint256(rows) * uint256(cols);
        bool[] memory cellUsed = new bool[](cells);
        for (uint256 i; i < items.length; ) {
            require(items[i].cell < cells, "BAD_CELL");
            require(!cellUsed[items[i].cell], "CELL_DUP");
            cellUsed[items[i].cell] = true;
            _items[newId].push(items[i]);
            unchecked {
                ++i;
            }
        }

        _meta[newId] = BlockMeta({
            rootId: rootId,
            scheduleId: scheduleId,
            rows: rows,
            cols: cols,
            lockStartedAt: uint64(block.timestamp),
            lockDuration: lockDur,
            cooldownDuration: coolDur,
            cooldownStart: 0,
            snapshotCid: "",
            snapshotW: 0,
            snapshotH: 0,
            snapshotHash: bytes32(0)
        });

        IBlockToken(token).mint(to, newId);
        emit BlockCreated(to, newId, rootId, scheduleId, rows, cols, items.length);
    }

    function setSnapshotCID(
        uint256 id,
        bytes calldata cid,
        uint16 w,
        uint16 h,
        bytes32 hash
    ) external {
        _requireOwner(id);
        BlockMeta storage m = _meta[id];
        m.snapshotCid = cid;
        m.snapshotW = w;
        m.snapshotH = h;
        m.snapshotHash = hash;
        emit SnapshotCIDSet(id, cid);
    }

    function startCooldown(uint256 id) external {
        _requireOwner(id);
        BlockMeta storage m = _meta[id];
        require(block.timestamp >= uint256(m.lockStartedAt) + uint256(m.lockDuration), "LOCK");
        if (m.cooldownDuration > 0) {
            m.cooldownStart = uint64(block.timestamp);
            emit CooldownStarted(id, m.cooldownStart);
        }
    }

    function unblock(uint256 id) external nonReentrant {
        _requireOwner(id);
        BlockMeta storage m = _meta[id];
        if (m.lockDuration > 0) {
            require(block.timestamp >= uint256(m.lockStartedAt) + uint256(m.lockDuration), "LOCK");
        }
        if (m.cooldownDuration > 0) {
            require(m.cooldownStart != 0, "COOL_NOT_STARTED");
            require(block.timestamp >= uint256(m.cooldownStart) + uint256(m.cooldownDuration), "COOL");
        }

        Item[] storage arr = _items[id];
        for (uint256 i; i < arr.length; ) {
            IERC721(arr[i].collection).safeTransferFrom(address(this), msg.sender, arr[i].tokenId);
            unchecked {
                ++i;
            }
        }
        delete _items[id];
        delete _meta[id];
        IBlockToken(token).burn(id);
        emit Unblocked(id);
    }

    function emergencyUnblock(uint256 id) external nonReentrant {
        _requireOwner(id);
        require(paused && block.timestamp >= uint256(pausedAt) + uint256(pauseEscapeDelay), "ESCAPE");

        Item[] storage arr = _items[id];
        for (uint256 i; i < arr.length; ) {
            IERC721(arr[i].collection).safeTransferFrom(address(this), msg.sender, arr[i].tokenId);
            unchecked {
                ++i;
            }
        }
        delete _items[id];
        delete _meta[id];
        IBlockToken(token).burn(id);
        emit EmergencyUnblocked(id);
    }

    function getBlockMeta(uint256 id) external view returns (BlockMeta memory) {
        return _meta[id];
    }

    function getItems(uint256 id) external view returns (address[] memory c, uint256[] memory t, uint16[] memory cell) {
        Item[] storage a = _items[id];
        uint256 n = a.length;
        c = new address[](n);
        t = new uint256[](n);
        cell = new uint16[](n);
        for (uint256 i; i < n; ) {
            c[i] = a[i].collection;
            t[i] = a[i].tokenId;
            cell[i] = a[i].cell;
            unchecked {
                ++i;
            }
        }
    }

    function getSnapshot(uint256 id) external view returns (bytes memory cid, uint16 w, uint16 h, bytes32 hash) {
        BlockMeta storage m = _meta[id];
        return (m.snapshotCid, m.snapshotW, m.snapshotH, m.snapshotHash);
    }

    function isUnlockable(uint256 id) external view returns (bool) {
        BlockMeta storage m = _meta[id];
        if (m.lockDuration == 0) return true;
        return block.timestamp >= uint256(m.lockStartedAt) + uint256(m.lockDuration);
    }

    function timeToUnlock(uint256 id) external view returns (uint256) {
        BlockMeta storage m = _meta[id];
        if (m.lockDuration == 0) return 0;
        uint256 end = uint256(m.lockStartedAt) + uint256(m.lockDuration);
        return block.timestamp >= end ? 0 : (end - block.timestamp);
    }

    function timeToCool(uint256 id) external view returns (uint256) {
        BlockMeta storage m = _meta[id];
        if (m.cooldownDuration == 0 || m.cooldownStart == 0) return 0;
        uint256 end = uint256(m.cooldownStart) + uint256(m.cooldownDuration);
        return block.timestamp >= end ? 0 : (end - block.timestamp);
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return 0x150b7a02;
    }
}

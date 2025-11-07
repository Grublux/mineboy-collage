// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IBlockVault} from "../../interfaces/IBlockVault.sol";

contract BlockHub is AccessControl, ReentrancyGuard, IERC721Receiver {
    bytes32 public constant FUNDS_ROLE = keccak256("FUNDS_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");
    bytes32 public constant COLLECTION_MANAGER_ROLE = keccak256("COLLECTION_MANAGER_ROLE");
    bytes32 public constant DURATION_ROLE = keccak256("DURATION_ROLE");

    address public rewardsSplitter;
    address public blockToken;
    address public blockVault;

    bool public globalRootCreationOpen;

    struct Root {
        address collection;
        string label;
        address creator;
        uint256 priceETH;
        mapping(address => uint256) price20;
        mapping(address => bool) erc20Allowed;
        address ticket1155;
        uint256 ticketId1155;
        bool ticket1155Required;
        address ticket721;
        bool ticket721Required;
    }

    struct RootView {
        address collection;
        string label;
        address creator;
        uint256 priceETH;
    }

    struct Schedule {
        uint256 id;
        uint64 openAt;
        uint64 closeAt;
        uint32 lockDuration;
        uint32 cooldownDuration;
        bool active;
    }

    // Item struct defined in IBlockVault


    mapping(uint256 => Root) public roots;
    mapping(uint256 => mapping(uint256 => Schedule)) public schedules;
    mapping(uint256 => uint256) public nextScheduleId;
    uint256 public nextRootId = 1;
    uint256 private _id;

    address public constant NGT = 0x72CddB64A72176B442bdfD9C8Bb7968E652d8D1a;

    event RootCreated(uint256 indexed rootId, address indexed collection, string label, address indexed creator);
    event GlobalRootCreationOpenSet(bool value);
    event PriceETHSet(uint256 indexed rootId, uint256 price);
    event Price20Set(uint256 indexed rootId, address indexed token, uint256 price);
    event Allowed20Set(uint256 indexed rootId, address indexed token, bool allowed);
    event Ticket1155Set(uint256 indexed rootId, address erc1155, uint256 id, bool required);
    event Ticket721Set(uint256 indexed rootId, address erc721, bool required);
    event ScheduleCreated(uint256 indexed rootId, uint256 indexed scheduleId, uint64 openAt, uint64 closeAt, uint32 lockDur, uint32 coolDur);
    event ScheduleActiveSet(uint256 indexed rootId, uint256 indexed scheduleId, bool active);
    event BlockMinted(uint256 indexed rootId, uint256 indexed scheduleId, uint256 indexed blockId, address payer, address paymentToken, uint256 amount);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(FUNDS_ROLE, admin);
        _grantRole(GUARDIAN_ROLE, admin);
        _grantRole(COLLECTION_MANAGER_ROLE, admin);
        _grantRole(DURATION_ROLE, admin);
    }

    function setBlockToken(address t) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(blockToken == address(0), "TOKEN_SET");
        blockToken = t;
    }

    function setBlockVault(address v) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(blockVault == address(0), "VAULT_SET");
        blockVault = v;
    }

    function setRewardsSplitter(address r) external onlyRole(FUNDS_ROLE) {
        require(r != address(0), "zero splitter");
        rewardsSplitter = r;
    }

    function setGlobalRootCreationOpen(bool v) external onlyRole(COLLECTION_MANAGER_ROLE) {
        globalRootCreationOpen = v;
        emit GlobalRootCreationOpenSet(v);
    }

    function createRoot(address collection, string calldata label) external onlyRole(COLLECTION_MANAGER_ROLE) returns (uint256 rootId) {
        rootId = nextRootId++;
        Root storage r = roots[rootId];
        r.collection = collection;
        r.label = label;
        r.creator = msg.sender;
        r.priceETH = 0;
        r.price20[NGT] = 1_111e18;
        r.erc20Allowed[NGT] = true;
        emit RootCreated(rootId, collection, label, msg.sender);
    }

    function createRootPublic(address collection, string calldata label) external returns (uint256) {
        require(globalRootCreationOpen, "ROOT_CREATION_CLOSED");
        uint256 rootId = nextRootId++;
        Root storage r = roots[rootId];
        r.collection = collection;
        r.label = label;
        r.creator = msg.sender;
        r.priceETH = 0;
        r.price20[NGT] = 1_111e18;
        r.erc20Allowed[NGT] = true;
        emit RootCreated(rootId, collection, label, msg.sender);
        return rootId;
    }

    function setPriceETH(uint256 rootId, uint256 weiPrice) external onlyRole(FUNDS_ROLE) {
        require(roots[rootId].collection != address(0), "NO_ROOT");
        roots[rootId].priceETH = weiPrice;
        emit PriceETHSet(rootId, weiPrice);
    }

    function setPrice20(uint256 rootId, address token, uint256 weiPrice) external onlyRole(FUNDS_ROLE) {
        require(roots[rootId].collection != address(0), "NO_ROOT");
        roots[rootId].price20[token] = weiPrice;
        emit Price20Set(rootId, token, weiPrice);
    }

    function setAllowed20(uint256 rootId, address token, bool allowed) external onlyRole(FUNDS_ROLE) {
        require(roots[rootId].collection != address(0), "NO_ROOT");
        roots[rootId].erc20Allowed[token] = allowed;
        emit Allowed20Set(rootId, token, allowed);
    }

    function setTicket1155(uint256 rootId, address erc1155, uint256 id, bool required) external onlyRole(COLLECTION_MANAGER_ROLE) {
        require(roots[rootId].collection != address(0), "NO_ROOT");
        Root storage r = roots[rootId];
        r.ticket1155 = erc1155;
        r.ticketId1155 = id;
        r.ticket1155Required = required;
        emit Ticket1155Set(rootId, erc1155, id, required);
    }

    function setTicket721(uint256 rootId, address erc721, bool required) external onlyRole(COLLECTION_MANAGER_ROLE) {
        require(roots[rootId].collection != address(0), "NO_ROOT");
        Root storage r = roots[rootId];
        r.ticket721 = erc721;
        r.ticket721Required = required;
        emit Ticket721Set(rootId, erc721, required);
    }

    function createSchedule(
        uint256 rootId,
        uint64 openAt,
        uint64 closeAt,
        uint32 lockDur,
        uint32 coolDur
    ) external onlyRole(DURATION_ROLE) returns (uint256 sid) {
        require(roots[rootId].collection != address(0), "NO_ROOT");
        sid = nextScheduleId[rootId]++;
        schedules[rootId][sid] = Schedule(sid, openAt, closeAt, lockDur, coolDur, true);
        emit ScheduleCreated(rootId, sid, openAt, closeAt, lockDur, coolDur);
    }

    function setScheduleActive(uint256 rootId, uint256 sid, bool a) external onlyRole(DURATION_ROLE) {
        require(roots[rootId].collection != address(0), "NO_ROOT");
        require(schedules[rootId][sid].id == sid, "NO_SCHED");
        schedules[rootId][sid].active = a;
        emit ScheduleActiveSet(rootId, sid, a);
    }

    function _nextId() internal returns (uint256) {
        return ++_id;
    }

    function currentId() external view returns (uint256) {
        return _id;
    }

    function getRoot(uint256 rootId) external view returns (RootView memory v) {
        Root storage r = roots[rootId];
        v.collection = r.collection;
        v.label = r.label;
        v.creator = r.creator;
        v.priceETH = r.priceETH;
    }

    function getPrice20(uint256 rootId, address token) external view returns (uint256) {
        return roots[rootId].price20[token];
    }

    function isTokenAllowed(uint256 rootId, address token) external view returns (bool) {
        return roots[rootId].erc20Allowed[token];
    }

    function mintBlockETH(
        uint256 rootId,
        uint16 rows,
        uint16 cols,
        IBlockVault.Item[] calldata items,
        uint256 scheduleIdOpt
    ) external payable nonReentrant {
        Root storage r = roots[rootId];
        require(r.collection != address(0), "NO_ROOT");
        _checkTickets(r);
        (uint32 lockDur, uint32 coolDur) = _getScheduleDurations(rootId, scheduleIdOpt);
        uint256 p = _handlePaymentETH(r.priceETH);
        _validateAndPullNFTs(r.collection, rows, cols, items);
        uint256 newId = _nextId();
        _createBlockInVault(msg.sender, newId, rootId, scheduleIdOpt, rows, cols, items, lockDur, coolDur);
        emit BlockMinted(rootId, scheduleIdOpt, newId, msg.sender, address(0), p);
    }

    function mintBlock20(
        uint256 rootId,
        address token20,
        uint16 rows,
        uint16 cols,
        IBlockVault.Item[] calldata items,
        uint256 scheduleIdOpt
    ) external nonReentrant {
        Root storage r = roots[rootId];
        require(r.collection != address(0), "NO_ROOT");
        require(r.erc20Allowed[token20], "TOKEN_NA");
        (uint32 lockDur, uint32 coolDur) = _getScheduleDurations(rootId, scheduleIdOpt);
        uint256 price = _handlePayment20(r, token20);
        _validateAndPullNFTs(r.collection, rows, cols, items);
        uint256 newId = _nextId();
        _createBlockInVault(msg.sender, newId, rootId, scheduleIdOpt, rows, cols, items, lockDur, coolDur);
        emit BlockMinted(rootId, scheduleIdOpt, newId, msg.sender, token20, price);
    }

    function _checkTickets(Root storage r) internal view {
        if (r.ticket1155Required) {
            require(IERC1155(r.ticket1155).balanceOf(msg.sender, r.ticketId1155) > 0, "NO_TICKET_1155");
        }
        if (r.ticket721Required) {
            require(IERC721(r.ticket721).balanceOf(msg.sender) > 0, "NO_TICKET_721");
        }
    }

    function _getScheduleDurations(uint256 rootId, uint256 scheduleIdOpt) internal view returns (uint32 lockDur, uint32 coolDur) {
        if (scheduleIdOpt != 0) {
            Schedule memory s = schedules[rootId][scheduleIdOpt];
            require(s.active, "SCHED_OFF");
            require(block.timestamp >= s.openAt && block.timestamp <= s.closeAt, "OUT_WINDOW");
            return (s.lockDuration, s.cooldownDuration);
        }
        return (0, 0);
    }

    function _handlePaymentETH(uint256 price) internal returns (uint256) {
        if (price == 0) {
            require(msg.value == 0, "NO_VALUE_FOR_FREE");
        } else {
            require(msg.value == price, "BAD_ETH");
            (bool ok, ) = rewardsSplitter.call{value: msg.value}("");
            require(ok, "PAY_ETH");
        }
        return price;
    }

    function _handlePayment20(Root storage r, address token20) internal returns (uint256) {
        uint256 price = r.price20[token20];
        if (price > 0) {
            SafeERC20.safeTransferFrom(IERC20(token20), msg.sender, rewardsSplitter, price);
        }
        return price;
    }

    function _validateAndPullNFTs(address collection, uint16 rows, uint16 cols, IBlockVault.Item[] calldata items) internal {
        require(rows > 0 && rows <= 6 && cols > 0 && cols <= 6, "DIM");
        require(items.length > 0 && items.length <= 36, "TOO_MANY");
        uint256 cells = uint256(rows) * uint256(cols);
        for (uint256 i; i < items.length; ) {
            require(items[i].collection == collection, "WRONG_COLL");
            require(items[i].cell < cells, "BAD_CELL");
            IERC721(items[i].collection).safeTransferFrom(msg.sender, blockVault, items[i].tokenId);
            unchecked {
                ++i;
            }
        }
    }

        function _createBlockInVault(
        address to,
        uint256 newId,
        uint256 rootId,
        uint256 scheduleId,
        uint16 rows,
        uint16 cols,
        IBlockVault.Item[] calldata items,
        uint32 lockDur,
        uint32 coolDur
    ) internal {
        IBlockVault.Item[] memory vaultItems = new IBlockVault.Item[](items.length);
        for (uint256 i; i < items.length; ) {
            vaultItems[i] = IBlockVault.Item(items[i].collection, items[i].tokenId, items[i].cell);
            unchecked { ++i; }
        }
        IBlockVault(blockVault).createBlock(to, newId, rootId, scheduleId, rows, cols, vaultItems, lockDur, coolDur);
    }

        function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}

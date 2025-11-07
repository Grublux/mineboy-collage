// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {BlockToken} from "../../contracts/blocks/BlockToken.sol";
import {BlockVault} from "../../contracts/blocks/BlockVault.sol";
import {BlockHub} from "../../contracts/blocks/BlockHub.sol";
import {IBlockVault} from "../../interfaces/IBlockVault.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock ERC721 for testing
contract MockERC721 is ERC721 {
    uint256 private _nextId = 1;

    constructor() ERC721("MockNFT", "MOCK") {}

    function mint(address to, uint256 id) external {
        _safeMint(to, id);
    }

    function mintBatch(address to, uint256 count) external {
        for (uint256 i; i < count; ) {
            _safeMint(to, _nextId++);
            unchecked {
                ++i;
            }
        }
    }
}

// Mock ERC20 for NGT
contract MockNGT is ERC20 {
    constructor() ERC20("NGT", "NGT") {
        _mint(msg.sender, 1000000e18);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract BlockFlowTest is Test {
    BlockToken token;
    BlockVault vault;
    BlockHub hub;
    MockERC721 collection;
    MockNGT ngt;

    address deployer = address(0x1);
    address user = address(0x2);
    address guardian = address(0x3);

    address constant NGT_ADDR = 0x72CddB64A72176B442bdfD9C8Bb7968E652d8D1a;

    function setUp() public {
        vm.startPrank(deployer);
        token = new BlockToken();
        vault = new BlockVault();
        hub = new BlockHub(deployer);
        collection = new MockERC721();
        ngt = new MockNGT();

        // Wire contracts
        hub.setBlockToken(address(token));
        hub.setBlockVault(address(vault));
        vault.setToken(address(token));
        vault.setHub(address(hub));
        token.setHub(address(hub));

        // Set royalty to deployer (6.9%)
        token.setRoyalty(deployer, 690);

        // Set rewards splitter to deployer
        hub.setRewardsSplitter(deployer);

        // Set guardian
        vault.setGuardian(guardian);

        vm.stopPrank();
    }

    function test_Build_NoIR() public {
        // Just verify contracts compile and deploy
        assertTrue(address(token) != address(0));
        assertTrue(address(vault) != address(0));
        assertTrue(address(hub) != address(0));
    }

    function test_Root_Defaults() public {
        vm.prank(deployer);
        uint256 rootId = hub.createRoot(address(collection), "TestRoot");

        BlockHub.RootView memory root = hub.getRoot(rootId);
        assertEq(root.collection, address(collection));
        assertEq(root.label, "TestRoot");
        assertEq(root.creator, deployer);
        assertEq(root.priceETH, 0);

        // Check NGT defaults
        uint256 ngtPrice = hub.getPrice20(rootId, NGT_ADDR);
        assertEq(ngtPrice, 1_111e18);
        assertTrue(hub.isTokenAllowed(rootId, NGT_ADDR));
    }

    function test_Mint_FreeETH_ThenUnblock() public {
        vm.startPrank(deployer);
        uint256 rootId = hub.createRoot(address(collection), "TestRoot");
        vm.stopPrank();

        // Mint 4 NFTs to user
        vm.startPrank(user);
        collection.mint(user, 1);
        collection.mint(user, 2);
        collection.mint(user, 3);
        collection.mint(user, 4);

        // Approve vault
        collection.approve(address(vault), 1);
        collection.approve(address(vault), 2);
        collection.approve(address(vault), 3);
        collection.approve(address(vault), 4);

        // Mint block (free ETH)
        IBlockVault.Item[] memory items = new IBlockVault.Item[](4);
        items[0] = IBlockVault.Item({collection: address(collection), tokenId: 1, cell: 0});
        items[1] = IBlockVault.Item({collection: address(collection), tokenId: 2, cell: 1});
        items[2] = IBlockVault.Item({collection: address(collection), tokenId: 3, cell: 2});
        items[3] = IBlockVault.Item({collection: address(collection), tokenId: 4, cell: 3});

        hub.mintBlockETH{value: 0}(rootId, 2, 2, items, 0);
        uint256 blockId = hub.currentId();
        assertEq(token.ownerOf(blockId), user);

        // Set snapshot
        bytes memory cid = bytes("bafy-test");
        bytes32 hash = keccak256("test");
        vault.setSnapshotCID(blockId, cid, 48, 48, hash);

        // Unblock
        vault.unblock(blockId);

        // Token should be burned
        vm.expectRevert();
        token.ownerOf(blockId);

        // NFTs should be returned (check balance)
        assertEq(collection.balanceOf(user), 4);
        vm.stopPrank();
    }

    function test_Mint_PaidNGT() public {
        vm.startPrank(deployer);
        uint256 rootId = hub.createRoot(address(collection), "TestRoot");
        // NGT price already set to 1_111e18 in createRoot
        vm.stopPrank();

        // Mint NFTs and NGT to user
        vm.startPrank(user);
        collection.mint(user, 1);
        collection.mint(user, 2);
        ngt.mint(user, 10_000e18);

        collection.approve(address(vault), 1);
        collection.approve(address(vault), 2);
        ngt.approve(address(hub), 1_111e18);

        IBlockVault.Item[] memory items = new IBlockVault.Item[](2);
        items[0] = IBlockVault.Item({collection: address(collection), tokenId: 1, cell: 0});
        items[1] = IBlockVault.Item({collection: address(collection), tokenId: 2, cell: 1});

        uint256 deployerBalanceBefore = ngt.balanceOf(deployer);
        hub.mintBlock20(rootId, address(ngt), 2, 1, items, 0);
        uint256 deployerBalanceAfter = ngt.balanceOf(deployer);
        assertEq(deployerBalanceAfter - deployerBalanceBefore, 1_111e18);
        vm.stopPrank();
    }

    function test_Tickets_Gating() public {
        MockERC721 ticket721 = new MockERC721();
        vm.startPrank(deployer);
        uint256 rootId = hub.createRoot(address(collection), "TestRoot");
        hub.setTicket721(rootId, address(ticket721), true);
        vm.stopPrank();

        vm.startPrank(user);
        collection.mint(user, 1);
        collection.approve(address(vault), 1);

        IBlockVault.Item[] memory items = new IBlockVault.Item[](1);
        items[0] = IBlockVault.Item({collection: address(collection), tokenId: 1, cell: 0});

        // Should fail without ticket
        vm.expectRevert("NO_TICKET_721");
        hub.mintBlockETH{value: 0}(rootId, 1, 1, items, 0);

        // Mint ticket and try again
        ticket721.mint(user, 1);
        hub.mintBlockETH{value: 0}(rootId, 1, 1, items, 0);
        vm.stopPrank();
    }

    function test_Schedule_Optional() public {
        vm.startPrank(deployer);
        uint256 rootId = hub.createRoot(address(collection), "TestRoot");
        uint256 schedId = hub.createSchedule(rootId, uint64(block.timestamp - 1 hours), uint64(block.timestamp + 1 days), 1 days, 1 days);
        vm.stopPrank();

        vm.startPrank(user);
        collection.mint(user, 1);
        collection.approve(address(vault), 1);

        IBlockVault.Item[] memory items = new IBlockVault.Item[](1);
        items[0] = IBlockVault.Item({collection: address(collection), tokenId: 1, cell: 0});

        // Mint with schedule
        hub.mintBlockETH{value: 0}(rootId, 1, 1, items, schedId);
        uint256 blockId = hub.currentId();

        // Should be locked
        assertFalse(vault.isUnlockable(blockId));
        assertGt(vault.timeToUnlock(blockId), 0);

        // Warp past lock
        vm.warp(block.timestamp + 1 days + 1);
        assertTrue(vault.isUnlockable(blockId));

        // Start cooldown
        vault.startCooldown(blockId);
        assertGt(vault.timeToCool(blockId), 0);

        // Warp past cooldown
        vm.warp(block.timestamp + 1 days + 1);
        vault.unblock(blockId);
        vm.stopPrank();
    }

    function test_Pause_Emergency() public {
        vm.startPrank(deployer);
        uint256 rootId = hub.createRoot(address(collection), "TestRoot");
        vm.stopPrank();

        vm.startPrank(user);
        collection.mint(user, 1);
        collection.approve(address(vault), 1);

        IBlockVault.Item[] memory items = new IBlockVault.Item[](1);
        items[0] = IBlockVault.Item({collection: address(collection), tokenId: 1, cell: 0});

        hub.mintBlockETH{value: 0}(rootId, 1, 1, items, 0);
        uint256 blockId = hub.currentId();
        vm.stopPrank();

        // Pause
        vm.prank(guardian);
        vault.pause();

        // Warp past escape delay
        vm.warp(block.timestamp + 48 hours + 1);

        // Emergency unblock
        vm.prank(user);
        vault.emergencyUnblock(blockId);

        // Token should be burned
        vm.expectRevert();
        token.ownerOf(blockId);
    }

    function test_Royalties_2981() public {
        (address receiver, uint256 royalty) = token.royaltyInfo(1, 1e18);
        assertEq(receiver, deployer);
        assertEq(royalty, 0.069e18); // 6.9% of 1e18

        // Update royalty
        vm.prank(deployer);
        address newReceiver = address(0x999);
        token.setRoyalty(newReceiver, 0);

        (address newR, uint256 newRoyalty) = token.royaltyInfo(1, 1e18);
        assertEq(newR, newReceiver);
        assertEq(newRoyalty, 0);
    }
}


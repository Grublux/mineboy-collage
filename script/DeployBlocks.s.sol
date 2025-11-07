// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {BlockToken} from "../contracts/blocks/BlockToken.sol";
import {BlockVault} from "../contracts/blocks/BlockVault.sol";
import {BlockHub} from "../contracts/blocks/BlockHub.sol";

contract DeployBlocks is Script {
    address public blockToken;
    address public blockVault;
    address public blockHub;

    address public constant NGT = 0x72CddB64A72176B442bdfD9C8Bb7968E652d8D1a;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // Only create Goobaloo root on deployment
        address goobaloo = 0xDeAD14d547030f71ED3EeD6523525d61E1474807;

        vm.startBroadcast(deployerPrivateKey);

        console.log("\n=== Deploying Blocks Contracts ===");
        console.log("Deployer:", deployer);

        console.log("\n1. Deploying BlockToken...");
        BlockToken token = new BlockToken();
        blockToken = address(token);
        console.log("BlockToken deployed at:", blockToken);

        console.log("\n2. Deploying BlockVault...");
        BlockVault vault = new BlockVault();
        blockVault = address(vault);
        console.log("BlockVault deployed at:", blockVault);

        console.log("\n3. Deploying BlockHub...");
        BlockHub hub = new BlockHub(deployer);
        blockHub = address(hub);
        console.log("BlockHub deployed at:", blockHub);

        console.log("\n4. Wiring contracts...");
        hub.setBlockToken(blockToken);
        hub.setBlockVault(blockVault);
        vault.setToken(blockToken);
        vault.setHub(blockHub);
        token.setHub(blockHub);
        console.log("OK Contracts wired");

        console.log("\n5. Setting BlockToken royalty to deployer (6.9%)...");
        token.setRoyalty(deployer, 690);
        console.log("OK Royalty set to 6.9% (690 bps) ->", deployer);

        console.log("\n6. Setting BlockHub rewardsSplitter to deployer...");
        hub.setRewardsSplitter(deployer);
        console.log("OK RewardsSplitter set ->", deployer);

        console.log("\n7. Hub roles granted to deployer in constructor");
        console.log("  - DEFAULT_ADMIN_ROLE");
        console.log("  - FUNDS_ROLE");
        console.log("  - COLLECTION_MANAGER_ROLE");
        console.log("  - DURATION_ROLE");

        console.log("\n8. Creating Goobaloo root...");
        uint256 goobalooRootId = hub.createRoot(goobaloo, "Goobaloo");
        console.log("Goobaloo root created:", goobalooRootId);
        console.log("OK Goobaloo root created (ETH=0, NGT=1_111e18, NGT allowed=true)");
        console.log("Note: Other roots can be created later via hub.createRoot() by admin");

        vm.stopBroadcast();

        console.log("\n=== Deployment Summary ===");
        console.log("BlockToken:", blockToken);
        console.log("BlockVault:", blockVault);
        console.log("BlockHub:", blockHub);
        console.log("Deployer (Admin):", deployer);
        console.log("Royalty Receiver:", deployer);
        console.log("RewardsSplitter:", deployer);
        console.log("NGT Address:", NGT);
        console.log("\nRoot ID:");
        console.log("  Goobaloo:", goobalooRootId);
    }
}

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RewardsSplitter
 * @notice Splits received funds between treasury and rewards pool based on configurable fee basis points.
 * - Receives ETH via receive()
 * - Sweeps ERC-20 tokens
 * - distribute() splits current balances by config
 * - FUNDS_ROLE can update addresses and bps (bounded <= 10000)
 */
contract RewardsSplitter is AccessControl, ReentrancyGuard {
    bytes32 public constant FUNDS_ROLE = keccak256("FUNDS_ROLE");

    address public treasury;
    address public rewardsPool;
    uint16 public feeBpsToRewards; // basis points (0-10000), rest goes to treasury

    event ConfigUpdated(address indexed by, address treasury, address rewardsPool, uint16 feeBpsToRewards);
    event Distributed(address indexed token, uint256 treasuryAmount, uint256 rewardsAmount);

    constructor(address admin, address _treasury, address _rewardsPool, uint16 _feeBpsToRewards) {
        require(_treasury != address(0), "zero treasury");
        require(_rewardsPool != address(0), "zero rewards");
        require(_feeBpsToRewards <= 10000, "bps > 10000");
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(FUNDS_ROLE, admin);
        
        treasury = _treasury;
        rewardsPool = _rewardsPool;
        feeBpsToRewards = _feeBpsToRewards;
    }

    function updateConfig(address _treasury, address _rewardsPool, uint16 _feeBpsToRewards) external onlyRole(FUNDS_ROLE) {
        require(_treasury != address(0), "zero treasury");
        require(_rewardsPool != address(0), "zero rewards");
        require(_feeBpsToRewards <= 10000, "bps > 10000");
        
        treasury = _treasury;
        rewardsPool = _rewardsPool;
        feeBpsToRewards = _feeBpsToRewards;
        
        emit ConfigUpdated(msg.sender, _treasury, _rewardsPool, _feeBpsToRewards);
    }

    receive() external payable {
        // Accept ETH
    }

    function sweepERC20(address token) external onlyRole(FUNDS_ROLE) {
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance > 0) {
            require(IERC20(token).transfer(treasury, balance), "transfer fail");
        }
    }

    function distribute() external nonReentrant {
        _distributeETH();
    }

    function distributeERC20(address token) external nonReentrant {
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance == 0) return;

        uint256 rewardsAmount = (balance * feeBpsToRewards) / 10000;
        uint256 treasuryAmount = balance - rewardsAmount;

        if (rewardsAmount > 0) {
            require(IERC20(token).transfer(rewardsPool, rewardsAmount), "rewards transfer fail");
        }
        if (treasuryAmount > 0) {
            require(IERC20(token).transfer(treasury, treasuryAmount), "treasury transfer fail");
        }

        emit Distributed(token, treasuryAmount, rewardsAmount);
    }

    function _distributeETH() internal {
        uint256 balance = address(this).balance;
        if (balance == 0) return;

        uint256 rewardsAmount = (balance * feeBpsToRewards) / 10000;
        uint256 treasuryAmount = balance - rewardsAmount;

        if (rewardsAmount > 0) {
            (bool ok1,) = payable(rewardsPool).call{value: rewardsAmount}("");
            require(ok1, "rewards send fail");
        }
        if (treasuryAmount > 0) {
            (bool ok2,) = payable(treasury).call{value: treasuryAmount}("");
            require(ok2, "treasury send fail");
        }

        emit Distributed(address(0), treasuryAmount, rewardsAmount);
    }
}


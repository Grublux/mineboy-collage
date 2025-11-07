// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

/// @notice Minimal interface a GridStaker can call to assert/consume a "ticket".
interface ITicketChecker {
    /// @dev Should return true iff the `user` has a spendable ticket, and must decrement it atomically.
    function consumeTicket(address user) external returns (bool);
}


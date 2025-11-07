// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ICreatorTokenTransferValidator
 * @notice Interface for Limit Break Creator Token Transfer Validator
 */
interface ICreatorTokenTransferValidator {
    function validateTransfer(
        address caller,
        address from,
        address to,
        uint256 tokenId
    ) external view;
    
    function beforeAuthorizedTransfer(
        address operator,
        address token
    ) external;
}


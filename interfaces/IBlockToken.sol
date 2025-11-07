// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IBlockToken {
    function mint(address to, uint256 id) external;
    function burn(uint256 id) external;
    function ownerOf(uint256 id) external view returns (address);
}

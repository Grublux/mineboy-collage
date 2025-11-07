// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BlockToken is ERC721, ReentrancyGuard {
    address public admin;
    address public hub;
    uint256 private _minted;

    modifier onlyAdmin() {
        require(msg.sender == admin, "NOT_ADMIN");
        _;
    }

    modifier onlyHub() {
        require(msg.sender == hub, "NOT_HUB");
        _;
    }

    address public royaltyReceiver;
    uint96 public royaltyBps;

    address public transferValidator;
    bool public validatorEnabled;

    event HubSet(address indexed hub);
    event RoyaltySet(address indexed receiver, uint96 bps);
    event TransferValidatorSet(address indexed validator, bool enabled);

    constructor() ERC721("Blocked", "BLOCK") {
        admin = msg.sender;
    }

    function setHub(address h) external onlyAdmin {
        require(hub == address(0), "HUB_SET");
        hub = h;
        emit HubSet(h);
    }

    function mint(address to, uint256 id) external onlyHub {
        _safeMint(to, id);
        _minted++;
    }

    function burn(uint256 id) external onlyHub {
        _burn(id);
    }

    function minted() external view returns (uint256) {
        return _minted;
    }

    function setRoyalty(address receiver, uint96 bps) external onlyAdmin {
        require(bps <= 10000, "BPS");
        royaltyReceiver = receiver;
        royaltyBps = bps;
        emit RoyaltySet(receiver, bps);
    }

    function royaltyInfo(uint256, uint256 salePrice) external view returns (address, uint256) {
        return (royaltyReceiver, (salePrice * royaltyBps) / 10000);
    }

    function setTransferValidator(address v, bool e) external onlyAdmin {
        transferValidator = v;
        validatorEnabled = e;
        emit TransferValidatorSet(v, e);
    }

    function tokenURI(uint256) public pure override returns (string memory) {
        return "";
    }

    function supportsInterface(bytes4 iid) public view override returns (bool) {
        return iid == 0x2a55205a || super.supportsInterface(iid);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyToken is ERC721 {
    uint256 public nextTokenId;

    constructor() ERC721("LIVE OR DIE", "LD") {}

    /// @notice Mint a "victory" NFT to `to`
    function mintVictory(address to) public returns (uint256) {
        uint256 tokenId = nextTokenId++;
        _mint(to, tokenId);
        return tokenId;
    }

    /// @notice Mint a "defeat" NFT to `to`
    function mintDefeat(address to) public returns (uint256) {
        uint256 tokenId = nextTokenId++;
        _mint(to, tokenId);
        return tokenId;
    }
} 
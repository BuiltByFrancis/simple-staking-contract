// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./base/OwnerWithdrawable.sol";

contract NFT is ERC721Enumerable, OwnerWithdrawable {
    error notRunning();
    error exceededSupply();
    error insufficientFunds();

    using Strings for uint256;

    string _baseTokenURI;

    uint256 public price = 0.01 ether;
    uint256 public maxTokenIds = 10;
    uint256 public tokenId;
    bool public paused;

    modifier whenRunning() {
        if (paused) revert notRunning();
        _;
    }

    constructor(string memory baseURI) ERC721("NonFunctionalTweet", "NFT") {
        _baseTokenURI = baseURI;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string memory baseURI) public onlyOwner {
         _baseTokenURI = baseURI;
    }

    function mint() public payable whenRunning {
        if (tokenId >= maxTokenIds) revert exceededSupply();
        if (msg.value < price) revert insufficientFunds();

        unchecked {
            ++tokenId;
        }

        _safeMint(msg.sender, tokenId);
    }

    function setPaused(bool _paused) public onlyOwner {
        paused = _paused;
    }

    receive() external payable {}

    fallback() external payable {}
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

error notRunning();
error missingToken();
error withdrawFailed();
error exceededSupply();
error insufficientFunds();

contract NFT is ERC721Enumerable, Ownable {
    using Strings for uint256;

    string _baseTokenURI;

    uint256 public _price = 0.01 ether;
    uint256 public _maxTokenIds = 10;
    uint256 public _tokenId;
    bool public _paused;

    modifier whenRunning() {
        if (_paused) revert notRunning();
        _;
    }

    constructor(string memory baseURI) ERC721("NonFunctionalTweet", "NFT") {
        _baseTokenURI = baseURI;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (!_exists(tokenId)) revert missingToken();

        string memory baseURI = _baseURI();
        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
                : "";
    }

    function mint() public payable whenRunning {
        if (_tokenId >= _maxTokenIds) revert exceededSupply();
        if (msg.value < _price) revert insufficientFunds();

        unchecked {
            ++_tokenId;
        }

        _safeMint(msg.sender, _tokenId);
    }

    function setPaused(bool paused) public onlyOwner {
        _paused = paused;
    }

    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 balance = address(this).balance;
        (bool success, ) = _owner.call{value: balance}("");
        if (!success) revert withdrawFailed();
    }

    receive() external payable {}

    fallback() external payable {}
}

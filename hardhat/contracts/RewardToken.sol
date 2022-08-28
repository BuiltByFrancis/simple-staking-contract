// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./base/OwnerWithdrawable.sol";

error withdrawFailed();

contract RewardToken is ERC20, OwnerWithdrawable {
    uint256 public constant maxTotalSupply = 10000 * 10**18;

    constructor() ERC20("RewardToken", "RT") {
        _mint(msg.sender, maxTotalSupply);
    }

    receive() external payable {}

    fallback() external payable {}
}

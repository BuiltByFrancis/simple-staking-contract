// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract OwnerWithdrawable is Ownable {
    error withdrawFailed();

    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 balance = address(this).balance;
        (bool success, ) = _owner.call{value: balance}("");
        if (!success) revert withdrawFailed();
    }
}

//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract Bounty {
    // set to the PRHunter wallet for now
    address private root = "";
    uint256 private balance;
    address payable owner;  // the bounty creator
    uint256 public expiration; // Timeout in case no one completes the bounty in time

    constructor() {
        owner = payable(msg.sender); // setting the contract creator
    }

    function getExpiryDate() public view returns (uint256) {
        return 0;
    }

    function getBountyValue() public view returns (uint256) {}

    // If the timeout is reached without the recipient closing the channel, then
    // the ether is released back to the sender.
    function claimTimeout() public {
        require(block.timestamp >= expiration);
        selfdestruct(owner);
    }

    function payoutBounty(address payable recipient) public payable {
        require(msg.sender == root);

        (bool sent, bytes memory data) = recipient.call{value: balance.value}("");
        require(sent, "Failed to send Ether");
    }
}

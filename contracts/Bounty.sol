//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract Bounty {
    uint256 public expiryTimestamp; // Timeout in case no one completes the bounty in time

    address payable supervisor; // the address which receives the commision and manages payouts
    address payable owner;  // the bounty creator
    address parent;  // address of the parent contract

    event BountyCompleted(address indexed bountyAddress, uint256 balance);

    constructor(address payable _supervisor, address payable _owner, uint256 _expiryTimestamp) {
        parent = msg.sender; // setting the contract creator
        owner = _owner;
        supervisor = _supervisor;
        expiryTimestamp = _expiryTimestamp;
    }

    function getExpiryDate() public view returns (uint256) {
        return expiryTimestamp;
    }

    function getBountyValue() public view returns (uint256) {}

    // If the timeout is reached without the recipient closing the channel, then
    // the ether is released back to the sender.
    function claimTimeout() public {
        require(block.timestamp >= expiryTimestamp);
        selfdestruct(owner);
    }

    function payoutBounty(address payable recipient) public payable {
        require(msg.sender == supervisor);
        console.log("Payout bounty, balance: ");
        console.log(address(this).balance);
        console.log("Recipient: ");
        console.log(recipient);
        emit BountyCompleted(address(this), address(this).balance);
        selfdestruct(recipient);
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {
        console.log("Received some ether");
    }

    // Fallback function is called when msg.data is not empty
    fallback() external payable {
        console.log("Received some ether");
    }
}

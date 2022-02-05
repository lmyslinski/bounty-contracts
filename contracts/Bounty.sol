//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract Bounty {
    uint256 public expiryTimestamp; // Timeout in case no one completes the bounty in time
    string public bountyId; // The secret used to link 1-1 the bounty with a backend entity

    address payable supervisor; // the address which receives the commision and manages payouts
    address payable owner;  // the bounty creator
    address parent;  // address of the parent contract

    event BountyCompleted(address indexed bountyAddress, uint256 balance);
    event DepositReceived(address indexed senderAddress, uint256 amount);
    event BountyTimeoutClaimed();

    constructor(address payable _supervisor, address payable _owner, uint256 _expiryTimestamp, string memory _bountyId) {
        parent = msg.sender; // setting the bounty factory ref
        owner = _owner;
        supervisor = _supervisor;
        expiryTimestamp = _expiryTimestamp;
        bountyId = _bountyId;
    }

    function getExpiryDate() public view returns (uint256) {
        return expiryTimestamp;
    }

    function getBountyValue() public view returns (uint256) {
        return address(this).balance;
    }

    // If the timeout is reached without the recipient closing the channel, then
    // the ether is released back to the sender.
    function claimTimeout() public {
        require(block.timestamp >= expiryTimestamp, "This contract has not expired yet.");
        emit BountyTimeoutClaimed();
        selfdestruct(owner);
    }

    function payoutBounty(address payable recipient) public payable {
        require(msg.sender == supervisor, "Sender not authorized.");
        emit BountyCompleted(address(recipient), address(this).balance);
        selfdestruct(recipient);
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {
        emit DepositReceived(msg.sender, address(this).balance);
    }

    // Fallback function is called when msg.data is not empty
    fallback() external payable {
        
    }
}

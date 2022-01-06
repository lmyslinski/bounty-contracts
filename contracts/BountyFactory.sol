//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./Bounty.sol";

contract BountyFactory {

    address payable supervisor; // the owner is the address that creates the factory and receives the commision

    mapping(address => Bounty) public allBounties;
    // we store a map of contract addresses to bounties
    // so that when we need to finalize a contract, we can just access that contract by its address

    event BountyCreated(Bounty bounty);

    constructor() {
        supervisor = payable(msg.sender);
    }

    function getTotalBounties() public pure returns (uint256) {
        return 0;
    }

    // Should we accept any ERC20 token as bounty value?

    // How to interact with the contract from the backend?

    // Bounty factory needs to receive the funds along with the params in order to

    function createBounty(uint256 _expiryTimestamp) public payable returns (address) {
        address payable bountyOwner = payable(msg.sender);

        Bounty newBounty = new Bounty(supervisor, bountyOwner,_expiryTimestamp);
        address bountyAddress = address(newBounty);
        allBounties[bountyAddress] = newBounty;

        (bool success, bytes memory data) = bountyAddress.call{value: msg.value}("");
        require(success, "Failed to deposit bounty value");

        console.log("Balance after creation:", bountyAddress.balance);
        
        emit BountyCreated(newBounty);
        return bountyAddress;
    }
}

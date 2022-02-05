//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./Bounty.sol";

contract BountyFactory {

    address payable supervisor; // the owner is the address that creates the factory and receives the commision

    // a psuedo-list of all bounties
    mapping(string => address) public allBounties;
    
    event BountyCreated(address bountyAddress);

    constructor(address payable _supervisor) {
        supervisor = _supervisor;
    }

    // Should we accept any ERC20 token as bounty value?
    function createBounty(uint256 _expiryTimestamp, string memory _bountyId) public payable returns (address) {
        address payable bountyOwner = payable(msg.sender);

        Bounty newBounty = new Bounty(supervisor, bountyOwner, _expiryTimestamp, _bountyId);
        address bountyAddress = address(newBounty);

        allBounties[_bountyId] = bountyAddress;

        (bool success, ) = bountyAddress.call{value: msg.value}("");
        require(success, "Failed to deposit bounty value");
        
        emit BountyCreated(bountyAddress);
        return bountyAddress;
    }
}

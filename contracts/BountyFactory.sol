//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "./Bounty.sol";

contract BountyFactory {

    address payable supervisor; // the supervisor is the address that creates the factory and receives the commision

    mapping(string => address) public allBounties;
    
    event BountyCreated(address bountyAddress);

    constructor(address payable _supervisor) {
        supervisor = _supervisor;
    }

    function createBounty(uint256 _expiryTimestamp, string memory _bountyId) public payable returns (address) {
        require(msg.value >= (1 ether/100), "The minimum bounty value is 0.01 ETH.");
        address payable bountyOwner = payable(msg.sender);

        uint comission = (1 ether/200); // 0.005 ETH
        uint bountyValue = msg.value - comission;

        Bounty newBounty = new Bounty(supervisor, bountyOwner, _expiryTimestamp, _bountyId);
        address bountyAddress = address(newBounty);

        allBounties[_bountyId] = bountyAddress;

        (bool depositToSupervisorResult, ) = supervisor.call{value: comission}("");
        require(depositToSupervisorResult, "Failed to transfer bounty reward to recipient");

        (bool depositToBountyResult, ) = bountyAddress.call{value: bountyValue}("");
        require(depositToBountyResult, "Failed to deposit bounty value");
        
        emit BountyCreated(bountyAddress);
        return bountyAddress;
    }
}

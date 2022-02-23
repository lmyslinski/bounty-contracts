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

        uint256 comission = getCommision(msg.value);
        uint256 bountyValue = msg.value - comission;

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

    function getCommision(uint256 bountyValue) private pure returns (uint256) {
        if(bountyValue >=  250000000000000000){
            return (bountyValue*3)/100; // 3% if bounty > 0.25 ETH
        }else{
            return 8000000000000000; // 0.08 ETH if bounty < 0.25 ETH
        }
    }
}

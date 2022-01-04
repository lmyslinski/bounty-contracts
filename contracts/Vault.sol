//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract BountyFactory {
    uint totalBounties;
    uint private balance;
    address payable owner;

    constructor(){
        owner = payable(msg.sender);
    }


    function getTotalBounties() view public returns(uint) {
        return totalBounties;
    }


    // Should we accept any ERC20 token as bounty value?

    // How to interact with the contract from the backend?

    // Bounty factory needs to receive the funds along with the params in order to 

    function createBounty() public payable {
        (bool success,) = owner.call{value: msg.value}("");
        require(success, "Failed to send money");
    }


    // constructor(string memory _greeting) {
    //     console.log("Deploying a Greeter with greeting:", _greeting);
    //     greeting = _greeting;
    // }

    // function greet() public view returns (string memory) {
    //     return greeting;
    // }

    // function setGreeting(string memory _greeting) public {
    //     console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
    //     greeting = _greeting;
    // }
}

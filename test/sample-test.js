const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BountyFactory", function () {
  it("Should deploy a new bounty factory", async function () {
    const BountyFactory = await ethers.getContractFactory("BountyFactory");
    const bountyFactory = await BountyFactory.deploy();
  
    await bountyFactory.deployed();

    expect(await bountyFactory.getTotalBounties()).to.equal(0);

    // const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // // wait until the transaction is mined
    // await setGreetingTx.wait();

    // expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});

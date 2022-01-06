const { expect } = require("chai");
const { ethers} = require("hardhat");


describe("Bounty Factory contract", function () {

  let bountyFactory;
  let provider;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addrs;

  beforeEach(async function () {
    provider = ethers.provider;

    const BountyFactory = await ethers.getContractFactory("BountyFactory");
    [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
    bountyFactory = await BountyFactory.deploy();
  })

  it("Should create a new Bounty and deposit the bounty amount correctly", async function () {
    const timestamp = Date.now();
    const bountyValue = ethers.utils.parseEther("0.00002324")

    // we need to use callStatic since it's impossible to observe event value or get a return back when calling functions offchain
    var newBounty = await bountyFactory.callStatic.createBounty(timestamp, {value: bountyValue})
    const balance = (await provider.getBalance(newBounty))
    expect (balance.eq(bountyValue)).to.equal(true)
  });
});

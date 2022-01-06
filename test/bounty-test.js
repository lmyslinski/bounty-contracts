const { expect } = require("chai");
const { ethers, waffle} = require("hardhat");


describe("Bounty contract", function () {

  let bountyFactory;
  let provider;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addrs;


  beforeEach(async function () {
    provider = waffle.provider;

    const BountyFactory = await ethers.getContractFactory("BountyFactory");
    [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
    bountyFactory = await BountyFactory.deploy();
  })

  it("Should create a new Bounty", async function () {
    const timestamp = Date.now();

    const options = {value: ethers.utils.parseEther("0.00002324")}

    // we need to use callStatic since it's impossible to observe event value or get a return back when calling functions offchain
    var newBounty = await bountyFactory.callStatic.createBounty(timestamp, options)

    const blockNumber = await provider.getBlockNumber();
  
    console.log("Block number:", blockNumber);

    const balance = await provider.getBalance(newBounty);

    console.log("balance: ", balance)

    // expect (balance).to.equal(1.0)
    
    // const bountyFactory = await BountyFactory.deploy();
  

    // expect(await bountyFactory.getTotalBounties()).to.equal(0);

    // const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // // wait until the transaction is mined
    // await setGreetingTx.wait();

    // expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Bounty contract", function () {

    let bounty;
    let provider;
    let supervisor;
    let owner;
    let addr3;
    let addrs;

    beforeEach(async function () {
        provider = ethers.provider;

        const Bounty = await ethers.getContractFactory("Bounty");
        [supervisor, owner, addr3, ...addrs] = await ethers.getSigners();
        bounty = await Bounty.deploy(supervisor.address, owner.address, Date.now());
    })

    it("Should create successfully", async function () {
        
    });

    it("Should receive deposits successfully", async function () {
        const initialBalance = (await provider.getBalance(bounty.address)).toNumber()
        expect(initialBalance).to.equal(0)

        const bountyValue = ethers.utils.parseEther("1.0")
        await supervisor.sendTransaction({
            to: bounty.address,
            value: bountyValue,
        });
        const balance = (await provider.getBalance(bounty.address))
        expect(balance.eq(bountyValue)).to.equal(true)
    })

    it("Should allow the supervisor only to complete the payout", async function () {
        // const timestamp = Date.now();
        // const bountyValue = ethers.utils.parseEther("0.00002324")
        // const options = {value: bountyValue}

        // // we need to use callStatic since it's impossible to observe event value or get a return back when calling functions offchain
        // Bounty newBounty = await bountyFactory.callStatic.createBounty(timestamp, options)
        // newBounty.completeBounty
    })
});

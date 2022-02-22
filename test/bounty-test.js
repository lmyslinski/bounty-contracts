const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Bounty payouts", function () {

    let provider;

    let bounty;
    let supervisor; // the root wallet that's deploying the parent contract and manages the payouts
    let owner;  // the owner of the bounty
    let hunter; // the one completing the bounty

    beforeEach(async function () {
        provider = ethers.provider;
        const secret = "12345"
        const Bounty = await ethers.getContractFactory("Bounty");
        [supervisor, owner, hunter] = await ethers.getSigners();
        bounty = await Bounty.deploy(supervisor.address, owner.address, Date.now(), secret);
    })

    it("Should create successfully", async function () {
        const balance = (await bounty.getBountyValue()).toNumber()
        expect(balance).to.equal(0)
    });

    it("Should receive deposits successfully", async function () {
        const initialBalance = (await provider.getBalance(bounty.address)).toNumber()
        expect(initialBalance).to.equal(0)

        const bountyValue = await depositEther("1.0")
        const balance = (await provider.getBalance(bounty.address))
        expect(balance.eq(bountyValue)).to.equal(true)
    })

    it("Should payout the bounty to the hunter correctly and send the 3% cut to supervisor", async function () {
        const totalBountyValue = await depositEther("0.2")
        const rewardValue = (totalBountyValue.mul(100)).div(103)

        const hunterInitialBalance = (await provider.getBalance(hunter.address))
        const supervisorInitialBalance = (await provider.getBalance(supervisor.address))

        await bounty.payoutBounty(hunter.address)

        const hunterBalance = (await provider.getBalance(hunter.address))
        const bountyBalance = (await provider.getBalance(bounty.address))
        const supervisorBalance = (await provider.getBalance(supervisor.address))

        expect(hunterBalance.eq(hunterInitialBalance.add(rewardValue))).to.equal(true)
        // we're gonna get less than 3% since we still need to pay for eth transfer to hunter
        expect(supervisorBalance >= supervisorInitialBalance).to.equal(true)
        expect(bountyBalance).to.equal(ethers.utils.parseEther("0"))
    })

    it("Should not payout the bounty if the supervisor is not the caller", async function () {
        await depositEther("0.2")

        await expect(bounty.connect(owner).payoutBounty(owner.address)).to.be.revertedWith('Sender not authorized.');
        await expect(bounty.connect(hunter).payoutBounty(hunter.address)).to.be.revertedWith('Sender not authorized.');

        const bountyBalance = (await provider.getBalance(bounty.address))

        expect(bountyBalance).to.equal(ethers.utils.parseEther("0.2"))
    })

    async function depositEther(amount){
        const bountyValue = ethers.utils.parseEther(amount)
        await supervisor.sendTransaction({
            to: bounty.address,
            value: bountyValue,
        });
        return bountyValue;
    }
});

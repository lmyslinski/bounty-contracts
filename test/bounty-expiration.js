const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Bounty expiration", function () {

    let provider;
    let bountyContractFactory;

    let bounty;
    let supervisor; // the root wallet that's deploying the parent contract and manages the payouts
    let owner;  // the owner of the bounty
    let hunter; // the one completing the bounty

    beforeEach(async function () {
        provider = ethers.provider;
        [supervisor, owner, hunter] = await ethers.getSigners();
        bountyContractFactory = await ethers.getContractFactory("Bounty");
    })

    it("Should return the bounty to the owner upon expiration", async function () {
        const pastDate = createPastTimestamp(30)
        const bountySecret = "12345"

        bounty = await bountyContractFactory.deploy(supervisor.address, owner.address, pastDate, bountySecret);
        const bountyValue = ethers.utils.parseEther("4454")

        // verify the initial amount
        const ownerBalance = (await provider.getBalance(owner.address))
        expect(ownerBalance).to.equal(ethers.utils.parseEther("10000"))

        await owner.sendTransaction({
            to: bounty.address,
            value: bountyValue,
        });

        // we can't match the number exactly as the gas cost is gonna be missing
        const afterCreation = (await provider.getBalance(owner.address))
        expect(afterCreation.lt(ethers.utils.parseEther("9000"))).to.equal(true)

        // call the expiration function as any address
        await bounty.connect(hunter).claimTimeout()

        // The owner should have received the funds
        const newBalance = (await provider.getBalance(owner.address))
        expect(newBalance).to.equal(afterCreation.add(bountyValue))
    })

    it("Should not allow withdrawing the bounty before the expiry date", async function () {
        const bountySecret = "12345"
        const futureDate = createFutureTimestamp(30)
        bounty = await bountyContractFactory.deploy(supervisor.address, owner.address, futureDate, bountySecret);
        await expect(bounty.connect(supervisor).claimTimeout()).to.be.revertedWith('This contract has not expired yet.');
    })

    function createFutureTimestamp(plusSeconds) {
        var d = new Date()
        d.setSeconds(d.getSeconds() + plusSeconds);

        // the + converts the date into a timestamp, how can you not love javascript?
        // the /1000 converts into seconds from milis
        return Math.floor(+d / 1000)
    }

    function createPastTimestamp(minusSeconds) {
        var d = new Date()
        d.setSeconds(d.getSeconds() - minusSeconds);
        // the + converts the date into a timestamp, how can you not love javascript?
        // the /1000 converts into seconds from milis
        return Math.floor(+d / 1000)
    }
});

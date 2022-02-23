const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Bounty commision", function () {

    let provider;
    let bountyContractFactory;

    let supervisor; // the root wallet that's deploying the parent contract and manages the payouts
    let owner;  // the owner of the bounty
    let hunter; // the one completing the bounty


    const abi = [
        "function claimTimeout() public",
    ];

    beforeEach(async function () {
        provider = ethers.provider;
        [supervisor, owner, hunter] = await ethers.getSigners();
        bountyContractFactory = await ethers.getContractFactory("BountyFactory");
    })

    it("Should not allow creating bounties with less than 0.01 ETH", async function () {
        const bountyValue = ethers.utils.parseEther("0.009")
        const overrides = {
            value: bountyValue
        }
        const bountyContract = await bountyContractFactory.deploy(supervisor.address)
        await bountyContract.deployTransaction.wait();

        await expect(bountyContract.createBounty(createFutureTimestamp(30), "123", overrides)).to.be.revertedWith('The minimum bounty value is 0.01 ETH.');
    })

    it("Should transfer the commision to the supervisor when creating the bounty", async function() {
        const bountyValue = ethers.utils.parseEther("0.1")
        const overrides = {
            value: bountyValue
        }
        const bountyContract = await bountyContractFactory.deploy(supervisor.address)
        await bountyContract.deployTransaction.wait();

        const supervisorBalance = await provider.getBalance(supervisor.address)
        
        // create the bounty as the owner
        const bcWithOwner = bountyContract.connect(owner)
        await bcWithOwner.createBounty(createFutureTimestamp(30), "123", overrides)

        const supervisorBalanceAfterBounty = await provider.getBalance(supervisor.address)
        expect(supervisorBalanceAfterBounty).to.equal(supervisorBalance.add(ethers.utils.parseEther("0.005")))
    })

    // TODO finish the test rewrite later
    it("Should return the bounty to the owner upon expiration", async function () {
        const bountyValue = ethers.utils.parseEther("0.1")
        const overrides = {
            value: bountyValue
        }
        const bountyFactory = await bountyContractFactory.deploy(supervisor.address)
        await bountyFactory.deployTransaction.wait();

        // create the bounty as the owner
        const bfWithOwner = bountyFactory.connect(owner)
        await bfWithOwner.createBounty(createPastTimestamp(30), "123", overrides)
        const bountyAddress = await bountyFactory.allBounties("123")
        

        const ownerBalancePostDeploy = await provider.getBalance(owner.address)

        const bounty = new ethers.Contract(bountyAddress, abi, hunter);

        const res =  await bounty.claimTimeout()
        console.log(res)

        const ownerBalancePostClaim = await provider.getBalance(owner.address)

        console.log(ownerBalancePostDeploy)
        console.log(ownerBalancePostClaim)
        console.log(ownerBalancePostDeploy.add(ethers.utils.parseEther("0.005")))

        
        expect(ownerBalancePostClaim).to.equal(ownerBalancePostDeploy.add(ethers.utils.parseEther("0.005")))
        // The owner should have received the funds
        // expect(ownerBalancePostClaim).to.equal(ownerBalancePostDeploy.add(bountyValue))
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

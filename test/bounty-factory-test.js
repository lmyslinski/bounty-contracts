const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Bounty factory contract", function () {

    let provider;
    let bountyContractFactory;

    let supervisor; // the root wallet that's deploying the parent contract and manages the payouts
    let owner;  // the owner of the bounty
    let hunter; // the one completing the bounty

    const abi = [
        "function claimTimeout() public",
        "function payoutBounty(address payable recipient) public payable"
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

    it("Should take 0.008 flat commision below for bounties below 0.25 ETH", async function() {
        const bountyContract = await bountyContractFactory.deploy(supervisor.address)
        await bountyContract.deployTransaction.wait();
        const bcWithOwner = bountyContract.connect(owner)

        const supervisorBalance = await provider.getBalance(supervisor.address)
        await bcWithOwner.createBounty(createFutureTimestamp(30), "123", {
            value: ethers.utils.parseEther("0.2")
        })
        const supervisorBalanceAfterBounty = await provider.getBalance(supervisor.address)
        expect(supervisorBalanceAfterBounty).to.equal(supervisorBalance.add(ethers.utils.parseEther("0.008")))
    })


    it("Should take 3% commision for bounties over 0.25 ETH", async function() {
        const bountyContract = await bountyContractFactory.deploy(supervisor.address)
        await bountyContract.deployTransaction.wait();
        const bcWithOwner = bountyContract.connect(owner)

        const supervisorBalance2 = await provider.getBalance(supervisor.address)
        await bcWithOwner.createBounty(createFutureTimestamp(30), "1234", {
            value: ethers.utils.parseEther("1.33")
        })
        const accurateCommision = (ethers.utils.parseEther("1.33")).div(100).mul(3)
        const supervisorBalanceAfterBounty2 = await provider.getBalance(supervisor.address)
        expect(supervisorBalanceAfterBounty2).to.equal(supervisorBalance2.add(accurateCommision))
    })
    
    it("Should take 3% commision for really big bounties too", async function() {
        const bountyContract = await bountyContractFactory.deploy(supervisor.address)
        await bountyContract.deployTransaction.wait();
        const bcWithOwner = bountyContract.connect(owner)

        // check really big value just for sanity
        const supervisorBalance3 = await provider.getBalance(supervisor.address)
        await bcWithOwner.createBounty(createFutureTimestamp(30), "1234", {
            value: ethers.utils.parseEther("432.34332")
        })
        const accurateCommision2 = (ethers.utils.parseEther("432.34332")).div(100).mul(3)
        const supervisorBalanceAfterBounty3 = await provider.getBalance(supervisor.address)
        expect(supervisorBalanceAfterBounty3).to.equal(supervisorBalance3.add(accurateCommision2))
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
        expect(supervisorBalanceAfterBounty).to.equal(supervisorBalance.add(ethers.utils.parseEther("0.008")))
    })

    it("Should transfer the entire reward to the hunter", async function() {
        const bountyValue = ethers.utils.parseEther("0.1")
        const reward = bountyValue.sub(ethers.utils.parseEther("0.008"))
        const overrides = {
            value: bountyValue
        }
        const bountyContract = await bountyContractFactory.deploy(supervisor.address)
        await bountyContract.deployTransaction.wait();
        
        // create the bounty as the owner
        const bcWithOwner = bountyContract.connect(owner)
        await bcWithOwner.createBounty(createFutureTimestamp(30), "123", overrides)
        const bountyAddress = await bountyContract.allBounties("123")

        const hunterBalanceBefore = await provider.getBalance(hunter.address)

        // payout the bounty to the hunter, called by the supervisor
        const bounty = new ethers.Contract(bountyAddress, abi, supervisor);
        await bounty.payoutBounty(hunter.address)

        const hunterBalanceAfter = await provider.getBalance(hunter.address)
        expect(hunterBalanceAfter).to.equal(hunterBalanceBefore.add(reward))

    })

    it("Should allow only the supervisor to complete the bounty", async function(){
        const bountyValue = ethers.utils.parseEther("0.1")
        const overrides = {
            value: bountyValue
        }
        const bountyFactory = await bountyContractFactory.deploy(supervisor.address)
        await bountyFactory.deployTransaction.wait();

        // create the bounty as the owner
        const bfWithOwner = bountyFactory.connect(owner)
        await bfWithOwner.createBounty(createFutureTimestamp(30), "123", overrides)
        const bountyAddress = await bountyFactory.allBounties("123")

        // claim timeout as the hunter on the contract
        const bounty = new ethers.Contract(bountyAddress, abi, hunter);
        
        await expect(bounty.payoutBounty(hunter.address)).to.be.revertedWith('Sender not authorized.');
    })

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

        // claim timeout as the hunter on the contract
        const bounty = new ethers.Contract(bountyAddress, abi, hunter);
        await bounty.claimTimeout()
        const ownerBalancePostClaim = await provider.getBalance(owner.address)

        // make sure that we get the value back on the owner minus the commision
        const returnedValue = bountyValue.sub(ethers.utils.parseEther("0.008"))
        expect(ownerBalancePostClaim).to.equal(ownerBalancePostDeploy.add(returnedValue))
    })

    it("Should not allow withdrawing the bounty before the expiry date", async function () {
        const bountyValue = ethers.utils.parseEther("0.1")
        const overrides = {
            value: bountyValue
        }
        const bountyFactory = await bountyContractFactory.deploy(supervisor.address)
        await bountyFactory.deployTransaction.wait();

        // create the bounty as the owner
        const bfWithOwner = bountyFactory.connect(owner)
        await bfWithOwner.createBounty(createFutureTimestamp(30), "123", overrides)
        const bountyAddress = await bountyFactory.allBounties("123")

        // claim timeout as the hunter on the contract
        const bounty = new ethers.Contract(bountyAddress, abi, hunter);  
        await expect(bounty.claimTimeout()).to.be.revertedWith('This contract has not expired yet.');
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

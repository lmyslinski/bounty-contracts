// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const supervisorAddress = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
  // We get the contract to deploy
  const BountyFactory = await hre.ethers.getContractFactory("BountyFactory");
  const bountyFactory = await BountyFactory.deploy(supervisorAddress);

  await bountyFactory.deployed();

  console.log("Bounty Factory deployed to:", bountyFactory.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

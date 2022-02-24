#!/bin/bash
npx hardhat export-abi
web3j generate solidity -a abi/contracts/BountyFactory.sol/BountyFactory.json -p io.prhunter.api.contract.abi -o ../api/src/main/kotlin/
web3j generate solidity -a abi/contracts/Bounty.sol/Bounty.json -p io.prhunter.api.contract.abi -o ../api/src/main/kotlin/
cp src/artifacts/contracts/BountyFactory.sol/BountyFactory.json  ../web/src/contract/
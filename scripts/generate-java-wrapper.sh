#!/bin/bash
npx hardhat export-abi
web3j generate solidity -a abi/contracts/BountyFactory.sol/BountyFactory.json -p io.prhunter.api.contract -o ../api/src/main/kotlin/
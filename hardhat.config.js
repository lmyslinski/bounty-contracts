require("@nomiclabs/hardhat-waffle");
require('hardhat-abi-exporter');

const supervisorPkey = process.env.SUPERVISOR_PKEY;
if (!supervisorPkey) {
  throw new Error("Please set your SUPERVISOR_PKEY in a .env file");
}

const infuraProjectKey = "373543e00dc9456b98aec7048949799c";
const infuraApiKey = process.env.INFURA_API_KEY;

if (!infuraApiKey) {
  throw new Error("Please set your INFURA_API_KEY in a .env file");
}

module.exports = {
  solidity: "0.8.4",
  paths: {
    artifacts: './src/artifacts',
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${infuraProjectKey}`,
      accounts: [supervisorPkey]
    }
  }
};

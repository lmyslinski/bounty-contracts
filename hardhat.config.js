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
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000,
    },
  },
  paths: {
    artifacts: './src/artifacts',
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    ethMainNet: {
      url: `https://mainnet.infura.io/v3/${infuraProjectKey}`,
      accounts: [supervisorPkey]
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${infuraProjectKey}`,
      accounts: [supervisorPkey]
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${infuraProjectKey}`,
      accounts: [supervisorPkey]
    },
    bscTestNet: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
      accounts: [supervisorPkey]
    },
    bscMainNet: {
      url: `https://bsc-dataseed.binance.org/`,
      accounts: [supervisorPkey]
    }
  }
};

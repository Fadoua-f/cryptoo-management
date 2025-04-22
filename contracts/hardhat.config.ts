import "@nomicfoundation/hardhat-toolbox";
import "hardhat-ethernal";

import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      chainId: 31337
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    }
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./"
  },
  ethernal: {
    apiToken: process.env.ETHERNAL_API_TOKEN,
    disableSync: false,
    workspace: "test",
    uploadAst: true,
    disabled: false
  }
};

export default config; 
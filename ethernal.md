# Ethernal Setup Guide

## Installation

1. Install the Hardhat plugin:
```bash
npm install hardhat-ethernal --save-dev
```

2. Install the Ethernal CLI globally:
```bash
sudo npm install -g ethernal
```

## Configuration

1. Update your `hardhat.config.ts` to include Ethernal:
```typescript
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
```

## MetaMask Setup

1. Open MetaMask
2. Click on the network dropdown (usually shows "Ethereum Mainnet")
3. Click "Add Network"
4. Fill in these details:
   - Network Name: `Hardhat Local`
   - New RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`
   - Block Explorer URL: (leave empty)
5. Click "Save"

## Import Test Accounts

You can import any of these test accounts into MetaMask using their private keys:

Account #0: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

Account #1: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

Each account comes with 10,000 ETH for testing.

## Starting the Node

1. Start the Hardhat node with Ethernal API token: (Click on Browser Sync button in Ethernal UI to get the api tokens)
```bash
ETHERNAL_API_TOKEN=your_api_token npx hardhat node
```

2. In a separate terminal, start the Ethernal listener:
```bash
ETHERNAL_API_TOKEN=your_api_token ethernal listen --network http://127.0.0.1:8545
```

## Using Ethernal UI

1. Go to Ethernal in your browser
2. Create a new workspace with these settings:
   - Network Name: `Localhost`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`
   - Block Explorer URL: (leave empty)

3. Connect MetaMask:
   - Click "Connect Wallet" in Ethernal
   - Select "MetaMask"
   - Approve the connection request in MetaMask

## Making Transactions

1. In Ethernal UI:
   - Click on "Accounts" in the left sidebar
   - Select your account
   - Use the "Send" or "Transfer" button to make transactions
   - Enter recipient address and amount
   - Confirm the transaction in MetaMask

## Troubleshooting

1. If browser sync is stuck:
   - Make sure the Hardhat node is running
   - Verify the Ethernal plugin is properly configured
   - Check that the API token is correct

2. If MetaMask can't connect:
   - Verify the network settings in MetaMask
   - Make sure you're on the Hardhat Local network
   - Check that the Chain ID matches (31337)

3. If transactions aren't showing up:
   - Ensure the Ethernal listener is running
   - Check that you're using the correct workspace
   - Verify the RPC URL is correct
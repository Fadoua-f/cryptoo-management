# Crypto Management System

A comprehensive cryptocurrency management system built with React, Node.js, and blockchain integration using Hardhat and Web3.js.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/downloads)
- [Visual Studio Code](https://code.visualstudio.com/) (recommended)
- [MySQL](https://dev.mysql.com/downloads/installer/) (v8.0 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Fadoua-f/cryptoo-management.git
cd cryptoo-management
```

2. Install backend dependencies:
```bash
cd project/backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../../
cd project
npm install
```

4. Install blockchain development dependencies:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install ethers@^5.7.2 web3@^4.16.0
```

## Environment Setup

1. Create a `.env` file in the `project/backend` directory with the following variables:
```env
PORT=5000
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=crypto_management
JWT_SECRET=your_jwt_secret
ALCHEMY_API_KEY=your_alchemy_api_key
```

2. Create a `.env` file in the `project` directory (frontend) with:
```env
VITE_API_URL=http://localhost:5000
VITE_ALCHEMY_API_KEY=your_alchemy_api_key
```

## Blockchain Development Setup

1. Create a Hardhat configuration file (`hardhat.config.js`):
```javascript
require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {},
  }
};
```

2. Initialize Hardhat:
```bash
npx hardhat init
```

3. Create your smart contracts in the `contracts/` directory

4. Compile contracts:
```bash
npx hardhat compile
```

5. Run tests:
```bash
npx hardhat test
```

## Database Setup

1. Open MySQL command line client or MySQL Workbench
2. Create the database:
```sql
CREATE DATABASE crypto_management;
```
3. The schema will be automatically created when you start the backend server

## Running the Application

### Starting the Hardhat Node

Before using the application, you need to start the Hardhat local node:

1. Use the provided script (recommended):
```bash
./start-hardhat.sh
```

2. Or manually start the node:
```bash
npx hardhat node
```

Keep the terminal window open while using the application. The Hardhat node provides a local Ethereum network for development and testing.

### Starting the Backend

```bash
cd project/backend
npm start
```

### Starting the Frontend

```bash
cd project
npm run dev
```

## Using the Application

1. Register a new account or log in with existing credentials
2. Navigate to the "Créer un portefeuille" page
3. Select the cryptocurrency type (ETH, BTC, USDT)
4. Click "Créer un portefeuille" to create a new wallet on the Hardhat network
5. The wallet will be created and added to your account
6. You can now view your wallet balance and make transactions

## Troubleshooting

### Hardhat Connection Issues

If you see an error message saying "Hardhat n'est pas connecté" (Hardhat is not connected):

1. Make sure the Hardhat node is running in a separate terminal
2. Check that the node is running on the default port (8545)
3. Refresh the application page

### Wallet Creation Issues

If you encounter issues creating a wallet:

1. Ensure you're logged in to the application
2. Verify that the Hardhat node is running
3. Check the browser console for error messages
4. Try refreshing the page and attempting again

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
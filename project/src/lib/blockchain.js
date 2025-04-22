import Web3 from 'web3';
import { ethers } from 'ethers';

class BlockchainService {
  constructor() {
    console.log('[BlockchainService] Initializing service...');
    this.web3 = null;
    this.provider = null;
    this.isConnected = false;
    this.initialize();
  }

  initialize() {
    try {
      // Initialize Web3 with local Hardhat network
      const localUrl = 'http://127.0.0.1:8545';
      console.log('[BlockchainService] Connecting to local network at:', localUrl);
      
      this.web3 = new Web3(localUrl);
      this.provider = new ethers.providers.JsonRpcProvider(localUrl);
      
      // Test the connection
      this.checkConnection();
    } catch (error) {
      console.error('[BlockchainService] Failed to initialize:', error);
      console.error('[BlockchainService] Error details:', {
        message: error.message,
        stack: error.stack
      });
      this.isConnected = false;
    }
  }

  async checkConnection() {
    try {
      // Test the connection
      const block = await this.web3.eth.getBlockNumber();
      console.log('[BlockchainService] Successfully connected to network');
      console.log('[BlockchainService] Current block number:', block);
      this.isConnected = true;
      return true;
    } catch (err) {
      console.error('[BlockchainService] Failed to connect to network:', err);
      console.error('[BlockchainService] Error details:', {
        message: err.message,
        code: err.code,
        data: err.data
      });
      this.isConnected = false;
      return false;
    }
  }

  async createWallet() {
    console.log('[BlockchainService] Creating new wallet...');
    try {
      // Check if we're connected to Hardhat
      if (!this.isConnected) {
        const connected = await this.checkConnection();
        if (!connected) {
          throw new Error('Cannot connect to Hardhat network. Please make sure Hardhat is running with "npx hardhat node"');
        }
      }

      if (!this.web3) {
        console.error('[BlockchainService] Web3 not initialized');
        throw new Error('Blockchain service not initialized');
      }

      const account = this.web3.eth.accounts.create();
      console.log('[BlockchainService] Wallet created successfully:', {
        address: account.address,
        hasPrivateKey: !!account.privateKey
      });

      // Get initial balance
      const balance = await this.getBalance(account.address);
      console.log('[BlockchainService] New wallet balance:', balance, 'ETH');

      return {
        address: account.address,
        privateKey: account.privateKey,
      };
    } catch (error) {
      console.error('[BlockchainService] Error creating wallet:', error);
      console.error('[BlockchainService] Error details:', {
        message: error.message,
        stack: error.stack
      });
      throw new Error(`Failed to create wallet: ${error.message}`);
    }
  }

  async importWallet(privateKey) {
    try {
      if (!privateKey) {
        throw new Error('Private key is required');
      }

      // Ensure the private key has the 0x prefix
      const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
      
      // Validate private key format
      if (!/^0x[0-9a-fA-F]{64}$/.test(formattedKey)) {
        throw new Error('Invalid private key format. Must be a 64-character hex string with 0x prefix.');
      }

      const account = this.web3.eth.accounts.privateKeyToAccount(formattedKey);
      
      // Get initial balance
      const balance = await this.getBalance(account.address);
      console.log('Imported wallet balance:', balance, 'ETH');
      
      return {
        address: account.address,
        privateKey: account.privateKey,
      };
    } catch (error) {
      console.error('Error importing wallet:', error);
      if (error.message.includes('private key')) {
        throw error; // Pass through our custom validation errors
      }
      throw new Error('Failed to import wallet. Please check your private key and try again.');
    }
  }

  async getBalance(address) {
    try {
      console.log('Fetching balance for address:', address);
      
      // Try with Web3 first
      const balanceWei = await this.web3.eth.getBalance(address);
      const balanceEth = this.web3.utils.fromWei(balanceWei, 'ether');
      console.log('Balance from Web3:', balanceEth, 'ETH');
      
      // Double check with ethers.js
      const balanceEthers = await this.provider.getBalance(address);
      const balanceEthersEth = ethers.utils.formatEther(balanceEthers);
      console.log('Balance from Ethers:', balanceEthersEth, 'ETH');
      
      return balanceEth;
    } catch (error) {
      console.error('Error getting balance:', error);
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  async sendTransaction(fromAddress, toAddress, amount, privateKey) {
    try {
      const transaction = {
        from: fromAddress,
        to: toAddress,
        value: this.web3.utils.toWei(amount.toString(), 'ether'),
      };

      const signedTx = await this.web3.eth.accounts.signTransaction(transaction, privateKey);
      const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      
      return receipt;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw new Error('Failed to send transaction');
    }
  }
}

export default new BlockchainService(); 
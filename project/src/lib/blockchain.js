import Web3 from 'web3';
import { ethers } from 'ethers';

class BlockchainService {
  constructor() {
    this.web3 = null;
    this.provider = null;
    this.initialize();
  }

  initialize() {
    // Initialize Web3 with local Hardhat network
    const localUrl = 'http://127.0.0.1:8545';
    
    this.web3 = new Web3(localUrl);
    this.provider = new ethers.providers.JsonRpcProvider(localUrl);
  }

  async createWallet() {
    try {
      const account = this.web3.eth.accounts.create();
      return {
        address: account.address,
        privateKey: account.privateKey,
      };
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new Error('Failed to create wallet');
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
      const balance = await this.web3.eth.getBalance(address);
      return this.web3.utils.fromWei(balance, 'ether');
    } catch (error) {
      console.error('Error getting balance:', error);
      throw new Error('Failed to get balance');
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

export const blockchainService = new BlockchainService(); 
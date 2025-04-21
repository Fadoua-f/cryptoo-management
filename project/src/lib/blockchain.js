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
      const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
      return {
        address: account.address,
        privateKey: account.privateKey,
      };
    } catch (error) {
      console.error('Error importing wallet:', error);
      throw new Error('Invalid private key');
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
import { ethers } from 'ethers';

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.initialize();
  }

  initialize() {
    // Initialize provider with Hardhat's local network
    this.provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  }

  async createWallet() {
    try {
      // Create a new wallet using ethers
      const wallet = ethers.Wallet.createRandom();
      // Connect the wallet to our provider
      const connectedWallet = wallet.connect(this.provider);
      return {
        address: connectedWallet.address,
        privateKey: connectedWallet.privateKey,
      };
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new Error('Failed to create wallet');
    }
  }

  async importWallet(privateKey) {
    try {
      const wallet = new ethers.Wallet(privateKey, this.provider);
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
      };
    } catch (error) {
      console.error('Error importing wallet:', error);
      throw new Error('Invalid private key');
    }
  }

  async getBalance(address) {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw new Error('Failed to get balance');
    }
  }

  async sendTransaction(fromPrivateKey, toAddress, amount) {
    try {
      const wallet = new ethers.Wallet(fromPrivateKey, this.provider);
      const tx = {
        to: toAddress,
        value: ethers.parseEther(amount.toString()),
      };
      
      const transaction = await wallet.sendTransaction(tx);
      return await transaction.wait();
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw new Error('Failed to send transaction');
    }
  }

  // Add method to get some test ETH (only works on Hardhat network)
  async getTestEther(address) {
    try {
      // Get a signer with test ETH (first account in Hardhat's default accounts)
      const [signer] = await this.provider.getSigner();
      
      // Send 1 ETH to the specified address
      const tx = {
        to: address,
        value: ethers.parseEther("1.0")
      };
      
      const transaction = await signer.sendTransaction(tx);
      await transaction.wait();
      
      return true;
    } catch (error) {
      console.error('Error getting test ETH:', error);
      throw new Error('Failed to get test ETH');
    }
  }
}

export const blockchainService = new BlockchainService(); 
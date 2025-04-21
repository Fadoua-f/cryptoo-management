import { ethers } from 'ethers';

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.initialize();
  }

  initialize() {
    // Initialize provider with Alchemy
    const alchemyKey = process.env.VITE_ALCHEMY_API_KEY;
    const alchemyUrl = `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`;
    
    this.provider = new ethers.providers.JsonRpcProvider(alchemyUrl);
  }

  async createWallet() {
    try {
      // Create a new wallet using ethers
      const wallet = ethers.Wallet.createRandom();
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
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
      return ethers.utils.formatEther(balance);
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
        value: ethers.utils.parseEther(amount.toString()),
      };
      
      const transaction = await wallet.sendTransaction(tx);
      return await transaction.wait();
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw new Error('Failed to send transaction');
    }
  }
}

export const blockchainService = new BlockchainService(); 
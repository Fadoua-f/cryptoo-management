import { ethers } from 'ethers';

// Initialize provider for local Hardhat network
const getProvider = () => {
  return new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
};

// Get signer from private key (using the first account from Hardhat)
const getSigner = async () => {
  const provider = getProvider();
  // Hardhat's first account private key
  const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  return new ethers.Wallet(privateKey, provider);
};

export const sendETH = async (toAddress: string, amount: string) => {
  try {
    const signer = await getSigner();
    
    // Convert amount to Wei
    const amountInWei = ethers.utils.parseEther(amount);
    
    // Create transaction
    const transaction = {
      to: toAddress,
      value: amountInWei,
    };
    
    // Send transaction
    const tx = await signer.sendTransaction(transaction);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    return {
      success: true,
      hash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error('Error sending ETH:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to send ETH');
  }
};

export const getBalance = async (address: string) => {
  try {
    const provider = getProvider();
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to get balance');
  }
}; 
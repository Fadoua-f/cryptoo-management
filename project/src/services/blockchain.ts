import { ethers } from 'ethers';

// Initialize provider for local Hardhat network
const getProvider = () => {
  console.log('[BlockchainService] Initializing provider for local Hardhat network');
  return new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
};

// Get signer from private key (using the first account from Hardhat)
const getSigner = async () => {
  console.log('[BlockchainService] Getting signer from private key');
  const provider = getProvider();
  // Hardhat's first account private key
  const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  const signer = new ethers.Wallet(privateKey, provider);
  const address = await signer.getAddress();
  console.log('[BlockchainService] Signer address:', address);
  return signer;
};

export const sendETH = async (toAddress: string, amount: string) => {
  console.log('[BlockchainService] Sending ETH transaction:', {
    toAddress,
    amount,
    timestamp: new Date().toISOString()
  });
  
  try {
    const signer = await getSigner();
    const fromAddress = await signer.getAddress();
    console.log('[BlockchainService] Transaction details:', {
      fromAddress,
      toAddress,
      amount
    });
    
    // Convert amount to Wei
    const amountInWei = ethers.utils.parseEther(amount);
    console.log('[BlockchainService] Amount in Wei:', amountInWei.toString());
    
    // Create transaction
    const transaction = {
      to: toAddress,
      value: amountInWei,
    };
    
    console.log('[BlockchainService] Sending transaction to network...');
    // Send transaction
    const tx = await signer.sendTransaction(transaction);
    console.log('[BlockchainService] Transaction sent, hash:', tx.hash);
    
    console.log('[BlockchainService] Waiting for transaction to be mined...');
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log('[BlockchainService] Transaction mined:', {
      hash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status === 1 ? 'success' : 'failed'
    });
    
    return {
      success: true,
      hash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error('[BlockchainService] Error sending ETH:', error);
    console.error('[BlockchainService] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(error instanceof Error ? error.message : 'Failed to send ETH');
  }
};

export const getBalance = async (address: string) => {
  console.log('[BlockchainService] Getting balance for address:', address);
  try {
    const provider = getProvider();
    const balance = await provider.getBalance(address);
    const formattedBalance = ethers.utils.formatEther(balance);
    console.log('[BlockchainService] Balance for', address, ':', formattedBalance, 'ETH');
    return formattedBalance;
  } catch (error) {
    console.error('[BlockchainService] Error getting balance:', error);
    console.error('[BlockchainService] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(error instanceof Error ? error.message : 'Failed to get balance');
  }
}; 
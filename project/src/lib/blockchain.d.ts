import Web3 from 'web3';
import { ethers } from 'ethers';

declare class BlockchainService {
  web3: Web3;
  provider: ethers.providers.JsonRpcProvider;
  
  constructor();
  initialize(): void;
  
  createWallet(): Promise<{
    address: string;
    privateKey: string;
  }>;
  
  importWallet(privateKey: string): Promise<{
    address: string;
    privateKey: string;
  }>;
  
  getBalance(address: string): Promise<string>;
  
  sendTransaction(
    fromAddress: string,
    toAddress: string,
    amount: number,
    privateKey: string
  ): Promise<any>;
}

declare const blockchainService: BlockchainService;
export { blockchainService }; 
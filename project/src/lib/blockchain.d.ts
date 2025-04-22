import { ethers } from 'ethers';
import Web3 from 'web3';

declare class BlockchainService {
  web3: Web3;
  provider: ethers.providers.JsonRpcProvider;
  isConnected: boolean;

  constructor();
  initialize(): void;
  checkConnection(): Promise<boolean>;
  createWallet(): Promise<{ address: string; privateKey: string }>;
  importWallet(privateKey: string): Promise<{ address: string; privateKey: string }>;
  getBalance(address: string): Promise<string>;
  sendTransaction(fromAddress: string, toAddress: string, amount: string, privateKey: string): Promise<any>;
}

declare const blockchainService: BlockchainService;
export default blockchainService; 
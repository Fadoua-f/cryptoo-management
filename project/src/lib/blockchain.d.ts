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

declare module '../lib/blockchain' {
    export interface WalletCreationResult {
        address: string;
        privateKey: string;
    }

    export const blockchainService: {
        createWallet: () => Promise<WalletCreationResult>;
        getBalance: (address: string) => Promise<string>;
        sendETH: (toAddress: string, amount: string) => Promise<any>;
    };
} 
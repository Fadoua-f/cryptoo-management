import React, { createContext, useContext, useEffect, useState } from 'react';
import { Web3ReactProvider, useWeb3React } from '@web3-react/core';

import { InjectedConnector } from '@web3-react/injected-connector';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum: any;
  }
}

// Initialize the injected connector
const injected = new InjectedConnector({
  supportedChainIds: [31337], // Hardhat local network
});

// Function to get the provider
function getLibrary(provider: any) {
  return new ethers.providers.Web3Provider(provider);
}

interface Web3ContextType {
  account: string | null;
  balance: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  contract: ethers.Contract | null;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  balance: '0',
  connect: async () => {},
  disconnect: () => {},
  isConnected: false,
  contract: null,
});

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ContextProvider>{children}</Web3ContextProvider>
    </Web3ReactProvider>
  );
};

const Web3ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { account, activate, deactivate } = useWeb3React();
  const [balance, setBalance] = useState('0');
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const connect = async () => {
    try {
      await activate(injected);
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    }
  };

  const disconnect = () => {
    deactivate();
  };

  useEffect(() => {
    if (account) {
      const contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
      const contractABI = [
        "function deposit() public payable",
        "function withdraw(uint256 amount) public",
        "function getBalance() public view returns (uint256)"
      ];

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const walletContract = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(walletContract);

      provider.getBalance(account).then((balance) => {
        setBalance(ethers.utils.formatEther(balance));
      });
    }
  }, [account]);

  return (
    <Web3Context.Provider
      value={{
        account: account || null,
        balance,
        connect,
        disconnect,
        isConnected: !!account,
        contract,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context); 
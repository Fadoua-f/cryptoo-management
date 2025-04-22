import { Activity, BarChart2, Clock, Hash, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { ethers } from 'ethers';

interface NetworkStats {
  blockNumber: number;
  gasPrice: string;
  networkName: string;
  peerCount: number;
}

interface TransactionStats {
  totalTransactions: number;
  pendingTransactions: number;
  averageGasUsed: string;
  lastBlockTime: string;
}

interface WalletStats {
  totalWallets: number;
  totalBalance: string;
  averageBalance: string;
  richestWallet: {
    address: string;
    balance: string;
  };
}

const NetworkAnalysis: React.FC = () => {
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    blockNumber: 0,
    gasPrice: '0',
    networkName: 'Hardhat',
    peerCount: 0,
  });
  
  const [transactionStats, setTransactionStats] = useState<TransactionStats>({
    totalTransactions: 0,
    pendingTransactions: 0,
    averageGasUsed: '0',
    lastBlockTime: new Date().toISOString(),
  });
  
  const [walletStats, setWalletStats] = useState<WalletStats>({
    totalWallets: 0,
    totalBalance: '0',
    averageBalance: '0',
    richestWallet: {
      address: '',
      balance: '0',
    },
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    
    const fetchNetworkStats = async () => {
      try {
        const [blockNumber, gasPrice, network] = await Promise.all([
          provider.getBlockNumber(),
          provider.getGasPrice(),
          provider.getNetwork(),
        ]);
        
        setNetworkStats({
          blockNumber,
          gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
          networkName: network.name,
          peerCount: 1, // Hardhat is a single node
        });
      } catch (err) {
        console.error('Error fetching network stats:', err);
        setError('Failed to fetch network statistics');
      }
    };
    
    const fetchTransactionStats = async () => {
      try {
        const latestBlock = await provider.getBlock('latest');
        if (!latestBlock) return;
        
        const blockTime = new Date(latestBlock.timestamp * 1000);
        
        setTransactionStats(prev => ({
          ...prev,
          totalTransactions: latestBlock.transactions.length,
          lastBlockTime: blockTime.toISOString(),
        }));
      } catch (err) {
        console.error('Error fetching transaction stats:', err);
      }
    };
    
    const fetchWalletStats = async () => {
      try {
        // Get all accounts from Hardhat
        const accounts = await provider.listAccounts();
        
        // Get balances for all accounts
        const balances = await Promise.all(
          accounts.map(async (address) => {
            const balance = await provider.getBalance(address);
            return {
              address,
              balance: ethers.utils.formatEther(balance),
            };
          })
        );
        
        // Calculate total and average balance
        const totalBalance = balances.reduce(
          (sum, { balance }) => sum + parseFloat(balance),
          0
        );
        
        const richestWallet = balances.reduce(
          (max, current) =>
            parseFloat(current.balance) > parseFloat(max.balance) ? current : max,
          { address: '', balance: '0' }
        );
        
        setWalletStats({
          totalWallets: accounts.length,
          totalBalance: totalBalance.toFixed(4),
          averageBalance: (totalBalance / accounts.length).toFixed(4),
          richestWallet,
        });
      } catch (err) {
        console.error('Error fetching wallet stats:', err);
      }
    };
    
    const updateStats = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchNetworkStats(),
        fetchTransactionStats(),
        fetchWalletStats(),
      ]);
      setIsLoading(false);
    };
    
    // Initial fetch
    updateStats();
    
    // Set up polling
    const interval = setInterval(updateStats, 5000);
    
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-error-50 text-error-700 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Network Analysis</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Network Stats */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <Hash className="mr-2" />
              Network Statistics
            </h3>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-600">Network:</span>
                <span className="font-medium">{networkStats.networkName}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Block Number:</span>
                <span className="font-medium">{networkStats.blockNumber}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Gas Price:</span>
                <span className="font-medium">{networkStats.gasPrice} Gwei</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Peers:</span>
                <span className="font-medium">{networkStats.peerCount}</span>
              </p>
            </div>
          </div>
          
          {/* Transaction Stats */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <Activity className="mr-2" />
              Transaction Statistics
            </h3>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-600">Total Transactions:</span>
                <span className="font-medium">{transactionStats.totalTransactions}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Pending Transactions:</span>
                <span className="font-medium">{transactionStats.pendingTransactions}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Average Gas Used:</span>
                <span className="font-medium">{transactionStats.averageGasUsed}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Last Block Time:</span>
                <span className="font-medium">
                  {new Date(transactionStats.lastBlockTime).toLocaleTimeString()}
                </span>
              </p>
            </div>
          </div>
          
          {/* Wallet Stats */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <Wallet className="mr-2" />
              Wallet Statistics
            </h3>
            <div className="space-y-2">
              <p className="flex justify-between">
                <span className="text-gray-600">Total Wallets:</span>
                <span className="font-medium">{walletStats.totalWallets}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Total Balance:</span>
                <span className="font-medium">{walletStats.totalBalance} ETH</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Average Balance:</span>
                <span className="font-medium">{walletStats.averageBalance} ETH</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Richest Wallet:</span>
                <span className="font-medium">{walletStats.richestWallet.balance} ETH</span>
              </p>
              <p className="text-sm text-gray-500 break-all">
                {walletStats.richestWallet.address}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkAnalysis; 
import React from 'react';
import { useTransaction } from '../../context/TransactionContext';
import { useWallet } from '../../context/WalletContext';

const TransactionDebug: React.FC = () => {
  const { transactions, isLoading, error } = useTransaction();
  const { activeWallet } = useWallet();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Transaction Debug</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-medium">Active Wallet</h3>
        <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto">
          {activeWallet ? JSON.stringify(activeWallet, null, 2) : 'No active wallet'}
        </pre>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-medium">Loading State</h3>
        <p>{isLoading ? 'Loading...' : 'Not loading'}</p>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-medium">Error</h3>
        <p>{error || 'No error'}</p>
      </div>
      
      <div>
        <h3 className="text-lg font-medium">Transactions ({transactions?.length || 0})</h3>
        <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-96">
          {transactions && transactions.length > 0 
            ? JSON.stringify(transactions, null, 2) 
            : 'No transactions'}
        </pre>
      </div>
    </div>
  );
};

export default TransactionDebug; 
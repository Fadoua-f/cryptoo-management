import React, { useState } from 'react';

import { TransactionType } from '../types/transaction';
import { useTransaction } from '../context/TransactionContext';
import { useWallet } from '../context/WalletContext';

const TransactionTest: React.FC = () => {
  const { transactions, createTransaction, isLoading, error } = useTransaction();
  const { activeWallet } = useWallet();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('SEND');

  const handleCreateTransaction = async () => {
    if (!activeWallet) {
      alert('Please select a wallet first');
      return;
    }

    try {
      await createTransaction({
        wallet_id: activeWallet.id,
        type,
        amount: parseFloat(amount).toString(),
      });
      setAmount('');
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  // Format date safely
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Transaction Test</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Create Transaction</h3>
        <div className="space-y-2">
          <div>
            <label className="block mb-1">Type:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TransactionType)}
              className="border p-2 rounded w-full"
            >
              <option value="SEND">Send</option>
              <option value="RECEIVE">Receive</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Amount:</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border p-2 rounded w-full"
              placeholder="Enter amount"
            />
          </div>
          <button
            onClick={handleCreateTransaction}
            disabled={isLoading || !amount}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            {isLoading ? 'Creating...' : 'Create Transaction'}
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Transactions List</h3>
        {transactions.length === 0 ? (
          <p>No transactions yet</p>
        ) : (
          <ul className="space-y-2">
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className="border p-3 rounded"
              >
                <div>Type: {tx.type}</div>
                <div>Amount: {tx.amount} ETH</div>
                <div>Status: {tx.status}</div>
                <div>Created: {formatDate(tx.created_at)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TransactionTest; 
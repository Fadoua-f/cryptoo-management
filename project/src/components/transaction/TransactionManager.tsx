import { ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react';
import React, { useState } from 'react';

import { TransactionType } from '../../types/transaction';
import { useTransaction } from '../../context/TransactionContext';
import { useWallet } from '../../context/WalletContext';

const TransactionManager: React.FC = () => {
  const { transactions, createTransaction, isLoading, error } = useTransaction();
  const { activeWallet } = useWallet();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('buy');
  const [currency, setCurrency] = useState('BTC');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWallet) {
      alert('Please select a wallet first');
      return;
    }

    try {
      await createTransaction({
        walletId: activeWallet.id,
        type,
        amount: parseFloat(amount),
        currency,
      });
      setAmount('');
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Transactions</h2>

      {error && (
        <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8 p-4 border border-gray-200 rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type de transaction
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as TransactionType)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="buy">Achat</option>
              <option value="sell">Vente</option>
            </select>
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              Devise
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USDT">Tether (USDT)</option>
              <option value="XRP">Ripple (XRP)</option>
            </select>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Montant
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.00000001"
              min="0"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="0.00"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading || !activeWallet}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Traitement...' : 'Effectuer la transaction'}
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Clock size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Aucune transaction effectuée</p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="p-4 border border-gray-200 rounded-md hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {transaction.type === 'buy' ? (
                    <ArrowDownLeft className="text-success-500 mr-2" size={20} />
                  ) : (
                    <ArrowUpRight className="text-error-500 mr-2" size={20} />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">
                      {transaction.type === 'buy' ? 'Achat' : 'Vente'} de {transaction.currency}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    transaction.type === 'buy' ? 'text-success-600' : 'text-error-600'
                  }`}>
                    {transaction.type === 'buy' ? '+' : '-'}{transaction.amount} {transaction.currency}
                  </p>
                  <p className="text-sm text-gray-500">
                    {transaction.status === 'confirmed' ? 'Complété' : 'En attente'}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionManager; 
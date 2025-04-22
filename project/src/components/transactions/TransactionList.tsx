import React, { useEffect } from 'react';

import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTransaction } from '../../context/TransactionContext';
import { useWallet } from '../../context/WalletContext';

const TransactionList: React.FC = () => {
  const { transactions, isLoading, error } = useTransaction();
  const { activeWallet } = useWallet();

  console.log('[TransactionList] Rendering with:', {
    transactionsCount: transactions?.length,
    isLoading,
    error,
    activeWalletId: activeWallet?.id,
    transactions: transactions
  });

  useEffect(() => {
    console.log('[TransactionList] Component mounted/updated');
    console.log('[TransactionList] Transactions length:', transactions?.length);
    console.log('[TransactionList] First transaction:', transactions?.[0]);
  }, [transactions]);

  if (!activeWallet) {
    console.log('[TransactionList] No active wallet, showing message');
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center py-8 text-gray-500">
          <p>Veuillez sélectionner un portefeuille pour voir son historique de transactions.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    console.log('[TransactionList] Loading state');
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('[TransactionList] Error state:', error);
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center py-8 text-error-600">
          <p>Une erreur est survenue lors du chargement des transactions.</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    console.log('[TransactionList] No transactions found');
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center py-8 text-gray-500">
          <p>Aucune transaction pour ce portefeuille.</p>
        </div>
      </div>
    );
  }

  console.log('[TransactionList] Rendering transactions:', transactions.map(tx => ({
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    status: tx.status
  })));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Historique des Transactions</h2>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.type === 'SEND' 
                      ? 'bg-error-100 text-error-800'
                      : 'bg-success-100 text-success-800'
                  }`}>
                    {transaction.type === 'SEND' ? 'Envoi' : 'Réception'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.status === 'COMPLETED'
                      ? 'bg-success-100 text-success-800'
                      : transaction.status === 'PENDING'
                      ? 'bg-warning-100 text-warning-800'
                      : 'bg-error-100 text-error-800'
                  }`}>
                    {transaction.status === 'COMPLETED' 
                      ? 'Complété'
                      : transaction.status === 'PENDING'
                      ? 'En attente'
                      : 'Échoué'
                    }
                  </span>
                </div>
                <p className="mt-2 text-lg font-medium">
                  {transaction.amount} ETH
                </p>
                {transaction.to_address && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">À:</span> {transaction.to_address}
                  </p>
                )}
                {transaction.tx_hash && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Hash:</span> {transaction.tx_hash}
                  </p>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {transaction.created_at && formatDistanceToNow(new Date(transaction.created_at), { 
                  addSuffix: true,
                  locale: fr 
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList; 
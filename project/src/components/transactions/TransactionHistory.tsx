import { CheckCircle, Clock, ExternalLink, XCircle } from 'lucide-react';

import React from 'react';
import { Transaction } from '../../types/transaction';
import { useTransaction } from '../../context/TransactionContext';
import { useWallet } from '../../context/WalletContext';

const TransactionHistory: React.FC = () => {
  const { transactions, isLoading } = useTransaction();
  const { activeWallet } = useWallet();
  
  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Status icon
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return <CheckCircle size={16} className="text-success-500" />;
      case 'FAILED':
        return <XCircle size={16} className="text-error-500" />;
      default:
        return <Clock size={16} className="text-warning-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Historique des Transactions</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Historique des Transactions</h2>
      
      {!activeWallet ? (
        <div className="text-center py-8 text-gray-500">
          <p>Sélectionnez un portefeuille pour voir son historique de transactions.</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Aucune transaction pour ce portefeuille.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {tx.type === 'SEND' ? 'Envoi' : 'Réception'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {tx.amount} ETH
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <StatusIcon status={tx.status} />
                      <span className="ml-1.5 text-sm capitalize">
                        {tx.status === 'COMPLETED' ? 'Confirmée' : 
                         tx.status === 'FAILED' ? 'Échouée' : 'En attente'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
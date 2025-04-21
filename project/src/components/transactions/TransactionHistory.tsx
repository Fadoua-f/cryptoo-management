import React from 'react';
import { useTransaction } from '../../context/TransactionContext';
import { useWallet } from '../../context/WalletContext';
import { ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';

const TransactionHistory: React.FC = () => {
  const { transactions } = useTransaction();
  const { activeWallet } = useWallet();
  
  // Filter transactions for the active wallet
  const walletTransactions = activeWallet
    ? transactions.filter(tx => tx.walletId === activeWallet.id)
    : [];

  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format address for display (truncate)
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Status icon
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} className="text-success-500" />;
      case 'failed':
        return <XCircle size={16} className="text-error-500" />;
      default:
        return <Clock size={16} className="text-warning-500" />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Historique des Transactions</h2>
      
      {!activeWallet ? (
        <div className="text-center py-8 text-gray-500">
          <p>Sélectionnez un portefeuille pour voir son historique de transactions.</p>
        </div>
      ) : walletTransactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Aucune transaction pour ce portefeuille.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  De
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  À
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {walletTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(tx.timestamp)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono">
                    {formatAddress(tx.fromAddress)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono">
                    {formatAddress(tx.toAddress)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {tx.amount} ETH
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <StatusIcon status={tx.status} />
                      <span className="ml-1.5 text-sm capitalize">
                        {tx.status === 'confirmed' ? 'Confirmée' : 
                         tx.status === 'failed' ? 'Échouée' : 'En attente'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href={`https://etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                    >
                      <span className="mr-1">Explorer</span>
                      <ExternalLink size={14} />
                    </a>
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
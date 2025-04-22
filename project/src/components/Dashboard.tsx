import ConnectWallet from './wallet/ConnectWallet';
import NetworkAnalysis from './analysis/NetworkAnalysis';
import React from 'react';
import TransactionForm from './transaction/TransactionForm';
import TransactionHistory from './transaction/TransactionHistory';
import WalletList from './wallet/WalletList';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';

const Dashboard: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { activeWallet } = useWallet();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Bienvenue sur CryptoWallet
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connectez-vous pour accéder à votre tableau de bord
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6">
            {/* Network Analysis */}
            <div className="bg-white shadow rounded-lg p-6">
              <NetworkAnalysis />
            </div>
            
            {/* Wallet Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Mes Portefeuilles</h2>
              {!activeWallet ? (
                <ConnectWallet />
              ) : (
                <div className="space-y-6">
                  <WalletList />
                  <TransactionForm />
                  <TransactionHistory />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
import { AlertCircle, Plus, Wallet } from 'lucide-react';
import React, { useState } from 'react';

import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';

const ConnectWallet: React.FC = () => {
  const { connectWallet, isConnecting, error, activeWallet } = useWallet();
  const { isAuthenticated } = useAuth();
  const [currency, setCurrency] = useState('ETH');

  const handleConnectWallet = async () => {
    if (!isAuthenticated) {
      return; // Don't attempt to connect if not authenticated
    }
    try {
      await connectWallet(currency);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Créer un portefeuille local</h2>
        
        <div className="p-4 bg-info-50 text-info-700 rounded-md mb-6">
          <p className="font-medium">Connexion requise</p>
          <p className="text-sm mt-1">Vous devez être connecté pour créer un portefeuille.</p>
        </div>
        
        <div className="flex flex-col space-y-4">
          <Link 
            to="/login" 
            className="flex items-center justify-center w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-md transition-colors"
          >
            Se connecter
          </Link>
          <Link 
            to="/register" 
            className="flex items-center justify-center w-full py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md transition-colors"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Créer un portefeuille local</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-error-50 text-error-700 rounded-md flex items-start">
          <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {activeWallet?.isConnected ? (
        <div className="p-4 bg-success-50 text-success-700 rounded-md mb-6">
          <p className="font-medium">Portefeuille connecté !</p>
          <p className="text-sm mt-1 font-mono">{activeWallet.address}</p>
          <p className="text-sm mt-1">
            <span className="font-medium">Réseau :</span> Hardhat Local
          </p>
          {activeWallet.balance && (
            <p className="text-sm mt-1">
              <span className="font-medium">Solde :</span> {activeWallet.balance} {activeWallet.currency}
            </p>
          )}
        </div>
      ) : (
        <div className="mb-6">
          <p className="mb-4 text-gray-600">
            Créez un nouveau portefeuille sur le réseau Hardhat local pour commencer à gérer vos crypto-monnaies.
          </p>
          
          <div className="mb-4">
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              Devise
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="ETH">Ethereum (ETH)</option>
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="USDT">Tether (USDT)</option>
            </select>
          </div>
        </div>
      )}
      
      <button
        onClick={handleConnectWallet}
        disabled={isConnecting || activeWallet?.isConnected}
        className="flex items-center justify-center w-full py-3 px-4 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isConnecting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Création en cours...
          </>
        ) : (
          <>
            <Plus size={20} className="mr-2" />
            {activeWallet?.isConnected ? 'Portefeuille déjà créé' : 'Créer un portefeuille'}
          </>
        )}
      </button>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>
          Ce portefeuille est créé sur le réseau Hardhat local pour le développement et les tests.
        </p>
      </div>
    </div>
  );
};

export default ConnectWallet;
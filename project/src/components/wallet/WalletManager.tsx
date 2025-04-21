import { Plus, Trash2, Wallet } from 'lucide-react';
import React, { useState } from 'react';

import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';

const WalletManager: React.FC = () => {
  const { wallets, activeWallet, connectWallet, setActiveWallet, removeWallet, isConnecting, error } = useWallet();
  const { user } = useAuth();
  const [newWalletCurrency, setNewWalletCurrency] = useState('BTC');
  const [showAddWallet, setShowAddWallet] = useState(false);

  const handleConnectWallet = async () => {
    try {
      await connectWallet(newWalletCurrency);
      setShowAddWallet(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Mes Portefeuilles</h2>
        <button
          onClick={() => setShowAddWallet(!showAddWallet)}
          className="flex items-center text-primary-600 hover:text-primary-800 transition-colors"
        >
          <Plus size={18} className="mr-1" />
          Ajouter un portefeuille
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {showAddWallet && (
        <div className="mb-6 p-4 border border-gray-200 rounded-md">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Ajouter un nouveau portefeuille</h3>
          <div className="mb-4">
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              Devise
            </label>
            <select
              id="currency"
              value={newWalletCurrency}
              onChange={(e) => setNewWalletCurrency(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USDT">Tether (USDT)</option>
              <option value="XRP">Ripple (XRP)</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddWallet(false)}
              className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors disabled:opacity-50"
            >
              {isConnecting ? 'Connexion...' : 'Connecter'}
            </button>
          </div>
        </div>
      )}

      {wallets.length === 0 ? (
        <div className="text-center py-8">
          <Wallet size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Vous n'avez pas encore de portefeuille</p>
          <button
            onClick={() => setShowAddWallet(true)}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
          >
            Créer un portefeuille
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className={`p-4 border rounded-md transition-colors ${
                activeWallet?.id === wallet.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-800">{wallet.name}</h3>
                  <p className="text-sm text-gray-500">{wallet.currency}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveWallet(wallet)}
                    className={`p-1 rounded-full ${
                      activeWallet?.id === wallet.id
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={activeWallet?.id === wallet.id ? 'Portefeuille actif' : 'Activer ce portefeuille'}
                  >
                    <Wallet size={16} />
                  </button>
                  <button
                    onClick={() => removeWallet(wallet.id)}
                    className="p-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                    title="Supprimer ce portefeuille"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">Solde</p>
                <p className="text-xl font-bold text-gray-800">
                  {wallet.balance || '0.00'} {wallet.currency}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WalletManager; 
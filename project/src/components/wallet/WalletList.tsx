import { ExternalLink, Plus, RefreshCw, Trash2, Wallet } from 'lucide-react';
import React, { useState } from 'react';

import { AddWalletParams } from '../../types/wallet.types';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';

const WalletList: React.FC = () => {
  const { wallets, addWallet, removeWallet, setActiveWallet, activeWallet, refreshBalances } = useWallet();
  const { isAuthenticated } = useAuth();
  
  const [showAddWalletForm, setShowAddWalletForm] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletPrivateKey, setNewWalletPrivateKey] = useState('');
  const [formErrors, setFormErrors] = useState<{ name?: string; privateKey?: string }>({});

  const handleAddWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: { name?: string; privateKey?: string } = {};
    
    if (!newWalletName.trim()) {
      errors.name = 'Le nom est requis';
    }
    
    if (!newWalletPrivateKey.trim()) {
      errors.privateKey = 'La clé privée est requise';
    } else if (!/^0x[a-fA-F0-9]{64}$/.test(newWalletPrivateKey)) {
      errors.privateKey = 'Format de clé privée invalide';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    const walletParams: AddWalletParams = {
      name: newWalletName.trim(),
      privateKey: newWalletPrivateKey.trim(),
    };
    
    addWallet(walletParams);
    setNewWalletName('');
    setNewWalletPrivateKey('');
    setFormErrors({});
    setShowAddWalletForm(false);
  };

  const handleSelectWallet = (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    if (wallet) {
      setActiveWallet(wallet);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Mes Portefeuilles</h2>
        </div>
        
        <div className="p-4 bg-info-50 text-info-700 rounded-md mb-6">
          <p className="font-medium">Connexion requise</p>
          <p className="text-sm mt-1">Vous devez être connecté pour gérer vos portefeuilles.</p>
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Mes Portefeuilles</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => refreshBalances()}
            className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            title="Actualiser les soldes"
          >
            <RefreshCw size={16} className="mr-1" />
            Actualiser
          </button>
          <button
            onClick={() => setShowAddWalletForm(!showAddWalletForm)}
            className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            {showAddWalletForm ? 'Annuler' : (
              <>
                <Plus size={16} className="mr-1" />
                Ajouter
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add Wallet Form */}
      {showAddWalletForm && (
        <form onSubmit={handleAddWalletSubmit} className="mb-6 p-4 bg-gray-50 rounded-md">
          <div className="mb-4">
            <label htmlFor="walletName" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du portefeuille
            </label>
            <input
              type="text"
              id="walletName"
              value={newWalletName}
              onChange={(e) => setNewWalletName(e.target.value)}
              className={`block w-full px-3 py-2 border ${
                formErrors.name ? 'border-error-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
              placeholder="Mon portefeuille principal"
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-error-600">{formErrors.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="walletPrivateKey" className="block text-sm font-medium text-gray-700 mb-1">
              Clé Privée
            </label>
            <input
              type="password"
              id="walletPrivateKey"
              value={newWalletPrivateKey}
              onChange={(e) => setNewWalletPrivateKey(e.target.value)}
              className={`block w-full px-3 py-2 border ${
                formErrors.privateKey ? 'border-error-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
              placeholder="0x..."
            />
            {formErrors.privateKey && (
              <p className="mt-1 text-sm text-error-600">{formErrors.privateKey}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Ajouter le portefeuille
          </button>
        </form>
      )}

      {/* Wallets List */}
      {wallets.length === 0 && !showAddWalletForm && (
        <div className="text-center py-8 text-gray-500">
          <Wallet size={48} className="mx-auto mb-4 text-gray-400" />
          <p>Aucun portefeuille trouvé.</p>
          <p className="mt-2">Ajoutez un portefeuille manuellement en utilisant une clé privée.</p>
        </div>
      )}

      {wallets.length > 0 && (
        <div className="space-y-4">
          {wallets.map((wallet) => (
            <div 
              key={wallet.id} 
              onClick={() => handleSelectWallet(wallet.id)}
              className={`p-4 rounded-md border transition-all cursor-pointer hover:shadow-md ${
                activeWallet?.id === wallet.id 
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900 flex items-center">
                    {wallet.name}
                    {wallet.isConnected && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                        Connecté
                      </span>
                    )}
                  </h3>
                  <p className="text-sm font-mono text-gray-500 mt-1">{wallet.address}</p>
                  {wallet.balance && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Solde:</span> {wallet.balance} ETH
                    </p>
                  )}
                  {wallet.currency && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Devise:</span> {wallet.currency}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <a
                    href={`https://etherscan.io/address/${wallet.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-500 hover:text-primary-600 transition-colors rounded-full hover:bg-gray-100"
                    title="Voir sur Etherscan"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={16} />
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeWallet(wallet.id);
                    }}
                    className="p-1.5 text-gray-500 hover:text-error-600 transition-colors rounded-full hover:bg-gray-100"
                    title="Supprimer le portefeuille"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WalletList;
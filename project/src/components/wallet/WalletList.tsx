import React, { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { AddWalletParams } from '../../types/wallet.types';

const WalletList: React.FC = () => {
  const { wallets, addWallet, removeWallet, setActiveWallet, activeWallet } = useWallet();
  
  const [showAddWalletForm, setShowAddWalletForm] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [formErrors, setFormErrors] = useState<{ name?: string; address?: string }>({});

  const handleAddWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: { name?: string; address?: string } = {};
    
    if (!newWalletName.trim()) {
      errors.name = 'Le nom est requis';
    }
    
    if (!newWalletAddress.trim()) {
      errors.address = 'L\'adresse est requise';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(newWalletAddress)) {
      errors.address = 'Format d\'adresse Ethereum invalide';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    const walletParams: AddWalletParams = {
      name: newWalletName.trim(),
      address: newWalletAddress.trim(),
    };
    
    addWallet(walletParams);
    setNewWalletName('');
    setNewWalletAddress('');
    setFormErrors({});
    setShowAddWalletForm(false);
  };

  const handleSelectWallet = (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    if (wallet) {
      setActiveWallet(wallet);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Mes Portefeuilles</h2>
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
            <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse Ethereum
            </label>
            <input
              type="text"
              id="walletAddress"
              value={newWalletAddress}
              onChange={(e) => setNewWalletAddress(e.target.value)}
              className={`block w-full px-3 py-2 border ${
                formErrors.address ? 'border-error-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
              placeholder="0x..."
            />
            {formErrors.address && (
              <p className="mt-1 text-sm text-error-600">{formErrors.address}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowAddWalletForm(false)}
              className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
            >
              Ajouter le portefeuille
            </button>
          </div>
        </form>
      )}

      {/* Wallets List */}
      {wallets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Vous n'avez pas encore de portefeuilles.</p>
          <p className="mt-2">Connectez MetaMask ou ajoutez un portefeuille manuellement.</p>
        </div>
      ) : (
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
                  {wallet.network && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Réseau:</span> {wallet.network}
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
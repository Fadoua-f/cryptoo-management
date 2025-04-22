import { AlertCircle, Plus, Terminal, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';
import blockchainService from '../../lib/blockchain';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../context/WalletContext';

const ConnectWallet: React.FC = () => {
  const { connectWallet, addWallet, isConnecting, error, activeWallet } = useWallet();
  const { isAuthenticated } = useAuth();
  const [currency, setCurrency] = useState('ETH');
  const [hardhatStatus, setHardhatStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [showAddWalletForm, setShowAddWalletForm] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletPrivateKey, setNewWalletPrivateKey] = useState('');
  const [formErrors, setFormErrors] = useState<{ name?: string; privateKey?: string }>({});

  // Check if Hardhat is running
  useEffect(() => {
    const checkHardhatConnection = async () => {
      try {
        const isConnected = await blockchainService.checkConnection();
        setHardhatStatus(isConnected ? 'connected' : 'disconnected');
      } catch (err) {
        console.error('Error checking Hardhat connection:', err);
        setHardhatStatus('disconnected');
      }
    };

    checkHardhatConnection();
  }, []);

  const handleConnectWallet = async () => {
    if (!isAuthenticated) {
      return; // Don't attempt to connect if not authenticated
    }
    
    if (hardhatStatus !== 'connected') {
      // Try to reconnect to Hardhat
      const isConnected = await blockchainService.checkConnection();
      setHardhatStatus(isConnected ? 'connected' : 'disconnected');
      
      if (!isConnected) {
        return; // Don't proceed if Hardhat is not running
      }
    }
    
    try {
      await connectWallet(currency);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

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
    
    const walletParams = {
      name: newWalletName.trim(),
      privateKey: newWalletPrivateKey.trim(),
      currency: currency
    };
    
    addWallet(walletParams);
    setNewWalletName('');
    setNewWalletPrivateKey('');
    setFormErrors({});
    setShowAddWalletForm(false);
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
      
      {hardhatStatus === 'disconnected' && (
        <div className="mb-4 p-4 bg-warning-50 text-warning-700 rounded-md">
          <p className="font-medium flex items-center">
            <Terminal size={20} className="mr-2" />
            Hardhat n'est pas connecté
          </p>
          <p className="text-sm mt-1">
            Pour créer un portefeuille local, vous devez d'abord démarrer le nœud Hardhat.
          </p>
          <div className="mt-2 p-2 bg-gray-100 rounded font-mono text-sm">
            npx hardhat node
          </div>
          <p className="text-sm mt-2">
            Exécutez cette commande dans un terminal séparé, puis rafraîchissez cette page.
          </p>
        </div>
      )}
      
      {!showAddWalletForm ? (
        <div className="flex justify-center">
          <button
            onClick={() => setShowAddWalletForm(true)}
            className="flex items-center justify-center w-full py-3 px-4 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-md transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Ajouter un portefeuille
          </button>
        </div>
      ) : (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Ajouter un portefeuille</h3>
            <button
              onClick={() => setShowAddWalletForm(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Annuler
            </button>
          </div>
          
          <form onSubmit={handleAddWalletSubmit} className="space-y-4">
            <div>
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
            
            <div>
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
                <option value="ETH">Ethereum (ETH)</option>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="USDT">Tether (USDT)</option>
              </select>
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Ajouter le portefeuille
            </button>
          </form>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-500">
        <p>
          Ce portefeuille est créé sur le réseau Hardhat local pour le développement et les tests.
        </p>
      </div>
    </div>
  );
};

export default ConnectWallet;
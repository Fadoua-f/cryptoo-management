import React from 'react';
import { useWallet } from '../../context/WalletContext';
import { Wallet, AlertCircle } from 'lucide-react';

const ConnectWallet: React.FC = () => {
  const { connectMetaMask, isConnecting, error, activeWallet } = useWallet();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Connecter un portefeuille</h2>
      
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
            <span className="font-medium">Réseau :</span> {activeWallet.network || 'Non spécifié'}
          </p>
          {activeWallet.balance && (
            <p className="text-sm mt-1">
              <span className="font-medium">Solde :</span> {activeWallet.balance} ETH
            </p>
          )}
        </div>
      ) : (
        <p className="mb-4 text-gray-600">
          Connectez-vous à votre portefeuille MetaMask pour commencer à gérer vos crypto-monnaies.
        </p>
      )}
      
      <button
        onClick={connectMetaMask}
        disabled={isConnecting}
        className="flex items-center justify-center w-full py-3 px-4 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isConnecting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connexion en cours...
          </>
        ) : (
          <>
            <Wallet size={20} className="mr-2" />
            {activeWallet?.isConnected ? 'Reconnexion à MetaMask' : 'Connecter MetaMask'}
          </>
        )}
      </button>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>
          Vous n'avez pas encore MetaMask ?{' '}
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Installer maintenant
          </a>
        </p>
      </div>
    </div>
  );
};

export default ConnectWallet;
import { ArrowRight, Wallet } from 'lucide-react';
import React, { useEffect } from 'react';

import ConnectWallet from '../components/wallet/ConnectWallet';
import { Link } from 'react-router-dom';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionHistory from '../components/transactions/TransactionHistory';
import WalletList from '../components/wallet/WalletList';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  useEffect(() => {
    document.title = 'Accueil | CryptoPortfolio';
  }, []);

  // Hero Section for unauthenticated users
  const HeroSection = () => (
    <div className="bg-primary-600 text-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Gérez vos portefeuilles de crypto-monnaies en toute simplicité
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Une plateforme intuitive pour connecter, gérer et suivre vos portefeuilles Ethereum.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-md shadow-md hover:bg-gray-100 transition-colors"
            >
              Créer un compte
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-md hover:bg-white/10 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  // Features Section for unauthenticated users
  const FeaturesSection = () => (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Fonctionnalités Principales</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
              <Wallet size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Connexion MetaMask</h3>
            <p className="text-gray-600">
              Connectez votre portefeuille MetaMask en un clic pour accéder à vos actifs Ethereum.
            </p>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-secondary-100 text-secondary-600 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Gestion Multi-portefeuilles</h3>
            <p className="text-gray-600">
              Ajoutez et gérez plusieurs portefeuilles Ethereum depuis une interface unique.
            </p>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Transactions Simplifiées</h3>
            <p className="text-gray-600">
              Envoyez des ETH facilement et consultez l'historique de vos transactions.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Link
            to="/register"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-md shadow-md hover:bg-primary-700 transition-colors"
          >
            Commencer maintenant
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );

  // Dashboard for authenticated users
  const Dashboard = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bonjour, {user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}
        </h1>
        <p className="text-gray-600 mt-2">
          Bienvenue sur votre tableau de bord de gestion de portefeuilles crypto.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-semibold mb-2">Portefeuille Local</h3>
          <p className="text-gray-600 mb-4">
            Créez un portefeuille sur le réseau Hardhat local pour gérer vos actifs Ethereum.
          </p>
          <ConnectWallet />
        </div>
        <WalletList />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransactionForm />
        <TransactionHistory />
      </div>
    </div>
  );

  return isAuthenticated ? <Dashboard /> : (
    <>
      <HeroSection />
      <FeaturesSection />
    </>
  );
};

export default Home;
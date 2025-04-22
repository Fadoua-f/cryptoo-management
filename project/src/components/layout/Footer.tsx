import { Github, Mail, Twitter, Wallet } from 'lucide-react';

import { Link } from 'react-router-dom';
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand & Description */}
          <div>
            <Link to="/" className="flex items-center mb-4">
              <Wallet size={24} className="mr-2" />
              <span className="text-xl font-bold">CryptoPortfolio</span>
            </Link>
            <p className="text-gray-400 mb-4">
              Solution simple et sécurisée pour gérer vos portefeuilles de crypto-monnaies et suivre vos transactions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github size={20} />
              </a>
              <a href="mailto:contact@cryptoportfolio.com" className="text-gray-400 hover:text-white transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens Rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                  Connexion
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-400 hover:text-white transition-colors">
                  Inscription
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <div className="mb-4">
              <h3 className="text-white text-lg font-semibold mb-2">Ressources</h3>
              <ul className="space-y-1">
                <li>
                  <a href="https://ethereum.org/" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                    Ethereum
                  </a>
                </li>
                <li>
                  <a href="https://hardhat.org/" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                    Hardhat
                  </a>
                </li>
                <li>
                  <a href="https://web3js.readthedocs.io/" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                    Web3.js
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>© {currentYear} CryptoPortfolio. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
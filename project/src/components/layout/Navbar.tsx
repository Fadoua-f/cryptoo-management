import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Wallet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return (
    <nav className="bg-primary-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-xl font-bold"
            onClick={closeMenu}
          >
            <Wallet size={24} />
            <span>CryptoPortfolio</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`font-medium hover:text-white transition-colors ${isActive('/') ? 'text-white' : 'text-white/80'}`}
            >
              Accueil
            </Link>
            <Link
              to="/contact"
              className={`font-medium hover:text-white transition-colors ${isActive('/contact') ? 'text-white' : 'text-white/80'}`}
            >
              Contact
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className={`font-medium hover:text-white transition-colors ${isActive('/profile') ? 'text-white' : 'text-white/80'}`}
                >
                  Profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="font-medium hover:text-white transition-colors text-white/80"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={`font-medium hover:text-white transition-colors ${isActive('/login') ? 'text-white' : 'text-white/80'}`}
              >
                Connexion
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white focus:outline-none" 
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-3 space-y-2 mt-2 border-t border-primary-500 animate-fadeIn">
            <Link
              to="/"
              className={`block py-2 ${isActive('/') ? 'text-white font-medium' : 'text-white/80'}`}
              onClick={closeMenu}
            >
              Accueil
            </Link>
            <Link
              to="/contact"
              className={`block py-2 ${isActive('/contact') ? 'text-white font-medium' : 'text-white/80'}`}
              onClick={closeMenu}
            >
              Contact
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className={`block py-2 ${isActive('/profile') ? 'text-white font-medium' : 'text-white/80'}`}
                  onClick={closeMenu}
                >
                  Profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="block py-2 text-white/80 w-full text-left"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className={`block py-2 ${isActive('/login') ? 'text-white font-medium' : 'text-white/80'}`}
                onClick={closeMenu}
              >
                Connexion
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
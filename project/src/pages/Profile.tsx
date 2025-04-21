import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, LogOut } from 'lucide-react';

const Profile: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  
  useEffect(() => {
    document.title = 'Profil | CryptoPortfolio';
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Mon Profil</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8 flex flex-col items-center border-b border-gray-200">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <User size={48} className="text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-gray-500 flex items-center mt-2">
              <Mail size={16} className="mr-2" />
              {user?.email}
            </p>
          </div>
          
          <div className="p-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">ID Utilisateur</h3>
                <p className="mt-1 text-gray-900 font-mono">{user?.id}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date d'inscription</h3>
                <p className="mt-1 text-gray-900">
                  {new Date().toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Actions</h3>
              
              <button 
                onClick={() => logout()}
                className="flex items-center text-error-600 hover:text-error-800 transition-colors"
              >
                <LogOut size={18} className="mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
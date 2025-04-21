import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    document.title = 'Inscription | CryptoPortfolio';
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <RegisterForm />
    </div>
  );
};

export default Register;
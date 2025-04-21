import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import Contact from './pages/Contact';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Navbar from './components/layout/Navbar';
import Profile from './pages/Profile';
import React from 'react';
import Register from './pages/Register';
import { TransactionProvider } from './context/TransactionContext';
import { WalletProvider } from './context/WalletContext';
import { Web3Provider } from './context/Web3Context';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';

const getLibrary = (provider: any) => {
  const library = new ethers.providers.Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
};

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3Provider>
        <AuthProvider>
          <WalletProvider>
            <TransactionProvider>
              <Router>
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/contact" element={<Contact />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </Router>
            </TransactionProvider>
          </WalletProvider>
        </AuthProvider>
      </Web3Provider>
    </Web3ReactProvider>
  );
}

export default App;
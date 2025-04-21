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

function App() {
  return (
    <Router>
      <AuthProvider>
        <WalletProvider>
          <TransactionProvider>
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
          </TransactionProvider>
        </WalletProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
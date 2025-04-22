import { AlertCircle, Send } from 'lucide-react';
import React, { FC, useState } from 'react';

import { useTransaction } from '../../context/TransactionContext';
import { useWallet } from '../../context/WalletContext';

const TransactionForm: FC = () => {
  const { activeWallet } = useWallet();
  const { createTransaction, isLoading, error } = useTransaction();
  
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [formErrors, setFormErrors] = useState<{ toAddress?: string; amount?: string }>({});
  const [transactionSuccess, setTransactionSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = () => {
    const errors: { toAddress?: string; amount?: string } = {};
    
    if (!toAddress) {
      errors.toAddress = 'L\'adresse du destinataire est requise';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
      errors.toAddress = 'Format d\'adresse Ethereum invalide';
    }
    
    if (!amount) {
      errors.amount = 'Le montant est requis';
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      errors.amount = 'Veuillez entrer un montant valide';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeWallet) {
      setErrorMessage('Please select a wallet first');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const transactionData = {
        wallet_id: activeWallet.id,
        type: 'SEND' as const,
        amount: amount,
        to_address: toAddress
      };
      
      console.log('[TransactionForm] Creating transaction:', transactionData);
      
      await createTransaction(transactionData);
      
      // Reset form
      setAmount('');
      setToAddress('');
      setTransactionSuccess(true);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setTransactionSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('[TransactionForm] Error creating transaction:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create transaction');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Envoyer des ETH</h2>
      
      {!activeWallet ? (
        <div className="p-4 bg-warning-50 text-warning-700 rounded-md mb-4 flex items-start">
          <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <p>Veuillez sélectionner un portefeuille avant d'envoyer une transaction.</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-error-50 text-error-700 rounded-md mb-4 flex items-start">
          <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      ) : transactionSuccess ? (
        <div className="p-4 bg-success-50 text-success-700 rounded-md mb-4">
          <p className="font-medium">Transaction envoyée avec succès !</p>
        </div>
      ) : null}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="fromAddress" className="block text-sm font-medium text-gray-700 mb-1">
            De (Portefeuille actif)
          </label>
          <input
            type="text"
            id="fromAddress"
            value={activeWallet?.address || ''}
            disabled
            className="block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 font-mono text-sm"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="toAddress" className="block text-sm font-medium text-gray-700 mb-1">
            Adresse du destinataire
          </label>
          <input
            type="text"
            id="toAddress"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            placeholder="0x..."
            className={`block w-full px-3 py-2 border ${
              formErrors.toAddress ? 'border-error-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
          />
          {formErrors.toAddress && (
            <p className="mt-1 text-sm text-error-600">{formErrors.toAddress}</p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Montant (ETH)
          </label>
          <input
            type="text"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.1"
            className={`block w-full px-3 py-2 border ${
              formErrors.amount ? 'border-error-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500`}
          />
          {formErrors.amount && (
            <p className="mt-1 text-sm text-error-600">{formErrors.amount}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !activeWallet}
          className="w-full flex justify-center items-center py-3 px-4 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Transaction en cours...
            </>
          ) : (
            <>
              <Send size={20} className="mr-2" />
              Envoyer
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
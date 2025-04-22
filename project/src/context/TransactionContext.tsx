import { CreateTransactionDTO, Transaction, TransactionContextType } from '../types/transaction';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { sendETH } from '../services/blockchain';
import { transactionAPI } from '../services/api';
import { useWallet } from './WalletContext';

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { activeWallet } = useWallet();

  // Load transactions when active wallet changes
  useEffect(() => {
    const loadTransactions = async () => {
      if (activeWallet) {
        setIsLoading(true);
        try {
          const apiTransactions = await transactionAPI.getTransactions(activeWallet.id);
          setTransactions(apiTransactions);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load transactions');
        } finally {
          setIsLoading(false);
        }
      } else {
        setTransactions([]);
      }
    };

    loadTransactions();
  }, [activeWallet]);

  const createTransaction = async (transaction: CreateTransactionDTO) => {
    if (!activeWallet) {
      setError('No active wallet selected');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Ensure we have the wallet_id
      const transactionData = {
        ...transaction,
        wallet_id: activeWallet.id,
        amount: transaction.amount.toString()
      };

      // If it's an ETH transfer, use the blockchain service first
      if (transaction.to_address) {
        console.log('Sending ETH transaction:', {
          toAddress: transaction.to_address,
          amount: transaction.amount
        });
        
        try {
          // First send the ETH transaction
          const result = await sendETH(transaction.to_address, transaction.amount);
          console.log('ETH transaction result:', result);
          
          // Then create the transaction record in the backend
          const apiTransaction = await transactionAPI.createTransaction(transactionData);
          setTransactions(prev => [...prev, apiTransaction]);
        } catch (blockchainError) {
          console.error('Blockchain transaction failed:', blockchainError);
          throw blockchainError;
        }
      } else {
        // Handle other transaction types through the API
        const apiTransaction = await transactionAPI.createTransaction(transactionData);
        setTransactions(prev => [...prev, apiTransaction]);
      }
    } catch (err) {
      console.error('Transaction error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        isLoading,
        error,
        createTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};
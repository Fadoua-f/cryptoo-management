import { CreateTransactionDTO, Transaction, TransactionContextType } from '../types/transaction';
import React, { createContext, useContext, useEffect, useState } from 'react';

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
          
          // Transform API transactions to match our Transaction type
          const transformedTransactions: Transaction[] = apiTransactions.map((tx: any) => ({
            id: tx.id.toString(),
            type: tx.type === 'deposit' ? 'buy' : 'sell',
            amount: tx.amount,
            currency: activeWallet.currency || 'BTC',
            status: 'confirmed',
            createdAt: new Date(tx.created_at).toISOString(),
            walletId: activeWallet.id,
          }));
          
          setTransactions(transformedTransactions);
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
      // Create transaction in the backend
      const apiTransaction = await transactionAPI.createTransaction(
        transaction.walletId,
        transaction.type === 'buy' ? 'deposit' : 'withdrawal',
        transaction.amount
      );
      
      // Transform API transaction to match our Transaction type
      const newTransaction: Transaction = {
        id: apiTransaction.id.toString(),
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        status: 'pending',
        createdAt: new Date().toISOString(),
        walletId: transaction.walletId,
      };
      
      setTransactions(prev => [...prev, newTransaction]);
      
      // Update transaction status to confirmed after a delay
      setTimeout(() => {
        setTransactions(prev => 
          prev.map(tx => 
            tx.id === newTransaction.id 
              ? { ...tx, status: 'confirmed' }
              : tx
          )
        );
      }, 2000);
    } catch (err) {
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
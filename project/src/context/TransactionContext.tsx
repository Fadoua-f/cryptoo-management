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
          
          // Transform API transactions to match our Transaction type
          const transformedTransactions: Transaction[] = apiTransactions.map((tx: any) => ({
            id: tx.id.toString(),
            type: tx.type === 'deposit' ? 'buy' : 'sell',
            amount: tx.amount,
            currency: activeWallet.currency || 'ETH',
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
      // If it's an ETH transfer, use the blockchain service first
      if (transaction.currency === 'ETH' && transaction.toAddress) {
        console.log('Sending ETH transaction:', {
          toAddress: transaction.toAddress,
          amount: transaction.amount
        });
        
        try {
          // First send the ETH transaction
          const result = await sendETH(transaction.toAddress, transaction.amount.toString());
          console.log('ETH transaction result:', result);
          
          // Then try to create the transaction record in the backend
          try {
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
              status: 'confirmed',
              createdAt: new Date().toISOString(),
              walletId: transaction.walletId,
            };
            
            setTransactions(prev => [...prev, newTransaction]);
          } catch (apiError) {
            console.error('Failed to create transaction record in backend:', apiError);
            // Still show success since the blockchain transaction succeeded
            setTransactions(prev => [...prev, {
              id: Date.now().toString(),
              type: transaction.type,
              amount: transaction.amount,
              currency: transaction.currency,
              status: 'confirmed',
              createdAt: new Date().toISOString(),
              walletId: transaction.walletId,
            }]);
          }
        } catch (blockchainError) {
          console.error('Blockchain transaction failed:', blockchainError);
          throw blockchainError;
        }
      } else {
        // Handle other transaction types through the API
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
import { CreateTransactionDTO, Transaction, TransactionContextType } from '../types/transaction';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { sendETH } from '../services/blockchain';
import { transactionAPI } from '../services/api';
import { useWallet } from './WalletContext';

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { activeWallet, refreshBalances } = useWallet();

  const loadTransactions = useCallback(async (walletId: string) => {
    console.log('[TransactionContext] Loading transactions for wallet:', walletId);
    setIsLoading(true);
    setError(null);
    try {
      const response = await transactionAPI.getTransactions(walletId);
      console.log('[TransactionContext] Received transactions:', {
        count: response.length,
        transactions: response.map((tx: Transaction) => ({
          id: tx.id,
          type: tx.type,
          amount: tx.amount,
          status: tx.status
        }))
      });
      setTransactions(response);
    } catch (err) {
      const error = err as Error;
      console.error('[TransactionContext] Error loading transactions:', {
        error: error.message,
        stack: error.stack
      });
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load transactions when active wallet changes
  useEffect(() => {
    if (activeWallet) {
      loadTransactions(activeWallet.id);
    } else {
      console.log('[TransactionContext] No active wallet, clearing transactions');
      setTransactions([]);
    }
  }, [activeWallet, loadTransactions]);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('[TransactionContext] State updated:', {
      transactionsCount: transactions.length,
      isLoading,
      error,
      activeWalletId: activeWallet?.id
    });
  }, [transactions, isLoading, error, activeWallet]);

  const createTransaction = async (transaction: CreateTransactionDTO) => {
    console.log('[TransactionContext] createTransaction called with:', transaction);
    
    if (!activeWallet) {
      console.error('[TransactionContext] No active wallet selected');
      setError('No active wallet selected');
      return;
    }

    console.log('[TransactionContext] Creating transaction:', {
      walletId: activeWallet.id,
      type: transaction.type,
      amount: transaction.amount,
      toAddress: transaction.to_address,
      timestamp: new Date().toISOString()
    });

    setIsLoading(true);
    setError(null);
    try {
      // Ensure we have the wallet_id
      const transactionData = {
        ...transaction,
        wallet_id: activeWallet.id,
        amount: transaction.amount.toString()
      };

      console.log('[TransactionContext] Transaction data:', transactionData);
      console.log('[TransactionContext] Transaction type:', transaction.type);
      console.log('[TransactionContext] Transaction to_address:', transaction.to_address);
      console.log('[TransactionContext] Condition check:', transaction.type === 'SEND' && transaction.to_address);

      // If it's a SEND transaction with a to_address, use the blockchain service first
      if (transaction.type === 'SEND' && transaction.to_address) {
        console.log('[TransactionContext] Sending ETH transaction:', {
          toAddress: transaction.to_address,
          amount: transaction.amount,
          fromWallet: activeWallet.address
        });
        
        try {
          // First send the ETH transaction
          console.log('[TransactionContext] Calling blockchain service to send ETH...');
          
          // Retrieve private key from localStorage
          const privateKey = localStorage.getItem(`wallet_private_key_${activeWallet.id}`);
          if (!privateKey) {
            console.error('[TransactionContext] Private key not found for wallet:', activeWallet.id);
            throw new Error(`Private key not found for wallet ${activeWallet.name || activeWallet.address}. Please re-import the wallet with its private key.`);
          }
          
          console.log('[TransactionContext] Private key found, sending ETH...');
          const result = await sendETH(
            transaction.to_address, 
            transaction.amount,
            privateKey
          );
          console.log('[TransactionContext] ETH transaction result:', result);
          
          // Then create the transaction record in the backend
          console.log('[TransactionContext] Creating transaction record in backend...');
          const apiTransaction = await transactionAPI.createTransaction({
            ...transactionData,
            tx_hash: result.hash
          });
          console.log('[TransactionContext] Transaction record created:', {
            id: apiTransaction.id,
            type: apiTransaction.type,
            amount: apiTransaction.amount,
            status: apiTransaction.status
          });
          setTransactions(prev => [...prev, apiTransaction]);
          
          // Refresh balances after successful transaction
          console.log('[TransactionContext] Refreshing wallet balances...');
          await refreshBalances();
        } catch (blockchainError) {
          console.error('[TransactionContext] Blockchain transaction failed:', blockchainError);
          console.error('[TransactionContext] Error details:', {
            message: blockchainError instanceof Error ? blockchainError.message : 'Unknown error',
            stack: blockchainError instanceof Error ? blockchainError.stack : undefined
          });
          throw blockchainError;
        }
      } else {
        // Handle other transaction types through the API
        console.log('[TransactionContext] Creating non-ETH transaction in backend...');
        const apiTransaction = await transactionAPI.createTransaction(transactionData);
        console.log('[TransactionContext] Transaction record created:', {
          id: apiTransaction.id,
          type: apiTransaction.type,
          amount: apiTransaction.amount,
          status: apiTransaction.status
        });
        setTransactions(prev => [...prev, apiTransaction]);
        
        // Refresh balances after successful transaction
        console.log('[TransactionContext] Refreshing wallet balances...');
        await refreshBalances();
      }
    } catch (err) {
      console.error('[TransactionContext] Transaction error:', err);
      console.error('[TransactionContext] Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      setError(err instanceof Error ? err.message : 'An error occurred while creating the transaction');
      throw err; // Re-throw the error so it can be caught by the component
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
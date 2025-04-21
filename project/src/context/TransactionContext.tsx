import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { TransactionState, Transaction, SendTransactionParams } from '../types/transaction.types';
import { useAuth } from './AuthContext';
import { useWallet } from './WalletContext';

// Initial state
const initialState: TransactionState = {
  transactions: [],
  isLoading: false,
  error: null,
};

// Action types
type TransactionAction =
  | { type: 'SEND_TRANSACTION_REQUEST' }
  | { type: 'SEND_TRANSACTION_SUCCESS'; payload: Transaction }
  | { type: 'SEND_TRANSACTION_FAILURE'; payload: string }
  | { type: 'LOAD_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'RESET_TRANSACTIONS' };

// Reducer
const transactionReducer = (state: TransactionState, action: TransactionAction): TransactionState => {
  switch (action.type) {
    case 'SEND_TRANSACTION_REQUEST':
      return { ...state, isLoading: true, error: null };
    case 'SEND_TRANSACTION_SUCCESS':
      return {
        ...state,
        isLoading: false,
        transactions: [...state.transactions, action.payload],
        error: null,
      };
    case 'SEND_TRANSACTION_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'LOAD_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload,
      };
    case 'RESET_TRANSACTIONS':
      return initialState;
    default:
      return state;
  }
};

// Context
interface TransactionContextType extends TransactionState {
  sendTransaction: (params: SendTransactionParams) => Promise<void>;
  getTransactionsForWallet: (walletId: string) => Transaction[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// Provider
interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, initialState);
  const { isAuthenticated, user } = useAuth();
  const { activeWallet } = useWallet();

  // Load transactions from localStorage when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const storedTransactions = localStorage.getItem(`transactions_${user.id}`);
      if (storedTransactions) {
        try {
          const transactions = JSON.parse(storedTransactions);
          dispatch({ type: 'LOAD_TRANSACTIONS', payload: transactions });
        } catch (error) {
          console.error('Failed to parse transactions from localStorage', error);
        }
      }
    } else {
      dispatch({ type: 'RESET_TRANSACTIONS' });
    }
  }, [isAuthenticated, user]);

  // Save transactions to localStorage when they change
  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem(`transactions_${user.id}`, JSON.stringify(state.transactions));
    }
  }, [state.transactions, isAuthenticated, user]);

  // Send transaction
  const sendTransaction = async (params: SendTransactionParams) => {
    if (!activeWallet) {
      throw new Error('Aucun portefeuille actif sélectionné');
    }

    dispatch({ type: 'SEND_TRANSACTION_REQUEST' });
    try {
      // Check if MetaMask is installed for connected wallets
      if (activeWallet.isConnected && typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask n\'est pas installé');
      }

      // For demo purposes, we'll just simulate a transaction
      // In a real app, this would use ethers.js to send the transaction
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a mock transaction hash
      const txHash = '0x' + Array(64).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)).join('');
      
      const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        fromAddress: params.fromAddress,
        toAddress: params.toAddress,
        amount: params.amount,
        timestamp: Date.now(),
        hash: txHash,
        status: 'confirmed', // For demo purposes
        walletId: activeWallet.id,
        network: activeWallet.network,
      };

      dispatch({ type: 'SEND_TRANSACTION_SUCCESS', payload: newTransaction });
      return;
    } catch (error) {
      dispatch({ 
        type: 'SEND_TRANSACTION_FAILURE', 
        payload: error instanceof Error ? error.message : 'Erreur d\'envoi de transaction' 
      });
      throw error;
    }
  };

  // Get transactions for a specific wallet
  const getTransactionsForWallet = (walletId: string): Transaction[] => {
    return state.transactions.filter(tx => tx.walletId === walletId);
  };

  const value = {
    ...state,
    sendTransaction,
    getTransactionsForWallet,
  };

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
};

// Custom hook to use the transaction context
export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};
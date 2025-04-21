import { AddWalletParams, Wallet, WalletState } from '../types/wallet.types';
import React, { ReactNode, createContext, useContext, useEffect, useReducer } from 'react';

import { blockchainService } from '../lib/blockchain';
import { useAuth } from './AuthContext';
import { walletAPI } from '../services/api';

// Initial state
const initialState: WalletState = {
  wallets: [],
  activeWallet: null,
  isConnecting: false,
  error: null,
};

// Action types
type WalletAction =
  | { type: 'CONNECT_WALLET_REQUEST' }
  | { type: 'CONNECT_WALLET_SUCCESS'; payload: Wallet }
  | { type: 'CONNECT_WALLET_FAILURE'; payload: string }
  | { type: 'ADD_WALLET'; payload: Wallet }
  | { type: 'REMOVE_WALLET'; payload: string }
  | { type: 'SET_ACTIVE_WALLET'; payload: Wallet | null }
  | { type: 'UPDATE_WALLET'; payload: Wallet }
  | { type: 'LOAD_WALLETS'; payload: Wallet[] }
  | { type: 'RESET_WALLETS' };

// Reducer
const walletReducer = (state: WalletState, action: WalletAction): WalletState => {
  switch (action.type) {
    case 'CONNECT_WALLET_REQUEST':
      return { ...state, isConnecting: true, error: null };
    case 'CONNECT_WALLET_SUCCESS':
      // Check if wallet already exists
      if (state.wallets.some(wallet => wallet.id === action.payload.id)) {
        return {
          ...state,
          isConnecting: false,
          activeWallet: action.payload,
          wallets: state.wallets.map(wallet => 
            wallet.id === action.payload.id 
              ? { ...wallet, isConnected: true }
              : wallet
          ),
        };
      } else {
        return {
          ...state,
          isConnecting: false,
          activeWallet: action.payload,
          wallets: [...state.wallets, action.payload],
        };
      }
    case 'CONNECT_WALLET_FAILURE':
      return {
        ...state,
        isConnecting: false,
        error: action.payload,
      };
    case 'ADD_WALLET':
      // Prevent duplicates
      if (state.wallets.some(wallet => wallet.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        wallets: [...state.wallets, action.payload],
      };
    case 'REMOVE_WALLET':
      return {
        ...state,
        wallets: state.wallets.filter(wallet => wallet.id !== action.payload),
        activeWallet: state.activeWallet?.id === action.payload ? null : state.activeWallet,
      };
    case 'SET_ACTIVE_WALLET':
      return {
        ...state,
        activeWallet: action.payload,
      };
    case 'UPDATE_WALLET':
      return {
        ...state,
        wallets: state.wallets.map(wallet => 
          wallet.id === action.payload.id ? action.payload : wallet
        ),
        activeWallet: state.activeWallet?.id === action.payload.id 
          ? action.payload 
          : state.activeWallet,
      };
    case 'LOAD_WALLETS':
      return {
        ...state,
        wallets: action.payload,
      };
    case 'RESET_WALLETS':
      return initialState;
    default:
      return state;
  }
};

// Context
interface WalletContextType extends WalletState {
  connectWallet: (currency: string) => Promise<void>;
  addWallet: (params: AddWalletParams) => void;
  removeWallet: (id: string) => void;
  setActiveWallet: (wallet: Wallet | null) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Provider
interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Load wallets from API when user is authenticated
  useEffect(() => {
    const loadWallets = async () => {
      if (isAuthenticated && user) {
        try {
          const wallets = await walletAPI.getWallets(user.id);
          
          // Transform API wallets to match our Wallet type
          const transformedWallets: Wallet[] = wallets.map((wallet: any) => ({
            id: wallet.id.toString(),
            address: wallet.id.toString(), // Using wallet ID as address
            name: `${wallet.currency} Wallet`,
            balance: wallet.balance.toString(),
            currency: wallet.currency,
            isConnected: true,
          }));
          
          dispatch({ type: 'LOAD_WALLETS', payload: transformedWallets });
          
          // Set the first wallet as active if there are any
          if (transformedWallets.length > 0 && !state.activeWallet) {
            dispatch({ type: 'SET_ACTIVE_WALLET', payload: transformedWallets[0] });
          }
        } catch (error) {
          console.error('Failed to load wallets from API', error);
        }
      } else {
        dispatch({ type: 'RESET_WALLETS' });
      }
    };

    loadWallets();
  }, [isAuthenticated, user]);

  // Connect wallet (create a new wallet in the backend)
  const connectWallet = async (currency: string) => {
    if (!isAuthenticated || !user) {
      throw new Error('Vous devez être connecté pour ajouter un portefeuille');
    }

    dispatch({ type: 'CONNECT_WALLET_REQUEST' });
    try {
      // Create a new wallet using Web3
      const { address, privateKey } = await blockchainService.createWallet();
      
      // Create a new wallet in the backend
      const newWallet = await walletAPI.createWallet(user.id, currency, address);
      
      // Transform API wallet to match our Wallet type
      const wallet: Wallet = {
        id: newWallet.id.toString(),
        address: address,
        privateKey: privateKey, // Store private key securely
        name: `${currency} Wallet`,
        balance: '0.00',
        currency: currency,
        isConnected: true,
      };
      
      dispatch({ type: 'CONNECT_WALLET_SUCCESS', payload: wallet });
    } catch (error) {
      dispatch({ 
        type: 'CONNECT_WALLET_FAILURE', 
        payload: error instanceof Error ? error.message : 'Erreur de connexion du portefeuille' 
      });
    }
  };

  // Add wallet (for manual addition)
  const addWallet = async (params: AddWalletParams) => {
    try {
      // Import wallet using private key
      const { address } = await blockchainService.importWallet(params.privateKey);
      
      const wallet: Wallet = {
        id: Date.now().toString(),
        address: address,
        privateKey: params.privateKey,
        name: params.name,
        balance: '0.00',
        currency: params.currency || 'ETH',
        isConnected: true,
      };
      
      dispatch({ type: 'ADD_WALLET', payload: wallet });
    } catch (error) {
      throw new Error('Invalid private key');
    }
  };

  // Remove wallet
  const removeWallet = (id: string) => {
    dispatch({ type: 'REMOVE_WALLET', payload: id });
  };

  // Set active wallet
  const setActiveWallet = (wallet: Wallet | null) => {
    dispatch({ type: 'SET_ACTIVE_WALLET', payload: wallet });
  };

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connectWallet,
        addWallet,
        removeWallet,
        setActiveWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
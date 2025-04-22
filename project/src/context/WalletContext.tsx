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
        console.log('[WalletContext] Loading wallets for authenticated user:', {
          userId: user.id,
          isAuthenticated
        });
        try {
          const wallets = await walletAPI.getWallets(user.id);
          console.log('[WalletContext] Wallets loaded from API:', {
            count: wallets.length,
            wallets: wallets.map((w: Wallet) => ({
              ...w,
              encrypted_private_key: '***' // Hide private key in logs
            }))
          });
          
          dispatch({ type: 'LOAD_WALLETS', payload: wallets });
          
          // Set the first wallet as active if there are any
          if (wallets.length > 0 && !state.activeWallet) {
            console.log('[WalletContext] Setting first wallet as active:', {
              id: wallets[0].id,
              address: wallets[0].address
            });
            dispatch({ type: 'SET_ACTIVE_WALLET', payload: wallets[0] });
          }
        } catch (error) {
          console.error('[WalletContext] Failed to load wallets:', error);
        }
      } else {
        console.log('[WalletContext] User not authenticated, resetting wallets');
        dispatch({ type: 'RESET_WALLETS' });
      }
    };

    loadWallets();
  }, [isAuthenticated, user]);

  // Update balances periodically
  useEffect(() => {
    const updateBalances = async () => {
      if (state.wallets.length === 0) return;

      try {
        const updatedWallets = await Promise.all(
          state.wallets.map(async (wallet) => {
            try {
              const balance = await blockchainService.getBalance(wallet.address);
              return { ...wallet, balance };
            } catch (error) {
              console.error(`Failed to update balance for wallet ${wallet.address}:`, error);
              return wallet;
            }
          })
        );

        dispatch({ type: 'LOAD_WALLETS', payload: updatedWallets });
      } catch (error) {
        console.error('Failed to update wallet balances:', error);
      }
    };

    // Update immediately
    updateBalances();

    // Then update every 10 seconds
    const interval = setInterval(updateBalances, 10000);

    return () => clearInterval(interval);
  }, [state.wallets.length]); // Only recreate the interval if the number of wallets changes

  // Connect wallet (create a new wallet in the backend)
  const connectWallet = async (currency: string) => {
    if (!isAuthenticated || !user) {
      console.log('[WalletContext] Cannot connect wallet: User not authenticated');
      throw new Error('Vous devez être connecté pour ajouter un portefeuille');
    }

    console.log('[WalletContext] Starting wallet connection process:', {
      userId: user.id,
      currency,
      isAuthenticated,
      currentWallets: state.wallets.length
    });

    dispatch({ type: 'CONNECT_WALLET_REQUEST' });
    try {
      // Create a new wallet using Web3
      console.log('[WalletContext] Creating new wallet using blockchain service...');
      const { address, privateKey } = await blockchainService.createWallet();
      console.log('[WalletContext] New wallet created with address:', address);
      
      // Encrypt the private key (in a real app, use proper encryption)
      const encryptedPrivateKey = privateKey; // TODO: Implement proper encryption
      console.log('[WalletContext] Private key prepared for storage');
      
      // Create a new wallet in the backend
      console.log('[WalletContext] Saving wallet to backend database...', {
        userId: user.id,
        currency,
        address,
        hasPrivateKey: !!encryptedPrivateKey
      });
      
      const newWallet = await walletAPI.createWallet(user.id, currency, address, encryptedPrivateKey);
      console.log('[WalletContext] Wallet saved to database:', {
        id: newWallet.id,
        address: newWallet.address,
        currency: newWallet.currency,
        balance: newWallet.balance
      });
      
      dispatch({ type: 'CONNECT_WALLET_SUCCESS', payload: newWallet });
      
      // Load updated wallet list
      console.log('[WalletContext] Reloading wallet list...');
      const wallets = await walletAPI.getWallets(user.id);
      console.log('[WalletContext] Updated wallet list:', {
        count: wallets.length,
        wallets: wallets.map((w: Wallet) => ({
          id: w.id,
          address: w.address,
          currency: w.currency,
          balance: w.balance
        }))
      });
      
      dispatch({ type: 'LOAD_WALLETS', payload: wallets });
      
      // Set as active wallet if it's the first one
      if (wallets.length === 1) {
        console.log('[WalletContext] Setting as active wallet (first wallet)');
        dispatch({ type: 'SET_ACTIVE_WALLET', payload: newWallet });
      }
    } catch (error: any) {
      console.error('[WalletContext] Error connecting wallet:', error);
      console.error('[WalletContext] Error details:', {
        message: error?.message,
        stack: error?.stack,
        response: error?.response?.data
      });
      dispatch({ type: 'CONNECT_WALLET_FAILURE', payload: error?.message || 'Failed to connect wallet' });
      throw error;
    }
  };

  // Add wallet (for manual addition)
  const addWallet = async (params: AddWalletParams) => {
    try {
      // Import wallet using private key
      const { address } = await blockchainService.importWallet(params.privateKey);
      
      // Get the initial balance
      const balance = await blockchainService.getBalance(address);
      
      const wallet: Wallet = {
        id: Date.now().toString(),
        address: address,
        privateKey: params.privateKey,
        name: params.name,
        balance: balance,
        currency: 'ETH',
        isConnected: true,
      };

      dispatch({ type: 'ADD_WALLET', payload: wallet });
      
      // Set as active wallet if no other wallet is active
      if (!state.activeWallet) {
        dispatch({ type: 'SET_ACTIVE_WALLET', payload: wallet });
      }
    } catch (error) {
      console.error('Error adding wallet:', error);
      throw error;
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
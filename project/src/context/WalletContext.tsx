import { AddWalletParams, Wallet, WalletState } from '../types/wallet.types';
import React, { ReactNode, createContext, useCallback, useContext, useEffect, useReducer } from 'react';

import blockchainService from '../lib/blockchain';
import { useAuth } from './AuthContext';
import { walletAPI } from '../services/api';

// Initial state
const initialState: WalletState = {
  wallets: [],
  activeWallet: null,
  isConnecting: false,
  error: null,
};

// Define action types
type WalletAction =
  | { type: 'CONNECT_WALLET_REQUEST' }
  | { type: 'CONNECT_WALLET_SUCCESS'; payload: Wallet }
  | { type: 'CONNECT_WALLET_FAILURE'; payload: string }
  | { type: 'ADD_WALLET'; payload: Wallet }
  | { type: 'REMOVE_WALLET'; payload: string }
  | { type: 'SET_ACTIVE_WALLET'; payload: Wallet | null }
  | { type: 'UPDATE_WALLET'; payload: Wallet }
  | { type: 'LOAD_WALLETS'; payload: Wallet[] }
  | { type: 'RESET_WALLETS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_WALLETS'; payload: Wallet[] };

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
    case 'SET_LOADING':
      return { ...state, isConnecting: action.payload };
    case 'SET_WALLETS':
      return { ...state, wallets: action.payload };
    default:
      return state;
  }
};

// Context
interface WalletContextType extends WalletState {
  connectWallet: (currency: string, name?: string) => Promise<void>;
  addWallet: (params: AddWalletParams) => void;
  removeWallet: (id: string) => void;
  setActiveWallet: (wallet: Wallet | null) => void;
  refreshBalances: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Provider
interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Load wallets when component mounts or auth state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('[WalletContext] User authenticated, loading wallets...');
      loadWallets();
    } else {
      console.log('[WalletContext] User not authenticated, resetting wallets');
      dispatch({ type: 'RESET_WALLETS' });
    }
  }, [isAuthenticated, user]);

  // Load wallets from backend
  const loadWallets = async () => {
    console.log('[WalletContext] Starting to load wallets');
    
    if (!isAuthenticated || !user) {
      console.error('[WalletContext] Cannot load wallets: User not authenticated');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      console.log('[WalletContext] Fetching wallets from backend for user:', user.id);
      const wallets = await walletAPI.getWallets(user.id);
      console.log('[WalletContext] Fetched wallets from backend:', wallets);
      
      // Store private keys in localStorage for each wallet
      wallets.forEach((wallet: any) => {
        if (wallet.encrypted_private_key) {
          localStorage.setItem(`wallet_private_key_${wallet.id}`, wallet.encrypted_private_key);
        }
      });
      
      // Fetch balances for each wallet
      const walletsWithBalances = await Promise.all(
        wallets.map(async (wallet: Wallet) => {
          try {
            // Get balance from blockchain
            const balance = await blockchainService.getBalance(wallet.address);
            
            return {
              ...wallet,
              balance: balance.toString(),
              isConnected: true
            };
          } catch (error) {
            console.error(`[WalletContext] Error fetching balance for wallet ${wallet.address}:`, error);
            return {
              ...wallet,
              balance: '0',
              isConnected: false
            };
          }
        })
      );
      
      console.log('[WalletContext] Wallets with balances:', walletsWithBalances);
      
      // Update state with wallets
      dispatch({ type: 'SET_WALLETS', payload: walletsWithBalances });
      
      // Set active wallet if none is selected
      if (!state.activeWallet && walletsWithBalances.length > 0) {
        console.log('[WalletContext] Setting first wallet as active (no active wallet)');
        dispatch({ type: 'SET_ACTIVE_WALLET', payload: walletsWithBalances[0] });
      }
      
      console.log('[WalletContext] Wallet loading completed successfully');
    } catch (error) {
      console.error('[WalletContext] Error loading wallets:', error);
      console.error('[WalletContext] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Update balances periodically
  useEffect(() => {
    const updateBalances = async () => {
      if (state.wallets.length === 0) return;

      console.log('[WalletContext] Updating wallet balances...');
      try {
        const updatedWallets = await Promise.all(
          state.wallets.map(async (wallet) => {
            try {
              console.log(`[WalletContext] Fetching balance for wallet ${wallet.address}...`);
              const balance = await blockchainService.getBalance(wallet.address);
              console.log(`[WalletContext] Updated balance for ${wallet.address}: ${balance} ${wallet.currency}`);
              
              // Only update if balance has changed
              if (wallet.balance !== balance) {
                console.log(`[WalletContext] Balance changed for ${wallet.address}: ${wallet.balance} -> ${balance}`);
                return { ...wallet, balance };
              }
              return wallet;
            } catch (error) {
              console.error(`[WalletContext] Failed to update balance for wallet ${wallet.address}:`, error);
              return wallet;
            }
          })
        );

        // Check if any balances actually changed
        const hasChanges = updatedWallets.some((wallet, index) => 
          wallet.balance !== state.wallets[index].balance
        );

        if (hasChanges) {
          console.log('[WalletContext] Balances updated, dispatching LOAD_WALLETS');
          dispatch({ type: 'LOAD_WALLETS', payload: updatedWallets });
          
          // Update active wallet if it changed
          if (state.activeWallet) {
            const updatedActiveWallet = updatedWallets.find(w => w.id === state.activeWallet?.id);
            if (updatedActiveWallet && updatedActiveWallet.balance !== state.activeWallet.balance) {
              console.log(`[WalletContext] Updating active wallet balance: ${state.activeWallet.balance} -> ${updatedActiveWallet.balance}`);
              dispatch({ type: 'SET_ACTIVE_WALLET', payload: updatedActiveWallet });
            }
          }
        } else {
          console.log('[WalletContext] No balance changes detected');
        }
      } catch (error) {
        console.error('[WalletContext] Failed to update wallet balances:', error);
      }
    };

    // Update immediately
    updateBalances();

    // Then update every 5 seconds (reduced from 10 seconds for more responsiveness)
    const interval = setInterval(updateBalances, 5000);

    return () => clearInterval(interval);
  }, [state.wallets.length]); // Only recreate the interval if the number of wallets changes

  // Add a function to manually refresh balances
  const refreshBalances = async () => {
    console.log('[WalletContext] Manual balance refresh requested');
    if (state.wallets.length === 0) {
      console.log('[WalletContext] No wallets to refresh');
      return;
    }

    try {
      const updatedWallets = await Promise.all(
        state.wallets.map(async (wallet) => {
          try {
            console.log(`[WalletContext] Manually fetching balance for wallet ${wallet.address}...`);
            const balance = await blockchainService.getBalance(wallet.address);
            console.log(`[WalletContext] Updated balance for ${wallet.address}: ${balance} ${wallet.currency}`);
            
            // Always return the updated wallet with the new balance
            return { ...wallet, balance };
          } catch (error) {
            console.error(`[WalletContext] Failed to update balance for wallet ${wallet.address}:`, error);
            return wallet;
          }
        })
      );

      // Always dispatch the updated wallets to ensure state is refreshed
      console.log('[WalletContext] Dispatching updated wallets to state');
      dispatch({ type: 'LOAD_WALLETS', payload: updatedWallets });
      
      // Update active wallet if it exists
      if (state.activeWallet) {
        const updatedActiveWallet = updatedWallets.find(w => w.id === state.activeWallet?.id);
        if (updatedActiveWallet) {
          console.log(`[WalletContext] Updating active wallet balance: ${state.activeWallet.balance} -> ${updatedActiveWallet.balance}`);
          dispatch({ type: 'SET_ACTIVE_WALLET', payload: updatedActiveWallet });
        }
      }
    } catch (error) {
      console.error('[WalletContext] Failed to refresh balances:', error);
    }
  };

  // Connect wallet (create a new wallet in the backend)
  const connectWallet = async (currency: string, name?: string) => {
    if (!isAuthenticated || !user) {
      console.log('[WalletContext] Cannot connect wallet: User not authenticated');
      throw new Error('Vous devez être connecté pour ajouter un portefeuille');
    }

    console.log('[WalletContext] Starting wallet connection process:', {
      userId: user.id,
      currency,
      name: name || 'Nouveau portefeuille',
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
        name: name || 'Nouveau portefeuille',
        hasPrivateKey: !!encryptedPrivateKey
      });
      
      const newWallet = await walletAPI.createWallet(user.id, currency, address, encryptedPrivateKey, name || 'Nouveau portefeuille');
      console.log('[WalletContext] Wallet saved to database:', {
        id: newWallet.id,
        address: newWallet.address,
        currency: newWallet.currency,
        name: newWallet.name,
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
          name: w.name,
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
    console.log('[WalletContext] Starting manual wallet addition:', {
      name: params.name,
      hasPrivateKey: !!params.privateKey,
      currency: params.currency || 'ETH'
    });

    if (!isAuthenticated || !user) {
      console.error('[WalletContext] Cannot add wallet: User not authenticated');
      throw new Error('Vous devez être connecté pour ajouter un portefeuille');
    }

    try {
      // Import wallet using private key
      console.log('[WalletContext] Importing wallet using private key...');
      const { address } = await blockchainService.importWallet(params.privateKey);
      console.log('[WalletContext] Wallet imported successfully:', { address });
      
      // Get the initial balance
      console.log('[WalletContext] Fetching initial balance...');
      const balance = await blockchainService.getBalance(address);
      console.log('[WalletContext] Initial balance fetched:', { balance });
      
      // Save wallet to backend
      console.log('[WalletContext] Saving wallet to backend...', {
        userId: user.id,
        currency: params.currency || 'ETH',
        address,
        hasPrivateKey: !!params.privateKey
      });
      
      const savedWallet = await walletAPI.createWallet(
        user.id, 
        params.currency || 'ETH', 
        address, 
        params.privateKey
      );
      
      console.log('[WalletContext] Wallet saved to backend:', {
        id: savedWallet.id,
        address: savedWallet.address,
        currency: savedWallet.currency
      });
      
      // Store the private key in localStorage for this wallet
      if (params.privateKey) {
        console.log('[WalletContext] Storing private key in localStorage for wallet:', savedWallet.id);
        localStorage.setItem(`wallet_private_key_${savedWallet.id}`, params.privateKey);
      }
      
      // Add wallet to state
      const newWallet: Wallet = {
        id: savedWallet.id,
        name: params.name,
        address: savedWallet.address,
        balance: balance.toString(),
        currency: savedWallet.currency,
        isConnected: true
      };
      
      dispatch({ type: 'ADD_WALLET', payload: newWallet });
      
      // Set as active wallet if it's the first one
      if (state.wallets.length === 0) {
        console.log('[WalletContext] Setting new wallet as active (first wallet)');
        dispatch({ type: 'SET_ACTIVE_WALLET', payload: newWallet });
      }
      
      return newWallet;
    } catch (error) {
      console.error('[WalletContext] Failed to add wallet:', error);
      console.error('[WalletContext] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  };

  // Remove wallet
  const removeWallet = async (id: string) => {
    console.log('[WalletContext] Removing wallet:', { id });
    try {
      await walletAPI.deleteWallet(id);
      console.log('[WalletContext] Wallet deleted from backend, updating state');
      dispatch({ type: 'REMOVE_WALLET', payload: id });
    } catch (error: any) {
      console.error('[WalletContext] Error deleting wallet:', error);
      console.error('[WalletContext] Error details:', {
        message: error?.message,
        stack: error?.stack
      });
      throw error;
    }
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
        refreshBalances,
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
import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { WalletState, Wallet, AddWalletParams } from '../types/wallet.types';
import { useAuth } from './AuthContext';

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
      if (state.wallets.some(wallet => wallet.address === action.payload.address)) {
        return {
          ...state,
          isConnecting: false,
          activeWallet: action.payload,
          wallets: state.wallets.map(wallet => 
            wallet.address === action.payload.address 
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
      if (state.wallets.some(wallet => wallet.address === action.payload.address)) {
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
  connectMetaMask: () => Promise<void>;
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

  // Load wallets from localStorage when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const storedWallets = localStorage.getItem(`wallets_${user.id}`);
      if (storedWallets) {
        try {
          const wallets = JSON.parse(storedWallets);
          dispatch({ type: 'LOAD_WALLETS', payload: wallets });
        } catch (error) {
          console.error('Failed to parse wallets from localStorage', error);
        }
      }
    } else {
      dispatch({ type: 'RESET_WALLETS' });
    }
  }, [isAuthenticated, user]);

  // Save wallets to localStorage when they change
  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem(`wallets_${user.id}`, JSON.stringify(state.wallets));
    }
  }, [state.wallets, isAuthenticated, user]);

  // Connect MetaMask wallet
  const connectMetaMask = async () => {
    dispatch({ type: 'CONNECT_WALLET_REQUEST' });
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask n\'est pas installé');
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];

      if (!address) {
        throw new Error('Aucun compte MetaMask trouvé');
      }

      // Get network information
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const networkName = getNetworkName(chainId);

      // Get balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      
      const balanceInEth = (parseInt(balance, 16) / 1e18).toFixed(4);

      const newWallet: Wallet = {
        id: `metamask-${address}`,
        address,
        name: 'MetaMask',
        balance: balanceInEth,
        network: networkName,
        isConnected: true,
      };

      dispatch({ type: 'CONNECT_WALLET_SUCCESS', payload: newWallet });
    } catch (error) {
      dispatch({ 
        type: 'CONNECT_WALLET_FAILURE', 
        payload: error instanceof Error ? error.message : 'Erreur de connexion au portefeuille' 
      });
    }
  };

  // Add a wallet manually
  const addWallet = (params: AddWalletParams) => {
    const newWallet: Wallet = {
      id: `wallet-${Date.now()}`,
      address: params.address,
      name: params.name,
      isConnected: false,
    };
    
    dispatch({ type: 'ADD_WALLET', payload: newWallet });
  };

  // Remove a wallet
  const removeWallet = (id: string) => {
    dispatch({ type: 'REMOVE_WALLET', payload: id });
  };

  // Set active wallet
  const setActiveWallet = (wallet: Wallet | null) => {
    dispatch({ type: 'SET_ACTIVE_WALLET', payload: wallet });
  };

  const value = {
    ...state,
    connectMetaMask,
    addWallet,
    removeWallet,
    setActiveWallet,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

// Helper function to get network name from chainId
const getNetworkName = (chainId: string): string => {
  switch (chainId) {
    case '0x1':
      return 'Ethereum Mainnet';
    case '0x3':
      return 'Ropsten';
    case '0x4':
      return 'Rinkeby';
    case '0x5':
      return 'Goerli';
    case '0xaa36a7':
      return 'Sepolia';
    case '0x89':
      return 'Polygon';
    case '0x38':
      return 'Binance Smart Chain';
    default:
      return `Réseau ${chainId}`;
  }
};

// Add ethereum to window type
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Custom hook to use the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
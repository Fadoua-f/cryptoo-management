export interface Wallet {
  id: string;
  address: string;
  name?: string;
  balance?: string;
  network?: string;
  isConnected: boolean;
}

export interface WalletState {
  wallets: Wallet[];
  activeWallet: Wallet | null;
  isConnecting: boolean;
  error: string | null;
}

export interface AddWalletParams {
  name: string;
  address: string;
}
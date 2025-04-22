export interface Wallet {
  id: string;
  address: string;
  privateKey?: string;
  name: string;
  balance: string;
  currency: string;
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
  privateKey?: string;
  currency?: string;
}
export interface Transaction {
  id: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  timestamp: number;
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  walletId: string;
  network?: string;
}

export interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

export interface SendTransactionParams {
  fromAddress: string;
  toAddress: string;
  amount: string;
}
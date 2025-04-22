export type TransactionType = 'buy' | 'sell';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  createdAt: string;
  walletId: string;
}

export interface CreateTransactionDTO {
  type: TransactionType;
  amount: number;
  currency: string;
  walletId: string;
  toAddress?: string;
}

export interface TransactionContextType {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  createTransaction: (transaction: CreateTransactionDTO) => Promise<void>;
} 
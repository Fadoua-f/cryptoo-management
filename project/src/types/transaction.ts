export type TransactionType = 'SEND' | 'RECEIVE';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: string;
  from_address?: string;
  to_address?: string;
  tx_hash?: string;
  status: TransactionStatus;
  created_at?: string;
  wallet_id: string;
}

export interface CreateTransactionDTO {
  wallet_id: string;
  type: TransactionType;
  amount: string;
  to_address?: string;
  tx_hash?: string;
  currency?: string;
  created_at?: string;
}

export interface TransactionContextType {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  createTransaction: (transaction: CreateTransactionDTO) => Promise<void>;
} 
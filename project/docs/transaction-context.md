# TransactionContext Implementation

This document explains the implementation of the TransactionContext in our cryptocurrency application, which manages transaction state and operations.

## Overview

The TransactionContext provides a centralized way to manage cryptocurrency transactions in our application. It handles:

- Loading transactions for the active wallet
- Creating new transactions
- Managing loading states and errors
- Transforming data between API and frontend formats

## Key Components

### Transaction Types

The transaction system uses several TypeScript types and interfaces:

```typescript
// Transaction types
export type TransactionType = 'buy' | 'sell';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

// Transaction interface
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  createdAt: string;
  walletId: string;
}

// DTO for creating transactions
export interface CreateTransactionDTO {
  type: TransactionType;
  amount: number;
  currency: string;
  walletId: string;
}

// Context interface
export interface TransactionContextType {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  createTransaction: (transaction: CreateTransactionDTO) => Promise<void>;
}
```

### TransactionContext Implementation

The TransactionContext is implemented using React's Context API and hooks:

```typescript
const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { activeWallet } = useWallet();

  // Load transactions when active wallet changes
  useEffect(() => {
    const loadTransactions = async () => {
      if (activeWallet) {
        setIsLoading(true);
        try {
          const apiTransactions = await transactionAPI.getTransactions(activeWallet.id);
          
          // Transform API transactions to match our Transaction type
          const transformedTransactions: Transaction[] = apiTransactions.map((tx: any) => ({
            id: tx.id.toString(),
            type: tx.type === 'deposit' ? 'buy' : 'sell',
            amount: tx.amount,
            currency: activeWallet.currency || 'BTC',
            status: 'confirmed',
            createdAt: new Date(tx.created_at).toISOString(),
            walletId: activeWallet.id,
          }));
          
          setTransactions(transformedTransactions);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load transactions');
        } finally {
          setIsLoading(false);
        }
      } else {
        setTransactions([]);
      }
    };

    loadTransactions();
  }, [activeWallet]);

  const createTransaction = async (transaction: CreateTransactionDTO) => {
    if (!activeWallet) {
      setError('No active wallet selected');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Create transaction in the backend
      const apiTransaction = await transactionAPI.createTransaction(
        transaction.walletId,
        transaction.type === 'buy' ? 'deposit' : 'withdrawal',
        transaction.amount
      );
      
      // Transform API transaction to match our Transaction type
      const newTransaction: Transaction = {
        id: apiTransaction.id.toString(),
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        status: 'pending',
        createdAt: new Date().toISOString(),
        walletId: transaction.walletId,
      };
      
      setTransactions(prev => [...prev, newTransaction]);
      
      // Update transaction status to confirmed after a delay
      setTimeout(() => {
        setTransactions(prev => 
          prev.map(tx => 
            tx.id === newTransaction.id 
              ? { ...tx, status: 'confirmed' }
              : tx
          )
        );
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        isLoading,
        error,
        createTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
```

### API Integration

The TransactionContext integrates with the backend API through the `transactionAPI` service:

```typescript
// Transaction API
export const transactionAPI = {
  getTransactions: async (walletId: string) => {
    const response = await api.get(`/transactions/wallet/${walletId}`);
    return response.data;
  },
  createTransaction: async (walletId: string, type: 'deposit' | 'withdrawal', amount: number) => {
    const response = await api.post('/transactions', { 
      wallet_id: walletId, 
      type, 
      amount,
      created_at: new Date().toISOString()
    });
    return response.data;
  },
};
```

## Key Features

### Automatic Transaction Loading

The TransactionContext automatically loads transactions when the active wallet changes:

```typescript
useEffect(() => {
  const loadTransactions = async () => {
    if (activeWallet) {
      setIsLoading(true);
      try {
        const apiTransactions = await transactionAPI.getTransactions(activeWallet.id);
        
        // Transform API transactions to match our Transaction type
        const transformedTransactions: Transaction[] = apiTransactions.map((tx: any) => ({
          id: tx.id.toString(),
          type: tx.type === 'deposit' ? 'buy' : 'sell',
          amount: tx.amount,
          currency: activeWallet.currency || 'BTC',
          status: 'confirmed',
          createdAt: new Date(tx.created_at).toISOString(),
          walletId: activeWallet.id,
        }));
        
        setTransactions(transformedTransactions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    } else {
      setTransactions([]);
    }
  };

  loadTransactions();
}, [activeWallet]);
```

### Transaction Creation

The `createTransaction` function creates a new transaction through the API:

```typescript
const createTransaction = async (transaction: CreateTransactionDTO) => {
  if (!activeWallet) {
    setError('No active wallet selected');
    return;
  }

  setIsLoading(true);
  setError(null);
  try {
    // Create transaction in the backend
    const apiTransaction = await transactionAPI.createTransaction(
      transaction.walletId,
      transaction.type === 'buy' ? 'deposit' : 'withdrawal',
      transaction.amount
    );
    
    // Transform API transaction to match our Transaction type
    const newTransaction: Transaction = {
      id: apiTransaction.id.toString(),
      type: transaction.type,
      amount: transaction.amount,
      currency: transaction.currency,
      status: 'pending',
      createdAt: new Date().toISOString(),
      walletId: transaction.walletId,
    };
    
    setTransactions(prev => [...prev, newTransaction]);
    
    // Update transaction status to confirmed after a delay
    setTimeout(() => {
      setTransactions(prev => 
        prev.map(tx => 
          tx.id === newTransaction.id 
            ? { ...tx, status: 'confirmed' }
            : tx
        )
      );
    }, 2000);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred while creating the transaction');
  } finally {
    setIsLoading(false);
  }
};
```

### Data Transformation

The TransactionContext handles transformation between API and frontend formats:

- API uses 'deposit'/'withdrawal' for transaction types
- Frontend uses 'buy'/'sell' for transaction types
- API timestamps are converted to ISO strings
- API IDs are converted to strings

## Usage

To use the TransactionContext in a component:

```typescript
import { useTransaction } from '../context/TransactionContext';

const MyComponent = () => {
  const { transactions, isLoading, error, createTransaction } = useTransaction();
  
  // Use the context values and functions
  // ...
};
```

## Future Improvements

1. Add pagination for loading transactions
2. Implement real-time updates using WebSockets
3. Add transaction filtering and sorting
4. Implement transaction history export
5. Add transaction details view 
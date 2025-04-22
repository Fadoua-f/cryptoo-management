import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  register: async (credentials: { email: string; password: string; name?: string }) => {
    const response = await api.post('/auth/register', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Wallet API
export const walletAPI = {
  getWallets: async (userId: string) => {
    console.log('[walletAPI] Fetching wallets for user:', userId);
    const response = await api.get(`/wallets/${userId}`);
    console.log('[walletAPI] Found wallets:', response.data);
    return response.data;
  },
  createWallet: async (userId: string, currency: string, address: string, encryptedPrivateKey: string, name?: string) => {
    console.log('[walletAPI] Creating new wallet:', {
      userId,
      currency,
      address,
      name: name || 'Nouveau portefeuille',
      hasPrivateKey: !!encryptedPrivateKey
    });
    
    const response = await api.post('/wallets', { 
      user_id: userId, 
      currency, 
      address,
      name: name || 'Nouveau portefeuille',
      encrypted_private_key: encryptedPrivateKey
    });
    
    console.log('[walletAPI] Wallet created successfully:', {
      id: response.data.id,
      address: response.data.address,
      currency: response.data.currency,
      name: response.data.name
    });
    
    return response.data;
  },
  updateWallet: async (walletId: string, balance: number) => {
    console.log('[walletAPI] Updating wallet balance:', { walletId, balance });
    const response = await api.put(`/wallets/${walletId}`, { balance });
    console.log('[walletAPI] Wallet updated successfully:', response.data);
    return response.data;
  },
  deleteWallet: async (walletId: string) => {
    console.log('[walletAPI] Deleting wallet:', { walletId });
    const response = await api.delete(`/wallets/${walletId}`);
    console.log('[walletAPI] Wallet deleted successfully:', response.data);
    return response.data;
  }
};

// Transaction API
export const transactionAPI = {
  getTransactions: async (walletId: string) => {
    console.log('[transactionAPI] Fetching transactions for wallet:', walletId);
    try {
      const response = await api.get(`/transactions/wallet/${walletId}`);
      console.log('[transactionAPI] Raw API response:', response.data);
      
      // Ensure all transactions have the required fields
      const processedTransactions = response.data.map((t: any) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        to_address: t.to_address,
        from_address: t.from_address,
        tx_hash: t.tx_hash,
        created_at: t.created_at,
        wallet_id: t.wallet_id
      }));
      
      console.log('[transactionAPI] Processed transactions:', processedTransactions);
      console.log('[transactionAPI] Found transactions:', {
        count: processedTransactions.length,
        transactions: processedTransactions.map((t: any) => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          status: t.status
        }))
      });
      
      return processedTransactions;
    } catch (error) {
      console.error('[transactionAPI] Error fetching transactions:', error);
      console.error('[transactionAPI] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        response: error instanceof Error && 'response' in error ? (error as any).response?.data : undefined
      });
      return [];
    }
  },
  createTransaction: async (data: { wallet_id: string; type: string; amount: string; to_address?: string; currency?: string; tx_hash?: string; created_at?: string }) => {
    try {
      console.log('[transactionAPI] Creating transaction in backend:', {
        wallet_id: data.wallet_id,
        type: data.type,
        amount: data.amount,
        to_address: data.to_address,
        currency: data.currency,
        tx_hash: data.tx_hash,
        timestamp: new Date().toISOString()
      });
      
      const response = await api.post('/transactions', { 
        ...data,
        created_at: data.created_at || new Date().toISOString()
      });
      
      console.log('[transactionAPI] Transaction created in backend:', {
        id: response.data.id,
        wallet_id: response.data.wallet_id,
        type: response.data.type,
        amount: response.data.amount,
        status: response.data.status,
        created_at: response.data.created_at
      });
      
      return response.data;
    } catch (error) {
      console.error('[transactionAPI] Error creating transaction in backend:', error);
      console.error('[transactionAPI] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        response: error instanceof Error && 'response' in error ? (error as any).response?.data : undefined
      });
      
      // If the backend is not available, return a mock transaction
      console.log('[transactionAPI] Returning mock transaction due to backend error');
      return {
        id: Date.now().toString(),
        ...data,
        created_at: new Date().toISOString(),
        status: 'PENDING'
      };
    }
  },
};

// 2FA API
export const twoFactorAPI = {
  setup: async (userId: string) => {
    console.log('Making 2FA setup API request for user:', userId);
    try {
      const response = await api.post('/2fa/setup', { userId });
      console.log('2FA setup API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('2FA setup API error:', error);
      throw error;
    }
  },
  verify: async (token: string) => {
    const response = await api.post('/2fa/verify', { token });
    return response.data;
  },
  enable: async (token: string) => {
    const response = await api.post('/2fa/enable', { token });
    return response.data;
  },
  disable: async (token: string) => {
    const response = await api.post('/2fa/disable', { token });
    return response.data;
  },
};

export default api; 
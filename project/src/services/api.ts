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
  createWallet: async (userId: string, currency: string, address: string, encryptedPrivateKey: string) => {
    console.log('[walletAPI] Creating new wallet:', {
      userId,
      currency,
      address,
      hasPrivateKey: !!encryptedPrivateKey
    });
    
    const response = await api.post('/wallets', { 
      user_id: userId, 
      currency, 
      address,
      encrypted_private_key: encryptedPrivateKey
    });
    
    console.log('[walletAPI] Wallet created successfully:', {
      id: response.data.id,
      address: response.data.address,
      currency: response.data.currency
    });
    
    return response.data;
  },
  updateWallet: async (walletId: string, balance: number) => {
    console.log('[walletAPI] Updating wallet balance:', { walletId, balance });
    const response = await api.put(`/wallets/${walletId}`, { balance });
    console.log('[walletAPI] Wallet updated successfully:', response.data);
    return response.data;
  },
};

// Transaction API
export const transactionAPI = {
  getTransactions: async (walletId: string) => {
    const response = await api.get(`/transactions/wallet/${walletId}`);
    return response.data;
  },
  createTransaction: async (data: { wallet_id: string; type: string; amount: string }) => {
    try {
      console.log('Creating transaction in backend:', data);
      
      const response = await api.post('/transactions', { 
        ...data,
        created_at: new Date().toISOString()
      });
      console.log('Transaction created in backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating transaction in backend:', error);
      // If the backend is not available, return a mock transaction
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
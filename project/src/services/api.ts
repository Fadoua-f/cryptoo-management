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
    const response = await api.get(`/wallets/${userId}`);
    return response.data;
  },
  createWallet: async (userId: string, currency: string, balance: number = 0) => {
    const response = await api.post('/wallets', { user_id: userId, currency, balance });
    return response.data;
  },
  updateWallet: async (walletId: string, balance: number) => {
    const response = await api.put(`/wallets/${walletId}`, { balance });
    return response.data;
  },
};

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

// 2FA API
export const twoFactorAPI = {
  setup: async () => {
    const response = await api.post('/2fa/setup');
    return response.data;
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
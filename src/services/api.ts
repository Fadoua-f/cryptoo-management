import { api } from './axiosConfig';

// Auth API
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  register: async (credentials: { email: string; password: string; firstName: string; lastName: string }) => {
    const response = await api.post('/auth/register', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data.user;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
}; 
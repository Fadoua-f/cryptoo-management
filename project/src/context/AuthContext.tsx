import { AuthState, LoginCredentials, RegisterCredentials, User } from '../types/auth.types';
import React, { ReactNode, createContext, useContext, useReducer } from 'react';

import { authAPI } from '../services/api';

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_REQUEST' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
    case 'REGISTER_REQUEST':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    default:
      return state;
  }
};

// Context type
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ requires2FA?: boolean }>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already logged in
  React.useEffect(() => {
    console.log('[AuthContext] Checking for stored user and token');
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    console.log('[AuthContext] Stored data:', {
      hasStoredUser: !!storedUser,
      hasToken: !!token
    });
    
    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);
        console.log('[AuthContext] Successfully parsed stored user:', {
          id: user.id,
          email: user.email
        });
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } catch (error) {
        console.error('[AuthContext] Failed to parse user from localStorage', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      console.log('[AuthContext] No stored user or token found');
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    console.log('[AuthContext] Attempting login with email:', credentials.email);
    dispatch({ type: 'LOGIN_REQUEST' });
    try {
      const response = await authAPI.login(credentials);
      console.log('[AuthContext] Login response:', {
        hasUser: !!response.user,
        requires2FA: !!response.requires2FA
      });
      
      // Check if user exists in response
      if (!response.user) {
        console.log('[AuthContext] Login failed: No user found');
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Invalid credentials' });
        return { requires2FA: false };
      }
      
      // Check if 2FA is required
      if (response.requires2FA) {
        console.log('[AuthContext] 2FA required for login');
        return { requires2FA: true };
      }

      console.log('[AuthContext] Login successful, dispatching LOGIN_SUCCESS');
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      
      return { requires2FA: false };
    } catch (error) {
      console.error('[AuthContext] Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    dispatch({ type: 'REGISTER_REQUEST' });
    try {
      const user = await authAPI.register(credentials);
      dispatch({ type: 'REGISTER_SUCCESS', payload: user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'REGISTER_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const logout = () => {
    authAPI.logout();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
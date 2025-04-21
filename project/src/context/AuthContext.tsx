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

// Context
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
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
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  // Login implementation using the API
  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_REQUEST' });
    try {
      const { email, password } = credentials;
      
      if (!email || !password) {
        throw new Error("L'email et le mot de passe sont requis");
      }
      
      const response = await authAPI.login(email, password);
      
      // Store token and user info
      localStorage.setItem('token', response.token);
      
      const user: User = {
        id: response.userId.toString(),
        email: email,
        name: email.split('@')[0], // Use email username as name if not provided
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error instanceof Error ? error.message : 'Erreur de connexion' 
      });
    }
  };

  // Register implementation using the API
  const register = async (credentials: RegisterCredentials) => {
    dispatch({ type: 'REGISTER_REQUEST' });
    try {
      const { email, password, name } = credentials;
      
      if (!email || !password) {
        throw new Error("L'email et le mot de passe sont requis");
      }
      
      const username = name || email.split('@')[0];
      const response = await authAPI.register(username, email, password);
      
      // Store token and user info
      localStorage.setItem('token', response.token);
      
      const user: User = {
        id: response.userId.toString(),
        email: email,
        name: username,
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'REGISTER_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ 
        type: 'REGISTER_FAILURE', 
        payload: error instanceof Error ? error.message : 'Erreur d\'inscription' 
      });
    }
  };

  // Logout implementation
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
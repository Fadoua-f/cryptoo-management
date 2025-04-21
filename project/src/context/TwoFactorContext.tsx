import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

import { twoFactorAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface TwoFactorContextType {
  isTwoFactorEnabled: boolean;
  isTwoFactorVerified: boolean;
  qrCodeUrl: string | null;
  secret: string | null;
  backupCodes: string[];
  setupTwoFactor: () => Promise<void>;
  verifyTwoFactor: (code: string) => Promise<void>;
  verifyBackupCode: (code: string) => Promise<void>;
  disableTwoFactor: () => Promise<void>;
}

const TwoFactorContext = createContext<TwoFactorContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  TWO_FACTOR_ENABLED: 'twoFactorEnabled',
  TWO_FACTOR_VERIFIED: 'twoFactorVerified',
  QR_CODE_URL: 'qrCodeUrl',
  SECRET: 'secret',
  BACKUP_CODES: 'backupCodes',
};

export function useTwoFactor() {
  const context = useContext(TwoFactorContext);
  if (context === undefined) {
    throw new Error('useTwoFactor must be used within a TwoFactorProvider');
  }
  return context;
}

interface TwoFactorProviderProps {
  children: ReactNode;
}

export function TwoFactorProvider({ children }: TwoFactorProviderProps) {
  const { user } = useAuth();
  
  useEffect(() => {
    console.log('TwoFactorProvider mounted with user:', user ? { id: user.id } : 'no user');
  }, [user]);

  // Initialize state from localStorage or defaults
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.TWO_FACTOR_ENABLED);
    const value = stored ? JSON.parse(stored) : false;
    console.log('Initializing isTwoFactorEnabled:', value);
    return value;
  });
  
  const [isTwoFactorVerified, setIsTwoFactorVerified] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.TWO_FACTOR_VERIFIED);
    const value = stored ? JSON.parse(stored) : false;
    console.log('Initializing isTwoFactorVerified:', value);
    return value;
  });
  
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(() => {
    const value = localStorage.getItem(STORAGE_KEYS.QR_CODE_URL);
    console.log('Initializing qrCodeUrl:', value ? 'present' : 'missing');
    return value;
  });
  
  const [secret, setSecret] = useState<string | null>(() => {
    const value = localStorage.getItem(STORAGE_KEYS.SECRET);
    console.log('Initializing secret:', value ? 'present' : 'missing');
    return value;
  });
  
  const [backupCodes, setBackupCodes] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.BACKUP_CODES);
    return stored ? JSON.parse(stored) : [];
  });

  // Update localStorage when state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TWO_FACTOR_ENABLED, JSON.stringify(isTwoFactorEnabled));
  }, [isTwoFactorEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TWO_FACTOR_VERIFIED, JSON.stringify(isTwoFactorVerified));
  }, [isTwoFactorVerified]);

  useEffect(() => {
    if (qrCodeUrl) {
      localStorage.setItem(STORAGE_KEYS.QR_CODE_URL, qrCodeUrl);
    } else {
      localStorage.removeItem(STORAGE_KEYS.QR_CODE_URL);
    }
  }, [qrCodeUrl]);

  useEffect(() => {
    if (secret) {
      localStorage.setItem(STORAGE_KEYS.SECRET, secret);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SECRET);
    }
  }, [secret]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BACKUP_CODES, JSON.stringify(backupCodes));
  }, [backupCodes]);

  // Setup 2FA using the real API
  const setupTwoFactor = async () => {
    console.log('Starting 2FA setup...');
    if (!user) {
      console.error('No user found in auth context');
      throw new Error('User must be logged in to setup 2FA');
    }
    
    console.log('User found:', user.id);
    try {
      console.log('Calling 2FA setup API...');
      const { secret, qrCode } = await twoFactorAPI.setup(user.id);
      console.log('API response received:', { secret: secret ? 'present' : 'missing', qrCode: qrCode ? 'present' : 'missing' });
      
      console.log('Setting QR code URL...');
      setQrCodeUrl(qrCode);
      console.log('Setting secret...');
      setSecret(secret);
      console.log('Enabling 2FA...');
      setIsTwoFactorEnabled(true);
      console.log('2FA setup completed successfully');
    } catch (error) {
      console.error('Failed to setup 2FA:', error);
      throw new Error('Failed to setup 2FA');
    }
  };

  // Mock function to verify 2FA code
  const verifyTwoFactor = async (code: string) => {
    try {
      // In a real implementation, this would verify against the server
      // For demo, we'll accept any 6-digit code
      if (code.length === 6 && /^\d+$/.test(code)) {
        setIsTwoFactorVerified(true);
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (error) {
      console.error('Failed to verify 2FA code:', error);
      throw error;
    }
  };

  // Mock function to verify backup code
  const verifyBackupCode = async (code: string) => {
    try {
      // In a real implementation, this would verify against the server
      // For demo, we'll accept any code from our backup codes list
      if (backupCodes.includes(code)) {
        setIsTwoFactorVerified(true);
        // Remove the used backup code
        setBackupCodes(backupCodes.filter(c => c !== code));
      } else {
        throw new Error('Invalid backup code');
      }
    } catch (error) {
      console.error('Failed to verify backup code:', error);
      throw error;
    }
  };

  // Mock function to disable 2FA
  const disableTwoFactor = async () => {
    try {
      // In a real implementation, this would be an API call
      setIsTwoFactorEnabled(false);
      setIsTwoFactorVerified(false);
      setQrCodeUrl(null);
      setSecret(null);
      setBackupCodes([]);
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
      throw new Error('Failed to disable 2FA');
    }
  };

  const value = {
    isTwoFactorEnabled,
    isTwoFactorVerified,
    qrCodeUrl,
    secret,
    backupCodes,
    setupTwoFactor,
    verifyTwoFactor,
    verifyBackupCode,
    disableTwoFactor,
  };

  return (
    <TwoFactorContext.Provider value={value}>
      {children}
    </TwoFactorContext.Provider>
  );
} 
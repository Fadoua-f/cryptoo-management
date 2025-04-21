import React, { ReactNode, createContext, useContext, useState } from 'react';

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
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [isTwoFactorVerified, setIsTwoFactorVerified] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Mock function to simulate API call for setting up 2FA
  const setupTwoFactor = async () => {
    try {
      // In a real implementation, this would be an API call
      // For demo purposes, we'll simulate a successful response
      setQrCodeUrl('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/YourApp:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=YourApp');
      setSecret('JBSWY3DPEHPK3PXP');
      setBackupCodes(['12345678', '23456789', '34567890', '45678901', '56789012']);
      
      // For demo, we'll automatically enable 2FA
      setIsTwoFactorEnabled(true);
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
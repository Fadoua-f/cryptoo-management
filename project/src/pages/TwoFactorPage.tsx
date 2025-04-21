import React, { useEffect, useState } from 'react';

import { BackupCodes } from '../components/auth/BackupCodes';
import { Button } from '../components/ui/button';
import { TwoFactorSetup } from '../components/auth/TwoFactorSetup';
import { TwoFactorVerification } from '../components/auth/TwoFactorVerification';
import { useNavigate } from 'react-router-dom';
import { useTwoFactor } from '../context/TwoFactorContext';

export function TwoFactorPage() {
  const navigate = useNavigate();
  const { 
    isTwoFactorEnabled, 
    isTwoFactorVerified, 
    qrCodeUrl, 
    secret, 
    backupCodes,
    setupTwoFactor, 
    verifyTwoFactor, 
    verifyBackupCode, 
    disableTwoFactor 
  } = useTwoFactor();
  
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('TwoFactorPage mounted with state:', {
      isTwoFactorEnabled,
      isTwoFactorVerified,
      hasQrCode: !!qrCodeUrl,
      hasSecret: !!secret
    });
  }, [isTwoFactorEnabled, isTwoFactorVerified, qrCodeUrl, secret]);

  // Redirect to dashboard if 2FA is already verified
  useEffect(() => {
    if (isTwoFactorEnabled && isTwoFactorVerified) {
      // You can change this to redirect to your dashboard or home page
      // navigate('/dashboard');
    }
  }, [isTwoFactorEnabled, isTwoFactorVerified, navigate]);

  const handleSetup = async () => {
    console.log('Setup button clicked');
    setIsLoading(true);
    try {
      console.log('Calling setupTwoFactor...');
      await setupTwoFactor();
      console.log('setupTwoFactor completed');
    } catch (error) {
      console.error('Failed to setup 2FA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (code: string) => {
    setIsLoading(true);
    try {
      await verifyTwoFactor(code);
    } catch (error) {
      console.error('Failed to verify 2FA code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupCodeVerify = async (code: string) => {
    setIsLoading(true);
    try {
      await verifyBackupCode(code);
    } catch (error) {
      console.error('Failed to verify backup code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseBackupCode = () => {
    setShowBackupCodes(true);
  };

  const handleBack = () => {
    setShowBackupCodes(false);
  };

  const handleDisable = async () => {
    setIsLoading(true);
    try {
      await disableTwoFactor();
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Two-Factor Authentication</h1>
      
      {!isTwoFactorEnabled ? (
        <div className="space-y-4">
          <p className="text-lg">
            Enhance your account security by enabling two-factor authentication.
          </p>
          <Button onClick={handleSetup} disabled={isLoading}>
            {isLoading ? 'Setting up...' : 'Enable 2FA'}
          </Button>
        </div>
      ) : !isTwoFactorVerified ? (
        <div className="space-y-4">
          {qrCodeUrl && secret ? (
            <TwoFactorSetup 
              onSetup={handleVerify} 
              qrCodeUrl={qrCodeUrl} 
              secret={secret} 
            />
          ) : showBackupCodes ? (
            <BackupCodes 
              codes={backupCodes} 
              onVerify={handleBackupCodeVerify} 
              onBack={handleBack} 
            />
          ) : (
            <TwoFactorVerification 
              onVerify={handleVerify} 
              onUseBackupCode={handleUseBackupCode} 
            />
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-green-100 text-green-800 rounded-md">
            <p className="font-medium">Two-factor authentication is enabled and verified!</p>
            <p className="text-sm mt-1">Your account is now protected with an additional layer of security.</p>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Backup Codes</h2>
            <p className="text-sm text-gray-600">
              Save these backup codes in a secure place. You can use them to access your account if you lose your 2FA device.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {backupCodes.map((code, index) => (
                <code key={index} className="p-2 bg-gray-100 rounded text-sm">
                  {code}
                </code>
              ))}
            </div>
          </div>
          
          <Button variant="outline" onClick={handleDisable} disabled={isLoading} className="mt-4">
            {isLoading ? 'Disabling...' : 'Disable 2FA'}
          </Button>
        </div>
      )}
    </div>
  );
} 
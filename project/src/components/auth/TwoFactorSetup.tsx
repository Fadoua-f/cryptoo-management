import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import React, { useState } from 'react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const TwoFactorSetup: React.FC = () => {
  const { user } = useAuth();
  const [qrCode, setQrCode] = useState<string>('');
  const [token, setToken] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [isSetup, setIsSetup] = useState(false);

  const setup2FA = async () => {
    try {
      const response = await api.post('/2fa/setup');
      setQrCode(response.data.qrCode);
      setIsSetup(true);
    } catch (err) {
      setError('Failed to setup 2FA. Please try again.');
    }
  };

  const enable2FA = async () => {
    try {
      const response = await api.post('/2fa/enable', { token });
      setBackupCodes(response.data.backupCodes);
      // Show backup codes to user and store them securely
    } catch (err) {
      setError('Invalid token. Please try again.');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Two-Factor Authentication Setup</CardTitle>
        <CardDescription>
          Enhance your account security by enabling 2FA
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isSetup ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Two-factor authentication adds an extra layer of security to your account.
              You'll need an authenticator app like Google Authenticator or Authy.
            </p>
            <Button onClick={setup2FA} className="w-full">
              Start Setup
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {qrCode && (
              <div className="flex flex-col items-center space-y-4">
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                <p className="text-sm text-gray-500">
                  Scan this QR code with your authenticator app
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="token" className="text-sm font-medium">
                Enter the 6-digit code from your authenticator app
              </label>
              <Input
                id="token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="000000"
                maxLength={6}
              />
            </div>

            <Button onClick={enable2FA} className="w-full">
              Enable 2FA
            </Button>
          </div>
        )}

        {backupCodes.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium">Backup Codes</h3>
            <p className="text-sm text-gray-500">
              Save these backup codes in a secure place. You can use them to access your account if you lose your 2FA device.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <code key={index} className="p-2 bg-gray-100 rounded text-sm">
                  {code}
                </code>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 
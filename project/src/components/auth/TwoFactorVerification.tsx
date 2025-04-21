import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import React, { useState } from 'react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { api } from '../../services/api';

interface TwoFactorVerificationProps {
  onVerificationComplete: () => void;
  onCancel: () => void;
}

export const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  onVerificationComplete,
  onCancel,
}) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const verifyToken = async () => {
    if (token.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/2fa/verify', { token });
      onVerificationComplete();
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Please enter the verification code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              value={token}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToken(e.target.value)}
              placeholder="000000"
              maxLength={6}
              autoFocus
            />
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={verifyToken}
              className="flex-1"
              disabled={isLoading || token.length !== 6}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 
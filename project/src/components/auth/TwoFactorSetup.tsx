import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { ChangeEvent, FormEvent, MouseEvent, useState, useEffect } from 'react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface TwoFactorSetupProps {
  onSetup: (code: string) => Promise<void>;
  qrCodeUrl: string;
  secret: string;
}

export function TwoFactorSetup({ onSetup, qrCodeUrl, secret }: TwoFactorSetupProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeError, setQrCodeError] = useState(false);

  useEffect(() => {
    console.log('TwoFactorSetup mounted with:', { qrCodeUrl: qrCodeUrl ? 'present' : 'missing', secret: secret ? 'present' : 'missing' });
  }, [qrCodeUrl, secret]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await verifyCode();
  };

  const verifyCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await onSetup(verificationCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify 2FA code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    verifyCode();
  };

  const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Set Up Two-Factor Authentication</CardTitle>
        <CardDescription>
          Scan the QR code with your authenticator app or enter the secret key manually
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-center">
            {qrCodeUrl && !qrCodeError ? (
              <div className="relative w-48 h-48 bg-white p-2 rounded-lg shadow-sm">
                <img
                  src={qrCodeUrl}
                  alt="2FA QR Code"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error('QR code image failed to load:', e);
                    setQrCodeError(true);
                  }}
                  onLoad={() => console.log('QR code image loaded successfully')}
                />
              </div>
            ) : (
              <div className="w-48 h-48 bg-muted flex items-center justify-center rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  {qrCodeError ? 'Failed to load QR code. Please use the secret key below.' : 'Loading QR code...'}
                </p>
              </div>
            )}
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Secret Key:</p>
            <code className="text-sm bg-muted p-2 rounded-md block w-full max-w-xs mx-auto overflow-x-auto">{secret}</code>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                Verification Code
              </label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={handleCodeChange}
                maxLength={6}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </form>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleButtonClick}
          disabled={isLoading || verificationCode.length !== 6}
          className="w-full"
        >
          {isLoading ? 'Verifying...' : 'Verify and Enable 2FA'}
        </Button>
      </CardFooter>
    </Card>
  );
} 
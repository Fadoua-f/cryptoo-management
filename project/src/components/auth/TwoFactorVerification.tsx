import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { ChangeEvent, FormEvent, MouseEvent, useState } from 'react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface TwoFactorVerificationProps {
  onVerify: (code: string) => Promise<void>;
  onUseBackupCode: () => void;
}

export function TwoFactorVerification({ onVerify, onUseBackupCode }: TwoFactorVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await verifyCode();
  };

  const verifyCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await onVerify(verificationCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
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
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              autoFocus
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button
          onClick={handleButtonClick}
          disabled={isLoading || verificationCode.length !== 6}
          className="w-full"
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </Button>
        <Button
          variant="outline"
          onClick={onUseBackupCode}
          className="w-full"
        >
          Use Backup Code
        </Button>
      </CardFooter>
    </Card>
  );
} 
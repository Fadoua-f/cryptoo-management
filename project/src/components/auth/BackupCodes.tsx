import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { ChangeEvent, FormEvent, MouseEvent, useState } from 'react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface BackupCodesProps {
  codes: string[];
  onVerify: (code: string) => Promise<void>;
  onBack: () => void;
}

export function BackupCodes({ codes, onVerify, onBack }: BackupCodesProps) {
  const [backupCode, setBackupCode] = useState('');
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
      await onVerify(backupCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid backup code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    verifyCode();
  };

  const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBackupCode(e.target.value);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Backup Codes</CardTitle>
        <CardDescription>
          Enter one of your backup codes to sign in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {codes.map((code, index) => (
              <code
                key={index}
                className="p-2 bg-muted rounded-md text-sm font-mono text-center"
              >
                {code}
              </code>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                Backup Code
              </label>
              <Input
                id="code"
                type="text"
                placeholder="Enter backup code"
                value={backupCode}
                onChange={handleCodeChange}
                required
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </form>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button
          onClick={handleButtonClick}
          disabled={isLoading || !backupCode}
          className="w-full"
        >
          {isLoading ? 'Verifying...' : 'Verify Backup Code'}
        </Button>
        <Button
          variant="outline"
          onClick={onBack}
          className="w-full"
        >
          Back to 2FA
        </Button>
      </CardFooter>
    </Card>
  );
} 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import React, { useEffect, useState } from 'react';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useTwoFactor } from '../context/TwoFactorContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { isTwoFactorEnabled, isTwoFactorVerified } = useTwoFactor();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to 2FA verification if needed
  useEffect(() => {
    if (isTwoFactorEnabled && !isTwoFactorVerified) {
      navigate('/2fa');
    }
  }, [isTwoFactorEnabled, isTwoFactorVerified, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Mock login - in a real app, this would be an API call
      if (email === 'demo@example.com' && password === 'password') {
        // For demo purposes, we'll simulate a successful login
        // In a real app, you would set authentication tokens here
        
        // If 2FA is enabled but not verified, redirect to 2FA page
        if (isTwoFactorEnabled && !isTwoFactorVerified) {
          navigate('/2fa');
        } else {
          // Otherwise, redirect to dashboard
          navigate('/dashboard');
        }
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-center text-muted-foreground">
            Demo credentials: demo@example.com / password
          </p>
          <Button variant="outline" className="w-full" onClick={() => navigate('/2fa')}>
            Manage 2FA
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 
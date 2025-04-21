import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';

import { Button } from '../components/ui/button';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTwoFactor } from '../context/TwoFactorContext';

export function DashboardPage() {
  const navigate = useNavigate();
  const { isTwoFactorEnabled, isTwoFactorVerified } = useTwoFactor();

  const handleLogout = () => {
    // In a real app, you would clear authentication tokens here
    navigate('/login');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/2fa')}>
            Manage 2FA
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    {isTwoFactorEnabled && isTwoFactorVerified
                      ? 'Enabled and verified'
                      : isTwoFactorEnabled
                      ? 'Enabled but not verified'
                      : 'Disabled'}
                  </p>
                </div>
                <Button
                  variant={isTwoFactorEnabled ? 'outline' : 'default'}
                  onClick={() => navigate('/2fa')}
                >
                  {isTwoFactorEnabled ? 'Manage' : 'Enable'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              View your account details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">demo@example.com</p>
              </div>
              <div>
                <p className="text-sm font-medium">Account Type</p>
                <p className="text-sm text-muted-foreground">Demo Account</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
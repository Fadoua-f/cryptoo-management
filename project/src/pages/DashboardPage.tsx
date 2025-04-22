import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import React, { useEffect, useState } from 'react';

import AuthStatus from '../components/auth/AuthStatus';
import { Button } from '../components/ui/button';
import TransactionDebug from '../components/transactions/TransactionDebug';
import TransactionList from '../components/transactions/TransactionList';
import WalletList from '../components/wallet/WalletList';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTransaction } from '../context/TransactionContext';
import { useTwoFactor } from '../context/TwoFactorContext';
import { useWallet } from '../context/WalletContext';

export function DashboardPage() {
  const navigate = useNavigate();
  const { isTwoFactorEnabled, isTwoFactorVerified } = useTwoFactor();
  const { logout, user } = useAuth();
  const { activeWallet } = useWallet();
  const { transactions, isLoading } = useTransaction();
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    console.log('[DashboardPage] Component mounted/updated');
    console.log('[DashboardPage] Active wallet:', activeWallet);
    console.log('[DashboardPage] Transactions:', transactions);
    console.log('[DashboardPage] Is loading:', isLoading);
  }, [activeWallet, transactions, isLoading]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowDebug(!showDebug)}>
            {showDebug ? 'Hide Debug' : 'Show Debug'}
          </Button>
          <Button variant="outline" onClick={() => navigate('/2fa')}>
            Manage 2FA
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {showDebug && (
        <div className="mb-8">
          <TransactionDebug />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                <p className="text-sm text-muted-foreground">{user?.email || 'Not logged in'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Account Type</p>
                <p className="text-sm text-muted-foreground">User Account</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <WalletList />
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Transaction History</h2>
          <TransactionList />
        </div>
      </div>

      <div className="mb-8">
        <AuthStatus />
      </div>
    </div>
  );
} 
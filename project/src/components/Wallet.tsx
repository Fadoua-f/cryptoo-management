import React, { useState } from 'react';

import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';

const Wallet: React.FC = () => {
  const { account, balance, connect, disconnect, isConnected, contract } = useWeb3();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    if (!contract || !amount) return;
    
    try {
      setLoading(true);
      const tx = await contract.deposit({
        value: ethers.utils.parseEther(amount)
      });
      await tx.wait();
      setAmount('');
    } catch (error) {
      console.error('Error depositing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!contract || !amount) return;
    
    try {
      setLoading(true);
      const tx = await contract.withdraw(ethers.utils.parseEther(amount));
      await tx.wait();
      setAmount('');
    } catch (error) {
      console.error('Error withdrawing:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Wallet</h2>
      
      {!isConnected ? (
        <button
          onClick={connect}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Connect Wallet
        </button>
      ) : (
        <div>
          <p className="mb-2">Account: {account}</p>
          <p className="mb-4">Balance: {balance} ETH</p>
          
          <div className="mb-4">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount in ETH"
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="space-x-2">
            <button
              onClick={handleDeposit}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              Deposit
            </button>
            
            <button
              onClick={handleWithdraw}
              disabled={loading}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
            >
              Withdraw
            </button>
            
            <button
              onClick={disconnect}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet; 
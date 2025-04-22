import { Activity, Network, Server } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import blockchainService from '../../lib/blockchain';

interface NetworkStats {
  blockNumber: number;
  isConnected: boolean;
  peerCount: number;
  gasPrice: string;
}

const NetworkAnalysis: React.FC = () => {
  const [stats, setStats] = useState<NetworkStats>({
    blockNumber: 0,
    isConnected: false,
    peerCount: 0,
    gasPrice: '0',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNetworkStats = async () => {
      try {
        setIsLoading(true);
        const isConnected = await blockchainService.checkConnection();
        const blockNumber = Number(await blockchainService.web3.eth.getBlockNumber());
        const gasPrice = await blockchainService.web3.eth.getGasPrice();
        const peerCount = Number(await blockchainService.web3.eth.net.getPeerCount());

        setStats({
          blockNumber,
          isConnected,
          peerCount,
          gasPrice: blockchainService.web3.utils.fromWei(gasPrice, 'gwei'),
        });
      } catch (error) {
        console.error('Error fetching network stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNetworkStats();
    const interval = setInterval(fetchNetworkStats, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des statistiques réseau...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Network className="mr-2" size={24} />
        Analyse du Réseau
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <Server className="mr-2 text-primary-600" size={20} />
            <h3 className="font-medium">État du Réseau</h3>
          </div>
          <p className={`text-sm ${stats.isConnected ? 'text-success-600' : 'text-error-600'}`}>
            {stats.isConnected ? 'Connecté' : 'Déconnecté'}
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <Activity className="mr-2 text-primary-600" size={20} />
            <h3 className="font-medium">Bloc Actuel</h3>
          </div>
          <p className="text-sm text-gray-600">{stats.blockNumber}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <Network className="mr-2 text-primary-600" size={20} />
            <h3 className="font-medium">Pairs Connectés</h3>
          </div>
          <p className="text-sm text-gray-600">{stats.peerCount}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <Activity className="mr-2 text-primary-600" size={20} />
            <h3 className="font-medium">Prix du Gas</h3>
          </div>
          <p className="text-sm text-gray-600">{stats.gasPrice} Gwei</p>
        </div>
      </div>
    </div>
  );
};

export default NetworkAnalysis; 
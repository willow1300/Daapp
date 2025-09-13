import React, { useState, useEffect } from 'react';
import { Activity, Database, Shield, Zap, TrendingUp } from 'lucide-react';

interface ChainStatusProps {
  chainState: {
    currentCommitment: string;
    proofGenerated: boolean;
    blockHeight: number;
    nullifierCount: number;
    activeNotes: number;
  };
}

const ChainStatus: React.FC<ChainStatusProps> = ({ chainState }) => {
  const [metrics, setMetrics] = useState({
    tps: 247,
    proofGenTime: 1.8,
    stateSize: 2.4,
    validators: 21
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        tps: prev.tps + Math.floor(Math.random() * 10) - 5,
        proofGenTime: +(prev.proofGenTime + (Math.random() * 0.4) - 0.2).toFixed(1),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const statusCards = [
    {
      title: 'Block Height',
      value: chainState.blockHeight.toLocaleString(),
      icon: Database,
      color: 'blue',
      change: '+1.2%'
    },
    {
      title: 'Active Notes',
      value: chainState.activeNotes.toLocaleString(),
      icon: Shield,
      color: 'green',
      change: '+5.8%'
    },
    {
      title: 'Nullifiers',
      value: chainState.nullifierCount.toLocaleString(),
      icon: Activity,
      color: 'purple',
      change: '+2.1%'
    },
    {
      title: 'TPS',
      value: metrics.tps.toString(),
      icon: Zap,
      color: 'yellow',
      change: '+12.5%'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusCards.map((card) => (
          <div key={card.title} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${
                card.color === 'blue' ? 'from-blue-600 to-blue-700' :
                card.color === 'green' ? 'from-green-600 to-green-700' :
                card.color === 'purple' ? 'from-purple-600 to-purple-700' :
                'from-yellow-600 to-yellow-700'
              }`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                card.change.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {card.change}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="text-sm text-gray-400">{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chain Details */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* State Commitment Details */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            State Commitment
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-2">Current Commitment (Ct)</p>
              <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-600/30 font-mono text-sm text-purple-300 break-all">
                {chainState.currentCommitment}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Merkle Depth</p>
                <p className="text-white font-medium">32</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Hash Function</p>
                <p className="text-white font-medium">Poseidon</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              chainState.proofGenerated ? 'bg-green-500/20 border border-green-500/30' : 'bg-yellow-500/20 border border-yellow-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${chainState.proofGenerated ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
              <span className={`text-sm font-medium ${chainState.proofGenerated ? 'text-green-300' : 'text-yellow-300'}`}>
                {chainState.proofGenerated ? 'Proof Verified' : 'Generating zk-SNARK Proof'}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400">Proof Generation Time</p>
                <p className="text-white font-medium">{metrics.proofGenTime}s</p>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.max(20, 100 - (metrics.proofGenTime * 30))}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400">State Size</p>
                <p className="text-white font-medium">{metrics.stateSize} GB</p>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(metrics.stateSize / 10) * 100}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400">Network Efficiency</p>
                <p className="text-white font-medium">98.7%</p>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '98.7%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Validator Network */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <h3 className="text-xl font-bold text-white mb-6">Validator Network</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{metrics.validators}</p>
            <p className="text-gray-400">Active Validators</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">100%</p>
            <p className="text-gray-400">Uptime</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400">2/3</p>
            <p className="text-gray-400">BFT Threshold</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChainStatus;
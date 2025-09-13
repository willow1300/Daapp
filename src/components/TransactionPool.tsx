import React, { useState, useEffect } from 'react';
import { Activity, Zap, Clock, Shield, Hash } from 'lucide-react';

const TransactionPool: React.FC = () => {
  const [pendingTxs, setPendingTxs] = useState([
    {
      id: '1',
      type: 'transfer',
      amount: '2.5 ETH',
      fee: '0.001',
      priority: 'high',
      timestamp: Date.now() - 30000,
      from: 'ephm1abc...def2',
      to: 'ephm1xyz...890a'
    },
    {
      id: '2',
      type: 'bridge',
      amount: '50.0 BSC',
      fee: '0.005',
      priority: 'medium',
      timestamp: Date.now() - 60000,
      from: 'ephm1def...abc1',
      to: 'bridge_contract'
    },
    {
      id: '3',
      type: 'transfer',
      amount: '1.2 SOL',
      fee: '0.002',
      priority: 'low',
      timestamp: Date.now() - 120000,
      from: 'ephm1xyz...123b',
      to: 'ephm1abc...789c'
    }
  ]);

  const [processingStats, setProcessingStats] = useState({
    totalPending: 847,
    avgProcessingTime: 2.3,
    currentBatch: 156,
    proofGeneration: 'active'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate tx processing
      setPendingTxs(prev => {
        if (prev.length > 0) {
          return prev.slice(1);
        }
        return prev;
      });

      // Update stats
      setProcessingStats(prev => ({
        ...prev,
        totalPending: Math.max(0, prev.totalPending - Math.floor(Math.random() * 5)),
        currentBatch: prev.currentBatch + Math.floor(Math.random() * 10)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Pool Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-blue-400 text-sm font-medium">Pending TXs</span>
          </div>
          <p className="text-2xl font-bold text-white">{processingStats.totalPending}</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-600 rounded-xl">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-purple-400 text-sm font-medium">Current Batch</span>
          </div>
          <p className="text-2xl font-bold text-white">{processingStats.currentBatch}</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-600 rounded-xl">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-green-400 text-sm font-medium">Avg Time</span>
          </div>
          <p className="text-2xl font-bold text-white">{processingStats.avgProcessingTime}s</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-600 rounded-xl">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-yellow-400 text-sm font-medium">Proof Status</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-white font-medium capitalize">{processingStats.proofGeneration}</p>
          </div>
        </div>
      </div>

      {/* Transaction Pool */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Pending Transactions
          </h3>
          
          <div className="space-y-3">
            {pendingTxs.length > 0 ? pendingTxs.map((tx) => (
              <div key={tx.id} className="p-4 bg-gray-900/30 rounded-xl border border-gray-700/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(tx.priority)}`}>
                      {tx.priority}
                    </span>
                    <span className="text-gray-400 text-sm">{tx.type}</span>
                  </div>
                  <span className="text-gray-400 text-xs">{getTimeAgo(tx.timestamp)}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Amount:</span>
                    <span className="text-white font-medium">{tx.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Fee:</span>
                    <span className="text-white">{tx.fee} ETH</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    <p>From: {tx.from}</p>
                    <p>To: {tx.to}</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No pending transactions</p>
                <p className="text-gray-500 text-sm">Pool is empty</p>
              </div>
            )}
          </div>
        </div>

        {/* Processing Pipeline */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Processing Pipeline
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-blue-300 font-medium">Transaction Validation</p>
                <p className="text-blue-200 text-sm">Verifying signatures and balances</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-purple-300 font-medium">State Transition</p>
                <p className="text-purple-200 text-sm">Computing new state commitment</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-green-500/10 rounded-xl border border-green-500/20">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-green-300 font-medium">zk-SNARK Generation</p>
                <p className="text-green-200 text-sm">Creating validity proof πt</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="text-yellow-300 font-medium">Consensus</p>
                <p className="text-yellow-200 text-sm">Validator committee verification</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-900/50 rounded-xl">
            <h4 className="text-white font-medium mb-3">Privacy Guarantees</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p>• Raw transactions deleted after processing</p>
              <p>• Only state commitments published on-chain</p>
              <p>• Zero transaction linkability</p>
              <p>• Nullifiers prevent double-spending</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionPool;
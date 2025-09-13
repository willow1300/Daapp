import React, { useState } from 'react';
import { Lock, Shield, CheckCircle, Clock, ExternalLink } from 'lucide-react';

const EffectProofs: React.FC = () => {
  const [activeProofs, setActiveProofs] = useState([
    {
      id: '1',
      type: 'withdraw',
      chain: 'Ethereum',
      amount: '0.8 ETH',
      recipient: '0x742d35Cc6634C0532925a3b8D093B3e3e8d8e14D',
      status: 'verified',
      proofHash: '0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      timestamp: Date.now() - 300000
    },
    {
      id: '2',
      type: 'release',
      chain: 'BSC',
      amount: '100.0 BSC',
      recipient: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
      status: 'pending',
      proofHash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b',
      timestamp: Date.now() - 120000
    },
    {
      id: '3',
      type: 'mint',
      chain: 'Solana',
      amount: '5.5 SOL',
      recipient: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      status: 'generating',
      proofHash: '0x3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f',
      timestamp: Date.now() - 60000
    }
  ]);

  const [proofDetails, setProofDetails] = useState(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'generating': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'generating': return <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const showProofDetails = (proof: any) => {
    setProofDetails(proof);
  };

  return (
    <div className="space-y-8">
      {/* Effect Proofs Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-600 rounded-xl">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-green-400 text-sm font-medium">Verified</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {activeProofs.filter(p => p.status === 'verified').length}
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-600 rounded-xl">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-yellow-400 text-sm font-medium">Pending</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {activeProofs.filter(p => p.status === 'pending').length}
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-blue-400 text-sm font-medium">Generating</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {activeProofs.filter(p => p.status === 'generating').length}
          </p>
        </div>
      </div>

      {/* Active Effect Proofs */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Active Effect Proofs
        </h3>
        
        <div className="space-y-4">
          {activeProofs.map((proof) => (
            <div key={proof.id} className="p-4 bg-gray-900/30 rounded-xl border border-gray-700/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(proof.status)}`}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(proof.status)}
                      {proof.status}
                    </div>
                  </span>
                  <span className="text-white font-medium capitalize">{proof.type} Effect</span>
                </div>
                <span className="text-gray-400 text-sm">{getTimeAgo(proof.timestamp)}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Target Chain</p>
                  <p className="text-white font-medium">{proof.chain}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Amount</p>
                  <p className="text-white font-medium">{proof.amount}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-400 text-sm mb-1">Recipient</p>
                  <p className="text-purple-300 font-mono text-sm break-all">{proof.recipient}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Proof Hash</p>
                  <p className="text-gray-300 font-mono text-xs">{proof.proofHash.substring(0, 20)}...</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => showProofDetails(proof)}
                    className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    View Details
                  </button>
                  {proof.status === 'verified' && (
                    <button className="px-3 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      Explorer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Effect Proof Explanation */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-bold text-white mb-4">How Effect Proofs Work</h3>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">1</div>
              <div>
                <p className="text-white font-medium">State Transition</p>
                <p className="text-gray-400 text-sm">Ephemeral chain processes private transaction</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">2</div>
              <div>
                <p className="text-white font-medium">Effect Authorization</p>
                <p className="text-gray-400 text-sm">Transaction authorizes cross-chain effect</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">3</div>
              <div>
                <p className="text-white font-medium">Proof Generation</p>
                <p className="text-gray-400 text-sm">zk-SNARK proves effect validity without revealing transaction</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">4</div>
              <div>
                <p className="text-white font-medium">Cross-chain Execution</p>
                <p className="text-gray-400 text-sm">Target chain verifies proof and executes effect</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Proof Types</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-red-400" />
                <span className="text-red-300 font-medium">Withdraw</span>
              </div>
              <p className="text-red-200 text-sm">Proves authorization to unlock assets on target chain</p>
            </div>
            
            <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-300 font-medium">Release</span>
              </div>
              <p className="text-yellow-200 text-sm">Proves authorization to release locked bridge funds</p>
            </div>
            
            <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-300 font-medium">Mint</span>
              </div>
              <p className="text-green-200 text-sm">Proves authorization to mint wrapped assets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Proof Details Modal */}
      {proofDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Effect Proof Details</h3>
              <button
                onClick={() => setProofDetails(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Proof ID</p>
                  <p className="text-white font-mono text-sm">{(proofDetails as any).id}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Type</p>
                  <p className="text-white font-medium capitalize">{(proofDetails as any).type}</p>
                </div>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm mb-1">Full Proof Hash</p>
                <p className="text-purple-300 font-mono text-sm break-all">{(proofDetails as any).proofHash}</p>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm mb-1">Mathematical Proof</p>
                <div className="bg-gray-900/50 p-4 rounded-lg font-mono text-xs text-gray-300">
                  π_E proves: ∃ tx ∈ TXs such that<br/>
                  Valid(St-1, tx) ∧ Effect(tx) = {(proofDetails as any).type}: {(proofDetails as any).amount} → {(proofDetails as any).recipient}<br/>
                  Under state commitment Ct = {(proofDetails as any).proofHash.substring(0, 20)}...
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EffectProofs;
import React, { useState } from 'react';
import { Shield, Layers, Wallet, ArrowRightLeft, Activity, Lock } from 'lucide-react';
import Header from './components/Header';
import WalletInterface from './components/WalletInterface';
import ChainStatus from './components/ChainStatus';
import CrossChainBridge from './components/CrossChainBridge';
import TransactionPool from './components/TransactionPool';
import EffectProofs from './components/EffectProofs';

function App() {
  const [activeTab, setActiveTab] = useState('wallet');
  const [chainState, setChainState] = useState({
    currentCommitment: '0x7f8a2b1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
    proofGenerated: false,
    blockHeight: 1247,
    nullifierCount: 1893,
    activeNotes: 4521
  });

  const tabs = [
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'chain', label: 'Chain Status', icon: Layers },
    { id: 'bridge', label: 'Cross-Chain Bridge', icon: ArrowRightLeft },
    { id: 'txpool', label: 'Transaction Pool', icon: Activity },
    { id: 'effects', label: 'Effect Proofs', icon: Lock }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="absolute inset-0 bg-[url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")] opacity-40"></div>
      
      <div className="relative z-10">
        <Header chainState={chainState} />
        
        <main className="container mx-auto px-4 py-8">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8 p-1 bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="animate-fadeIn">
            {activeTab === 'wallet' && <WalletInterface chainState={chainState} setChainState={setChainState} />}
            {activeTab === 'chain' && <ChainStatus chainState={chainState} />}
            {activeTab === 'bridge' && <CrossChainBridge chainState={chainState} setChainState={setChainState} />}
            {activeTab === 'txpool' && <TransactionPool />}
            {activeTab === 'effects' && <EffectProofs />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
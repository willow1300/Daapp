import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { ArrowRightLeft, Lock, Unlock, CheckCircle, Clock } from 'lucide-react';
import { useBridge } from '../hooks/useBridge';

interface BridgeProps {
  chainState: any;
  setChainState: (state: any) => void;
}

const CrossChainBridge: React.FC<BridgeProps> = ({ chainState, setChainState }) => {
  const { address, isConnected } = useAccount();
  const { depositETH, depositToken, withdraw, getTotalLocked, loading, error } = useBridge();
  
  const [selectedChain, setSelectedChain] = useState('ethereum');
  const [amount, setAmount] = useState('');
  const [bridgeDirection, setBridgeDirection] = useState('deposit'); // deposit or withdraw
  const [bridgeStatus, setBridgeStatus] = useState('ready'); // ready, processing, complete
  const [ephemeralAddress, setEphemeralAddress] = useState('');
  
  const supportedChains = [
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      color: 'bg-blue-600',
      locked: 245.67
    },
    {
      id: 'bsc',
      name: 'Binance Smart Chain',
      symbol: 'BSC',
      color: 'bg-yellow-600',
      locked: 1856.32
    },
    {
      id: 'solana',
      name: 'Solana',
      symbol: 'SOL',
      color: 'bg-purple-600',
      locked: 89.45
    }
  ];

  const [bridgeHistory] = useState([
    {
      id: 1,
      type: 'deposit',
      chain: 'Ethereum',
      amount: '0.5 ETH',
      status: 'complete',
      timestamp: '2 hours ago',
      txHash: '0x1a2b3c4d5e6f...'
    },
    {
      id: 2,
      type: 'withdraw',
      chain: 'BSC',
      amount: '25.0 BSC',
      status: 'processing',
      timestamp: '5 hours ago',
      txHash: '0x2b3c4d5e6f7a...'
    },
    {
      id: 3,
      type: 'deposit',
      chain: 'Solana',
      amount: '2.1 SOL',
      status: 'complete',
      timestamp: '1 day ago',
      txHash: '0x3c4d5e6f7a8b...'
    }
  ]);

  const selectedChainData = supportedChains.find(chain => chain.id === selectedChain);

  const executeBridge = async () => {
    if (!amount) return;
    
    setBridgeStatus('processing');
    
    // Simulate bridge processing
    setTimeout(() => {
      setBridgeStatus('complete');
      
      try {
        if (bridgeDirection === 'deposit') {
          // Execute deposit
          if (selectedChain === 'ethereum') {
            depositETH(amount, ephemeralAddress || address || '');
          } else {
            // For other chains, use token deposit (simplified)
            const tokenAddress = '0x0000000000000000000000000000000000000000'; // Placeholder
            depositToken(tokenAddress, amount, ephemeralAddress || address || '');
          }
        } else {
          // Execute withdrawal
          withdraw(
            address || '',
            parseFloat(amount),
            selectedChain === 'ethereum' ? undefined : selectedChainData?.symbol
          );
        }
      } catch (error) {
        console.error('Bridge operation failed:', error);
        setBridgeStatus('ready');
        return;
      }
    }, 2000);
    
    // Continue with existing simulation logic
    setTimeout(() => {
      setBridgeStatus('complete');
      
      // Update chain state to reflect the bridge operation
      setChainState(prev => ({
        ...prev,
        proofGenerated: false,
        activeNotes: prev.activeNotes + (bridgeDirection === 'deposit' ? 1 : -1)
      }));
      
      // Generate new proof
      setTimeout(() => {
        setChainState(prev => ({
          ...prev,
          proofGenerated: true,
          currentCommitment: generateNewCommitment()
        }));
      }, 2000);
      
      // Reset form
      setTimeout(() => {
        setBridgeStatus('ready');
        setAmount('');
      }, 3000);
    }, 4000);
  };

  const generateNewCommitment = () => {
    const chars = '0123456789abcdef';
    let commitment = '0x';
    for (let i = 0; i < 64; i++) {
      commitment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return commitment;
  };

  return (
    <div className="space-y-8">
      {/* Bridge Interface */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            Cross-Chain Bridge
          </h2>

          {/* Direction Toggle */}
          {!isConnected && (
            <div className="mb-6 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
              <p className="text-yellow-300 text-sm">
                Please connect your wallet to use the cross-chain bridge.
              </p>
            </div>
          )}

          {isConnected && (
          <div className="flex bg-gray-900/50 rounded-xl p-1 mb-6">
            <button
              onClick={() => setBridgeDirection('deposit')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                bridgeDirection === 'deposit'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Deposit to Ephemeral
            </button>
            <button
              onClick={() => setBridgeDirection('withdraw')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                bridgeDirection === 'withdraw'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Withdraw to Chain
            </button>
          </div>
          )}

          {/* Chain Selection */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-3">Select Chain</label>
            <div className="grid grid-cols-3 gap-3">
              {supportedChains.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => setSelectedChain(chain.id)}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedChain === chain.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-600/30 bg-gray-900/30 hover:border-gray-500'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full ${chain.color} mx-auto mb-2 flex items-center justify-center text-white font-bold text-xs`}>
                    {chain.symbol.charAt(0)}
                  </div>
                  <p className="text-white font-medium text-sm">{chain.name}</p>
                  <p className="text-gray-400 text-xs">{chain.locked} Locked</p>
                </button>
              ))}
            </div>
          </div>

          {/* Ephemeral Address (for deposits) */}
          {bridgeDirection === 'deposit' && (
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Ephemeral Address (optional)</label>
              <input
                type="text"
                value={ephemeralAddress}
                onChange={(e) => setEphemeralAddress(e.target.value)}
                placeholder={`Use connected wallet address: ${address?.substring(0, 20)}...`}
                className="w-full p-3 bg-gray-900/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Amount</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full p-4 bg-gray-900/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-20"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="text-gray-400 font-medium">{selectedChainData?.symbol}</span>
              </div>
            </div>
          </div>

          {/* Bridge Button */}
          <button
            onClick={executeBridge}
            disabled={!amount || bridgeStatus === 'processing' || !isConnected || loading}
            className="w-full p-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
          >
            {bridgeStatus === 'processing' ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing Bridge...
              </>
            ) : bridgeStatus === 'complete' ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Bridge Complete!
              </>
            ) : (
              <>
                {bridgeDirection === 'deposit' ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                {bridgeDirection === 'deposit' ? 'Deposit Assets' : 'Withdraw Assets'}
              </>
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Bridge Info */}
          <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <h4 className="text-blue-300 font-medium mb-2">How it Works</h4>
            <div className="text-sm text-blue-200 space-y-1">
              <p>• Assets are locked on the source chain via smart contract</p>
              <p>• Ephemeral chain credits equivalent notes privately</p>
              <p>• Effect proofs enable trustless withdrawals</p>
              <p>• No transaction traces visible on either chain</p>
            </div>
          </div>
        </div>

        {/* Bridge Status & Stats */}
        <div className="space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Bridge Statistics</h3>
            
            <div className="space-y-4">
              {supportedChains.map((chain) => (
                <div key={chain.id} className="flex items-center justify-between p-4 bg-gray-900/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${chain.color} flex items-center justify-center text-white font-bold text-xs`}>
                      {chain.symbol.charAt(0)}
                    </div>
                    <span className="text-white font-medium">{chain.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{chain.locked}</p>
                    <p className="text-xs text-gray-400">Total Locked</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Security Features</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-300">Trustless Bridge Contracts</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-300">Effect Proof Verification</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-300">Multi-sig Validators</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-300">Time-locked Withdrawals</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bridge History */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <h3 className="text-xl font-bold text-white mb-6">Recent Bridge Operations</h3>
        
        <div className="space-y-3">
          {bridgeHistory.map((operation) => (
            <div key={operation.id} className="flex items-center justify-between p-4 bg-gray-900/30 rounded-xl">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${
                  operation.type === 'deposit' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {operation.type === 'deposit' ? (
                    <Lock className={`w-4 h-4 ${operation.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`} />
                  ) : (
                    <Unlock className={`w-4 h-4 ${operation.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`} />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">
                    {operation.type === 'deposit' ? 'Deposited' : 'Withdrew'} {operation.amount}
                  </p>
                  <p className="text-sm text-gray-400">{operation.chain} • {operation.timestamp}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  operation.status === 'complete' ? 'bg-green-500/20 text-green-400' :
                  operation.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {operation.status === 'complete' ? 'Complete' :
                   operation.status === 'processing' ? 'Processing' :
                   'Pending'}
                </span>
                {operation.status === 'processing' && (
                  <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrossChainBridge;
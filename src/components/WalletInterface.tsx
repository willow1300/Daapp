import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet, Send, Eye, Copy, RefreshCw, Shield, Key } from 'lucide-react';
import { useEphemeralChain } from '../hooks/useEphemeralChain';
import { useBridge } from '../hooks/useBridge';

interface WalletProps {
  chainState: any;
  setChainState: (state: any) => void;
}

const WalletInterface: React.FC<WalletProps> = ({ chainState, setChainState }) => {
  const { address, isConnected } = useAccount();
  const { submitTransaction, getBalance } = useEphemeralChain();
  const { generateEphemeralAddress } = useBridge();
  
  const [balance, setBalance] = useState({
    ETH: 2.45,
    BSC: 856.32,
    SOL: 12.87
  });
  
  const [currentAddress, setCurrentAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('ETH');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [ephemeralBalance, setEphemeralBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const privateKey = '0x4c8a2f1e9d3b6a7c5e2f8d9a3b1c7e4f6d2a9c5b8e1f7d4a6c9b2e5f8a3c6d9';

  useEffect(() => {
    if (isConnected && address) {
      // Generate ephemeral address when wallet connects
      const ephemeralAddr = generateEphemeralAddress();
      setCurrentAddress(ephemeralAddr);
      
      // Fetch ephemeral balance
      fetchEphemeralBalance(ephemeralAddr);
    }
  }, [isConnected, address, generateEphemeralAddress]);

  const fetchEphemeralBalance = async (ephemeralAddr: string) => {
    try {
      const balanceData = await getBalance(ephemeralAddr);
      setEphemeralBalance(balanceData.balance);
    } catch (error) {
      console.error('Error fetching ephemeral balance:', error);
    }
  };

  const generateNewAddress = () => {
    const newAddress = generateEphemeralAddress();
    setCurrentAddress(newAddress);
    fetchEphemeralBalance(newAddress);
  };

  const sendTransaction = async () => {
    if (!sendAmount || !recipientAddress || !address) return;
    
    setLoading(true);
    try {
      // Submit transaction to ephemeral chain
      const result = await submitTransaction({
        from: currentAddress,
        to: recipientAddress,
        amount: parseFloat(sendAmount),
        asset: selectedAsset,
        signature: privateKey // In production, sign with actual private key
      });
      
      console.log('Transaction submitted:', result);
      
      // Update local balance
      const amount = parseFloat(sendAmount);
      setBalance(prev => ({
        ...prev,
        [selectedAsset]: prev[selectedAsset] - amount
      }));
      
      // Update chain state
      setChainState(prev => ({
        ...prev,
        proofGenerated: false,
        nullifierCount: prev.nullifierCount + 1
      }));
      
      // Simulate proof generation completion
      setTimeout(() => {
        setChainState(prev => ({
          ...prev,
          proofGenerated: true,
          currentCommitment: generateNewCommitment()
        }));
      }, 2000);
      
      setSendAmount('');
      setRecipientAddress('');
      
      // Refresh ephemeral balance
      fetchEphemeralBalance(currentAddress);
    } catch (error) {
      console.error('Error sending transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewCommitment = () => {
    const chars = '0123456789abcdef';
    let commitment = '0x';
    for (let i = 0; i < 64; i++) {
      commitment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return commitment;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Wallet Overview */}
      <div className="space-y-6">
        {/* Wallet Connection */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Wallet Connection</h2>
          <div className="flex items-center justify-between">
            <div>
              {isConnected ? (
                <div>
                  <p className="text-green-400 font-medium">Connected</p>
                  <p className="text-gray-400 text-sm font-mono">{address?.substring(0, 20)}...</p>
                </div>
              ) : (
                <p className="text-gray-400">Not connected</p>
              )}
            </div>
            <ConnectButton />
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Private Wallet
            </h2>
            <button
              onClick={generateNewAddress}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              New Address
            </button>
          </div>

          {/* Current Address */}
          {!isConnected && (
            <div className="mb-6 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
              <p className="text-yellow-300 text-sm">
                Please connect your wallet to use the ephemeral chain features.
              </p>
            </div>
          )}
          
          {isConnected && currentAddress && (
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-2">Current Ephemeral Address</p>
            <div className="flex items-center gap-2 p-3 bg-gray-900/50 rounded-lg border border-gray-600/30">
              <p className="font-mono text-sm text-purple-300 flex-1 break-all">{currentAddress}</p>
              <button
                onClick={() => copyToClipboard(currentAddress)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          )}

          {/* Private Key */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-400">Private Key</p>
              <button
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                <Eye className="w-3 h-3" />
                {showPrivateKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-900/50 rounded-lg border border-gray-600/30">
              <p className="font-mono text-sm text-purple-300 flex-1">
                {showPrivateKey ? privateKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
              </p>
              <button
                onClick={() => copyToClipboard(privateKey)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                disabled={!showPrivateKey}
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Ephemeral Balance */}
          {isConnected && (
            <div className="mb-6 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <h4 className="text-purple-300 font-medium mb-2">Ephemeral Chain Balance</h4>
              <p className="text-2xl font-bold text-white">{ephemeralBalance.toFixed(4)} ETH</p>
              <p className="text-sm text-purple-200">Private balance on ephemeral chain</p>
            </div>
          )}

          {/* Balance Display */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Asset Balances</h3>
            {Object.entries(balance).map(([asset, amount]) => (
              <div key={asset} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900/30 to-gray-800/30 rounded-xl border border-gray-700/30">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    asset === 'ETH' ? 'bg-blue-600' :
                    asset === 'BSC' ? 'bg-yellow-600' :
                    'bg-purple-600'
                  }`}>
                    {asset === 'SOL' ? 'SOL' : asset}
                  </div>
                  <span className="font-medium text-white">{asset}</span>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-white">{amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-400">Available</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Features */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy Features
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <span className="text-green-300">Unlinkable Transactions</span>
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <span className="text-green-300">One-time Addresses</span>
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <span className="text-green-300">Zero TX Traces</span>
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Send Transaction */}
      <div className="space-y-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send Assets
          </h2>

          <div className="space-y-4">
            {/* Asset Selection */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Select Asset</label>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="w-full p-3 bg-gray-900/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {Object.entries(balance).map(([asset, amount]) => (
                  <option key={asset} value={asset}>
                    {asset} (Balance: {amount.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient Address */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Recipient Address</label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="ephm1..."
                className="w-full p-3 bg-gray-900/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Amount</label>
              <input
                type="number"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                placeholder="0.00"
                className="w-full p-3 bg-gray-900/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={sendTransaction}
              disabled={!sendAmount || !recipientAddress || !isConnected || loading}
              className="w-full p-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Transaction
                </>
              )}
            </button>
          </div>

          {/* Transaction Info */}
          <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <h4 className="text-blue-300 font-medium mb-2">Privacy Notice</h4>
            <p className="text-sm text-blue-200">
              This transaction will be processed privately using zk-SNARK proofs. No transaction details will be visible on-chain.
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
              <div>
                <p className="text-white font-medium">Received 0.5 ETH</p>
                <p className="text-xs text-gray-400">2 minutes ago</p>
              </div>
              <span className="text-green-400">+0.5</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
              <div>
                <p className="text-white font-medium">Sent 25.0 BSC</p>
                <p className="text-xs text-gray-400">1 hour ago</p>
              </div>
              <span className="text-red-400">-25.0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
              <div>
                <p className="text-white font-medium">Bridge from Solana</p>
                <p className="text-xs text-gray-400">3 hours ago</p>
              </div>
              <span className="text-blue-400">Bridge</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletInterface;
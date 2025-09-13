import React from 'react';
import { Shield, Zap, Eye, EyeOff } from 'lucide-react';

interface HeaderProps {
  chainState: {
    currentCommitment: string;
    proofGenerated: boolean;
    blockHeight: number;
    nullifierCount: number;
    activeNotes: number;
  };
}

const Header: React.FC<HeaderProps> = ({ chainState }) => {
  return (
    <header className="border-b border-gray-800/50 backdrop-blur-sm bg-gray-900/30">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">EphemeralChain</h1>
              <p className="text-gray-400 text-sm">chainCloack Protocol</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-400">Block Height</p>
                <p className="text-white font-mono">{chainState.blockHeight.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Active Notes</p>
                <p className="text-white font-mono">{chainState.activeNotes.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${chainState.proofGenerated ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
              <span className="text-sm text-gray-300">
                {chainState.proofGenerated ? 'Proof Verified' : 'Generating Proof'}
              </span>
            </div>
          </div>
        </div>

        {/* State Commitment Display */}
        <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">Current State Commitment (Ct)</p>
              <p className="font-mono text-sm text-purple-300 break-all">{chainState.currentCommitment}</p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <EyeOff className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-500">No TX Traces</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
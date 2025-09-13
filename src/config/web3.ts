import { http, createConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY;
const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!alchemyApiKey) {
  console.warn('VITE_ALCHEMY_API_KEY not found in environment variables');
}

if (!walletConnectProjectId) {
  console.warn('VITE_WALLETCONNECT_PROJECT_ID not found in environment variables');
}

export const wagmiConfig = getDefaultConfig({
  appName: 'Ephemeral Chain',
  projectId: walletConnectProjectId || 'demo',
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(
      alchemyApiKey 
        ? `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
        : undefined
    ),
  },
  ssr: false,
});

export const chains = [mainnet];

export { chains };

// Ephemeral Chain Configuration
export const ephemeralChainConfig = {
  rpcUrl: import.meta.env.VITE_EPHEMERAL_CHAIN_RPC || 'http://localhost:3001',
  chainId: parseInt(import.meta.env.VITE_EPHEMERAL_CHAIN_ID || '31337'),
  name: 'Ephemeral Chain',
  currency: 'ETH'
};

// Bridge Contract Addresses
export const bridgeContracts = {
  ethereum: import.meta.env.VITE_BRIDGE_CONTRACT_ETH || '',
  bsc: import.meta.env.VITE_BRIDGE_CONTRACT_BSC || '',
  solana: import.meta.env.VITE_BRIDGE_CONTRACT_SOL || ''
};
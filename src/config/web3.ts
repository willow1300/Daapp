import { createConfig, configureChains, mainnet } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';

const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY;
const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!alchemyApiKey) {
  console.warn('VITE_ALCHEMY_API_KEY not found in environment variables');
}

if (!walletConnectProjectId) {
  console.warn('VITE_WALLETCONNECT_PROJECT_ID not found in environment variables');
}

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet],
  [
    alchemyProvider({ apiKey: alchemyApiKey || 'demo' }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Ephemeral Chain',
  projectId: walletConnectProjectId || 'demo',
  chains,
});

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

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
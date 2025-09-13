# Ephemeral Privacy Chain with Cross-Chain Bridge

A privacy-first blockchain implementation that leaves no transaction traces on-chain, featuring cross-chain asset bridging and a secure wallet interface.

## Features

- **Ephemeral Transactions**: No per-transaction traces stored on-chain
- **zk-SNARK Proofs**: State transitions verified with zero-knowledge proofs
- **Cross-Chain Bridge**: Import assets from Ethereum, BSC, and Solana
- **UTXO/Notes Model**: Privacy-preserving balance management
- **Effect Proofs**: Trustless cross-chain withdrawals
- **Deletable Transaction Storage**: Black box storage that can be cleaned up

## Architecture

### Core Components

1. **Ephemeral Chain Server** (`server/ephemeral-chain.js`)
   - Processes transactions in memory (black box)
   - Generates zk-SNARK proofs for state transitions
   - Maintains only state commitments and nullifiers
   - Automatic cleanup of old transaction data

2. **Bridge Contracts** (`contracts/EphemeralBridge.sol`)
   - Lock assets on source chains
   - Verify effect proofs for withdrawals
   - Trustless cross-chain operations

3. **Wallet Interface** (React frontend)
   - WalletConnect integration
   - One-time ephemeral addresses
   - Private transaction submission
   - Real-time balance tracking

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Fill in your API keys:
- `VITE_ALCHEMY_API_KEY`: Your Alchemy API key for Ethereum mainnet
- `VITE_WALLETCONNECT_PROJECT_ID`: Your WalletConnect project ID

### 2. Install Dependencies

```bash
npm install
```

### 3. Deploy Bridge Contracts (Optional - for local testing)

Start a local Ethereum node:
```bash
npx hardhat node
```

Deploy contracts:
```bash
npm run deploy:contracts
```

Update your `.env` with the deployed contract address.

### 4. Start the Application

```bash
npm run dev
```

This starts both the client (port 5173) and ephemeral chain server (port 3001).

## Usage

### Connecting Your Wallet

1. Click "Connect Wallet" in the interface
2. Choose your preferred wallet (MetaMask, WalletConnect, etc.)
3. An ephemeral address will be automatically generated

### Cross-Chain Bridge

1. **Deposit**: Lock assets on Ethereum to use on the ephemeral chain
2. **Withdraw**: Use effect proofs to unlock assets back to Ethereum

### Private Transactions

1. Send transactions using ephemeral addresses
2. Transactions are processed privately with no on-chain traces
3. Only state commitments and zk-proofs are published

### Transaction Cleanup

The system automatically deletes old transaction data from the black box storage while preserving:
- State commitments
- Nullifiers (to prevent double-spending)
- zk-SNARK proofs

## API Endpoints

### Ephemeral Chain Server (localhost:3001)

- `GET /api/state` - Get current chain state
- `POST /api/transaction` - Submit transaction to black box
- `POST /api/balance` - Get user balance
- `GET /api/txpool` - Get transaction pool status
- `POST /api/effect-proof` - Generate effect proof for withdrawals
- `DELETE /api/cleanup` - Clean up old transaction data
- `GET /health` - Health check

## Security Features

- **No Transaction Linkability**: Raw transactions are ephemeral
- **zk-SNARK Proofs**: State transitions verified without revealing details
- **Effect Proofs**: Trustless cross-chain operations
- **One-time Addresses**: Enhanced privacy for users
- **Nullifier System**: Prevents double-spending without revealing transaction details

## Development

### Project Structure

```
├── contracts/           # Solidity bridge contracts
├── server/             # Ephemeral chain backend
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API services
│   └── config/         # Configuration files
├── scripts/            # Deployment scripts
└── hardhat.config.js   # Hardhat configuration
```

### Key Technologies

- **Frontend**: React, TypeScript, Tailwind CSS
- **Wallet**: WalletConnect, RainbowKit, Wagmi
- **Blockchain**: Ethers.js, Hardhat
- **Backend**: Node.js, Express, SQLite
- **Privacy**: Crypto-JS (simplified zk-SNARKs for demo)

## Production Considerations

For production deployment:

1. Replace simplified zk-SNARK implementation with proper circom/snarkjs
2. Implement distributed validator network
3. Add proper key management and HSM integration
4. Deploy to mainnet with proper security audits
5. Implement proper DA (Data Availability) layer
6. Add monitoring and alerting systems

## License

MIT License - see LICENSE file for details.
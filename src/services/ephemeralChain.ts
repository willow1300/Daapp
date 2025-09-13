import { ephemeralChainConfig } from '../config/web3';

export interface ChainState {
  currentCommitment: string;
  blockHeight: number;
  activeNotes: number;
  nullifierCount: number;
  proofGenerated: boolean;
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  asset: string;
  timestamp: number;
  processed: boolean;
}

export interface EffectProof {
  stateCommitment: string;
  nullifier: string;
  recipient: string;
  token: string;
  amount: string;
  zkProof: string;
}

class EphemeralChainService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = ephemeralChainConfig.rpcUrl;
  }

  async getChainState(): Promise<ChainState> {
    try {
      const response = await fetch(`${this.baseUrl}/api/state`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching chain state:', error);
      throw error;
    }
  }

  async submitTransaction(transaction: {
    from: string;
    to: string;
    amount: number;
    asset?: string;
    signature: string;
  }): Promise<{ success: boolean; transactionId: string; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting transaction:', error);
      throw error;
    }
  }

  async getBalance(address: string, privateKey?: string): Promise<{ address: string; balance: number; currency: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, privateKey }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  }

  async getTransactionPool(): Promise<{
    pending: Transaction[];
    totalPending: number;
    processed: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/txpool`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching transaction pool:', error);
      throw error;
    }
  }

  async generateEffectProof(params: {
    recipient: string;
    amount: number;
    token?: string;
    nullifier: string;
  }): Promise<{ success: boolean; proof: EffectProof; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/effect-proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating effect proof:', error);
      throw error;
    }
  }

  async cleanupTransactions(olderThan?: number): Promise<{
    success: boolean;
    deletedTransactions: number;
    remainingTransactions: number;
    message: string;
  }> {
    try {
      const url = olderThan 
        ? `${this.baseUrl}/api/cleanup?olderThan=${olderThan}`
        : `${this.baseUrl}/api/cleanup`;
      
      const response = await fetch(url, { method: 'DELETE' });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error cleaning up transactions:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<{
    status: string;
    chainId: number;
    blockHeight: number;
    transactionsInBlackBox: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }
}

export const ephemeralChain = new EphemeralChainService();
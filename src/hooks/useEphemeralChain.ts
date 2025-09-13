import { useState, useEffect, useCallback } from 'react';
import { ephemeralChain, ChainState } from '../services/ephemeralChain';

export function useEphemeralChain() {
  const [chainState, setChainState] = useState<ChainState>({
    currentCommitment: '',
    blockHeight: 0,
    activeNotes: 0,
    nullifierCount: 0,
    proofGenerated: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChainState = useCallback(async () => {
    try {
      setError(null);
      const state = await ephemeralChain.getChainState();
      setChainState(state);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chain state');
      console.error('Error fetching chain state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitTransaction = useCallback(async (transaction: {
    from: string;
    to: string;
    amount: number;
    asset?: string;
    signature: string;
  }) => {
    try {
      setError(null);
      const result = await ephemeralChain.submitTransaction(transaction);
      
      // Refresh chain state after transaction
      setTimeout(() => {
        fetchChainState();
      }, 2000);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit transaction';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchChainState]);

  const getBalance = useCallback(async (address: string, privateKey?: string) => {
    try {
      setError(null);
      return await ephemeralChain.getBalance(address, privateKey);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balance';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const cleanupTransactions = useCallback(async (olderThan?: number) => {
    try {
      setError(null);
      const result = await ephemeralChain.cleanupTransactions(olderThan);
      
      // Refresh chain state after cleanup
      fetchChainState();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cleanup transactions';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchChainState]);

  useEffect(() => {
    fetchChainState();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchChainState, 5000);
    
    return () => clearInterval(interval);
  }, [fetchChainState]);

  return {
    chainState,
    loading,
    error,
    submitTransaction,
    getBalance,
    cleanupTransactions,
    refreshState: fetchChainState
  };
}
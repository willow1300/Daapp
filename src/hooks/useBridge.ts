import { useState, useCallback } from 'react';
import { usePublicClient, useWalletClient } from 'wagmi';
import { bridgeService } from '../services/bridgeService';
import { ephemeralChain } from '../services/ephemeralChain';

export function useBridge() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Initialize bridge service
  const initializeBridge = useCallback(async () => {
    if (publicClient) {
      await bridgeService.initialize(publicClient, walletClient || undefined);
    }
  }, [publicClient, walletClient]);

  const depositETH = useCallback(async (amount: string, ephemeralAddress: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await initializeBridge();
      const tx = await bridgeService.lockETH(amount, ephemeralAddress);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        message: 'ETH deposited successfully'
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deposit ETH';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [initializeBridge]);

  const depositToken = useCallback(async (
    tokenAddress: string,
    amount: string,
    ephemeralAddress: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      await initializeBridge();
      const tx = await bridgeService.lockToken(tokenAddress, amount, ephemeralAddress);
      
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        message: 'Token deposited successfully'
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deposit token';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [initializeBridge]);

  const withdraw = useCallback(async (
    recipient: string,
    amount: number,
    token?: string,
    nullifier?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate nullifier if not provided
      const withdrawNullifier = nullifier || `nullifier_${Date.now()}_${Math.random()}`;
      
      // Generate effect proof from ephemeral chain
      const proofResult = await ephemeralChain.generateEffectProof({
        recipient,
        amount,
        token,
        nullifier: withdrawNullifier
      });
      
      if (!proofResult.success) {
        throw new Error('Failed to generate effect proof');
      }
      
      // Submit withdrawal to bridge contract
      await initializeBridge();
      const tx = await bridgeService.unlockAsset(proofResult.proof);
      
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        message: 'Withdrawal completed successfully'
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to withdraw';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [initializeBridge]);

  const getTotalLocked = useCallback(async (tokenAddress?: string) => {
    try {
      await initializeBridge();
      return await bridgeService.getTotalLocked(tokenAddress);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get locked amount';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [initializeBridge]);

  const generateEphemeralAddress = useCallback(() => {
    return bridgeService.generateEphemeralAddress();
  }, []);

  return {
    loading,
    error,
    depositETH,
    depositToken,
    withdraw,
    getTotalLocked,
    generateEphemeralAddress
  };
}
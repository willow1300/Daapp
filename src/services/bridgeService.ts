import { ethers } from 'ethers';
import { PublicClient, WalletClient } from 'viem';
import { bridgeContracts } from '../config/web3';

// Bridge contract ABI (simplified)
const BRIDGE_ABI = [
  "function lockETH(bytes32 _ephemeralAddress) external payable",
  "function lockToken(address _token, uint256 _amount, bytes32 _ephemeralAddress) external",
  "function unlockAsset((bytes32,bytes32,address,address,uint256,bytes) _proof) external",
  "function totalLocked(address _token) external view returns (uint256)",
  "function currentStateCommitment() external view returns (bytes32)",
  "event AssetLocked(uint256 indexed depositId, address indexed user, address indexed token, uint256 amount, bytes32 ephemeralAddress)",
  "event AssetUnlocked(address indexed recipient, address indexed token, uint256 amount, bytes32 nullifier)"
];

export interface BridgeDeposit {
  user: string;
  token: string;
  amount: string;
  ephemeralAddress: string;
  timestamp: number;
  processed: boolean;
}

export interface WithdrawProof {
  stateCommitment: string;
  nullifier: string;
  recipient: string;
  token: string;
  amount: string;
  zkProof: string;
}

class BridgeService {
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;

  async initialize(provider: any, signer?: any) {
    // For now, we'll use a simple provider setup
    // In production, properly convert viem clients to ethers
    this.provider = provider;
    this.signer = signer || null;
  }

  private getBridgeContract(chainId: number = 1) {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const contractAddress = bridgeContracts.ethereum; // Default to Ethereum
    if (!contractAddress) {
      throw new Error('Bridge contract address not configured');
    }

    return new ethers.Contract(
      contractAddress,
      BRIDGE_ABI,
      this.signer || this.provider
    );
  }

  async lockETH(amount: string, ephemeralAddress: string): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer required for transactions');
    }

    const contract = this.getBridgeContract();
    const value = ethers.parseEther(amount);

    // Convert ephemeral address to bytes32
    const ephemeralBytes32 = ethers.keccak256(ethers.toUtf8Bytes(ephemeralAddress));

    return await contract.lockETH(ephemeralBytes32, { value });
  }

  async lockToken(
    tokenAddress: string,
    amount: string,
    ephemeralAddress: string
  ): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer required for transactions');
    }

    const contract = this.getBridgeContract();
    const tokenAmount = ethers.parseEther(amount);
    const ephemeralBytes32 = ethers.keccak256(ethers.toUtf8Bytes(ephemeralAddress));

    // First approve the token transfer
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ["function approve(address spender, uint256 amount) external returns (bool)"],
      this.signer
    );

    const approveTx = await tokenContract.approve(contract.target, tokenAmount);
    await approveTx.wait();

    // Then lock the tokens
    return await contract.lockToken(tokenAddress, tokenAmount, ephemeralBytes32);
  }

  async unlockAsset(proof: WithdrawProof): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer required for transactions');
    }

    const contract = this.getBridgeContract();

    // Convert proof to contract format
    const proofStruct = [
      proof.stateCommitment,
      proof.nullifier,
      proof.recipient,
      proof.token,
      ethers.parseEther(proof.amount),
      proof.zkProof
    ];

    return await contract.unlockAsset(proofStruct);
  }

  async getTotalLocked(tokenAddress: string = ethers.ZeroAddress): Promise<string> {
    const contract = this.getBridgeContract();
    const locked = await contract.totalLocked(tokenAddress);
    return ethers.formatEther(locked);
  }

  async getCurrentStateCommitment(): Promise<string> {
    const contract = this.getBridgeContract();
    return await contract.currentStateCommitment();
  }

  async getDepositEvents(fromBlock: number = 0): Promise<BridgeDeposit[]> {
    const contract = this.getBridgeContract();
    
    const filter = contract.filters.AssetLocked();
    const events = await contract.queryFilter(filter, fromBlock);

    return events.map(event => ({
      user: event.args![1],
      token: event.args![2],
      amount: ethers.formatEther(event.args![3]),
      ephemeralAddress: event.args![4],
      timestamp: Date.now(), // In production, get from block timestamp
      processed: false
    }));
  }

  async getWithdrawEvents(fromBlock: number = 0): Promise<any[]> {
    const contract = this.getBridgeContract();
    
    const filter = contract.filters.AssetUnlocked();
    const events = await contract.queryFilter(filter, fromBlock);

    return events.map(event => ({
      recipient: event.args![0],
      token: event.args![1],
      amount: ethers.formatEther(event.args![2]),
      nullifier: event.args![3],
      timestamp: Date.now()
    }));
  }

  generateEphemeralAddress(): string {
    // Generate a new ephemeral address
    const randomBytes = ethers.randomBytes(32);
    return 'ephm1' + ethers.hexlify(randomBytes).slice(2, 52);
  }
}

export const bridgeService = new BridgeService();
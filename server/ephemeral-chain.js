const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const CryptoJS = require('crypto-js');
const crypto = require('crypto');
const { ethers } = require('ethers');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// In-memory storage for ephemeral transactions (can be deleted)
let transactionBlackBox = new Map();
let currentState = {
  commitment: '0x' + CryptoJS.SHA256('genesis').toString(),
  blockHeight: 0,
  nullifiers: new Set(),
  notes: new Map(),
  activeNotes: 0
};

// SQLite database for persistent state (only commitments and nullifiers)
const db = new sqlite3.Database(':memory:');

// Initialize database
db.serialize(() => {
  db.run(`CREATE TABLE state_commitments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    commitment TEXT NOT NULL,
    block_height INTEGER NOT NULL,
    timestamp INTEGER NOT NULL,
    proof_hash TEXT
  )`);

  db.run(`CREATE TABLE nullifiers (
    nullifier TEXT PRIMARY KEY,
    timestamp INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE notes (
    commitment TEXT PRIMARY KEY,
    value INTEGER NOT NULL,
    recipient TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    spent BOOLEAN DEFAULT FALSE
  )`);
});

// Utility functions
function generateCommitment(value, recipient, randomness) {
  return CryptoJS.SHA256(`${value}:${recipient}:${randomness}`).toString();
}

function generateNullifier(privateKey, commitment) {
  return CryptoJS.SHA256(`${privateKey}:${commitment}`).toString();
}

function generateZKProof(stateTransition) {
  // Simplified proof generation - in production use circom/snarkjs
  return CryptoJS.SHA256(JSON.stringify(stateTransition)).toString();
}

// API Endpoints

// Get current chain state
app.get('/api/state', (req, res) => {
  res.json({
    currentCommitment: currentState.commitment,
    blockHeight: currentState.blockHeight,
    activeNotes: currentState.activeNotes,
    nullifierCount: currentState.nullifiers.size,
    proofGenerated: true
  });
});

// Submit transaction to black box (ephemeral storage)
app.post('/api/transaction', (req, res) => {
  const { from, to, amount, asset, signature } = req.body;
  
  if (!from || !to || !amount || !signature) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const txId = crypto.randomBytes(32).toString('hex');
  const transaction = {
    id: txId,
    from,
    to,
    amount: parseFloat(amount),
    asset: asset || 'ETH',
    signature,
    timestamp: Date.now(),
    processed: false
  };

  // Store in ephemeral black box
  transactionBlackBox.set(txId, transaction);

  // Process transaction asynchronously
  setTimeout(() => processTransaction(txId), 1000);

  res.json({ 
    success: true, 
    transactionId: txId,
    message: 'Transaction submitted to ephemeral pool'
  });
});

// Process transaction and update state
async function processTransaction(txId) {
  const tx = transactionBlackBox.get(txId);
  if (!tx || tx.processed) return;

  try {
    // Generate new notes
    const senderNote = generateCommitment(tx.amount, tx.from, crypto.randomBytes(16).toString('hex'));
    const recipientNote = generateCommitment(tx.amount, tx.to, crypto.randomBytes(16).toString('hex'));
    
    // Generate nullifier for spent note
    const nullifier = generateNullifier(tx.signature, senderNote);
    
    // Update state
    currentState.nullifiers.add(nullifier);
    currentState.notes.set(recipientNote, {
      value: tx.amount,
      recipient: tx.to,
      createdAt: Date.now()
    });
    currentState.activeNotes++;
    currentState.blockHeight++;
    
    // Generate new state commitment
    const stateData = {
      notes: Array.from(currentState.notes.keys()),
      nullifiers: Array.from(currentState.nullifiers),
      blockHeight: currentState.blockHeight
    };
    currentState.commitment = '0x' + CryptoJS.SHA256(JSON.stringify(stateData)).toString();
    
    // Generate zk proof
    const proof = generateZKProof({
      oldCommitment: currentState.commitment,
      newCommitment: currentState.commitment,
      transaction: { amount: tx.amount, nullifier }
    });

    // Persist only state commitment and nullifiers
    db.run(
      'INSERT INTO state_commitments (commitment, block_height, timestamp, proof_hash) VALUES (?, ?, ?, ?)',
      [currentState.commitment, currentState.blockHeight, Date.now(), proof]
    );

    db.run(
      'INSERT INTO nullifiers (nullifier, timestamp) VALUES (?, ?)',
      [nullifier, Date.now()]
    );

    db.run(
      'INSERT INTO notes (commitment, value, recipient, created_at) VALUES (?, ?, ?, ?)',
      [recipientNote, tx.amount, tx.to, Date.now()]
    );

    // Mark transaction as processed
    tx.processed = true;
    transactionBlackBox.set(txId, tx);

    console.log(`Transaction ${txId} processed. New state: ${currentState.commitment}`);
  } catch (error) {
    console.error('Error processing transaction:', error);
  }
}

// Get user balance (requires private key for note decryption)
app.post('/api/balance', (req, res) => {
  const { address, privateKey } = req.body;
  
  if (!address) {
    return res.status(400).json({ error: 'Address required' });
  }

  // Calculate balance from unspent notes
  let balance = 0;
  for (const [commitment, note] of currentState.notes) {
    if (note.recipient === address) {
      balance += note.value;
    }
  }

  res.json({ 
    address,
    balance,
    currency: 'ETH'
  });
});

// Get transaction pool (ephemeral data)
app.get('/api/txpool', (req, res) => {
  const pendingTxs = Array.from(transactionBlackBox.values())
    .filter(tx => !tx.processed)
    .map(tx => ({
      id: tx.id,
      from: tx.from.substring(0, 10) + '...',
      to: tx.to.substring(0, 10) + '...',
      amount: tx.amount,
      asset: tx.asset,
      timestamp: tx.timestamp
    }));

  res.json({
    pending: pendingTxs,
    totalPending: pendingTxs.length,
    processed: Array.from(transactionBlackBox.values()).filter(tx => tx.processed).length
  });
});

// Delete ephemeral transaction data (black box cleanup)
app.delete('/api/cleanup', (req, res) => {
  const { olderThan } = req.query;
  const cutoffTime = olderThan ? parseInt(olderThan) : Date.now() - (24 * 60 * 60 * 1000); // 24 hours default

  let deletedCount = 0;
  for (const [txId, tx] of transactionBlackBox) {
    if (tx.timestamp < cutoffTime && tx.processed) {
      transactionBlackBox.delete(txId);
      deletedCount++;
    }
  }

  res.json({
    success: true,
    deletedTransactions: deletedCount,
    remainingTransactions: transactionBlackBox.size,
    message: 'Ephemeral transaction data cleaned up'
  });
});

// Generate effect proof for cross-chain withdrawal
app.post('/api/effect-proof', (req, res) => {
  const { recipient, amount, token, nullifier } = req.body;

  if (!recipient || !amount || !nullifier) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Verify nullifier exists in our state
  if (!currentState.nullifiers.has(nullifier)) {
    return res.status(400).json({ error: 'Invalid nullifier' });
  }

  // Generate effect proof
  const effectProof = {
    stateCommitment: currentState.commitment,
    nullifier,
    recipient,
    token: token || ethers.ZeroAddress,
    amount: ethers.parseEther(amount.toString()),
    zkProof: generateZKProof({
      stateCommitment: currentState.commitment,
      effect: { recipient, amount, token, nullifier }
    })
  };

  res.json({
    success: true,
    proof: effectProof,
    message: 'Effect proof generated for cross-chain withdrawal'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    chainId: 31337,
    blockHeight: currentState.blockHeight,
    transactionsInBlackBox: transactionBlackBox.size
  });
});

app.listen(PORT, () => {
  console.log(`Ephemeral Chain server running on port ${PORT}`);
  console.log(`Chain ID: 31337`);
  console.log(`Genesis commitment: ${currentState.commitment}`);
});

// Cleanup job - runs every hour to delete old processed transactions
setInterval(() => {
  const cutoffTime = Date.now() - (2 * 60 * 60 * 1000); // 2 hours
  let deletedCount = 0;
  
  for (const [txId, tx] of transactionBlackBox) {
    if (tx.timestamp < cutoffTime && tx.processed) {
      transactionBlackBox.delete(txId);
      deletedCount++;
    }
  }
  
  if (deletedCount > 0) {
    console.log(`Auto-cleanup: Deleted ${deletedCount} old transactions from black box`);
  }
}, 60 * 60 * 1000); // Run every hour
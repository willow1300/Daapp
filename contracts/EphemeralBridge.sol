// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title EphemeralBridge
 * @dev Bridge contract for locking assets on Ethereum to be used on the ephemeral chain
 */
contract EphemeralBridge is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    struct DepositEvent {
        address user;
        address token;
        uint256 amount;
        bytes32 ephemeralAddress;
        uint256 timestamp;
        bool processed;
    }

    struct WithdrawProof {
        bytes32 stateCommitment;
        bytes32 nullifier;
        address recipient;
        address token;
        uint256 amount;
        bytes zkProof;
    }

    mapping(uint256 => DepositEvent) public deposits;
    mapping(bytes32 => bool) public usedNullifiers;
    mapping(address => uint256) public totalLocked;
    
    uint256 public depositCounter;
    bytes32 public currentStateCommitment;
    address public ephemeralChainValidator;

    event AssetLocked(
        uint256 indexed depositId,
        address indexed user,
        address indexed token,
        uint256 amount,
        bytes32 ephemeralAddress
    );

    event AssetUnlocked(
        address indexed recipient,
        address indexed token,
        uint256 amount,
        bytes32 nullifier
    );

    event StateCommitmentUpdated(bytes32 newCommitment);

    modifier onlyValidator() {
        require(msg.sender == ephemeralChainValidator, "Only validator can call");
        _;
    }

    constructor(address _validator) {
        ephemeralChainValidator = _validator;
    }

    /**
     * @dev Lock ETH to be used on ephemeral chain
     */
    function lockETH(bytes32 _ephemeralAddress) external payable nonReentrant {
        require(msg.value > 0, "Amount must be greater than 0");
        
        uint256 depositId = depositCounter++;
        deposits[depositId] = DepositEvent({
            user: msg.sender,
            token: address(0), // ETH
            amount: msg.value,
            ephemeralAddress: _ephemeralAddress,
            timestamp: block.timestamp,
            processed: false
        });

        totalLocked[address(0)] += msg.value;

        emit AssetLocked(depositId, msg.sender, address(0), msg.value, _ephemeralAddress);
    }

    /**
     * @dev Lock ERC20 tokens to be used on ephemeral chain
     */
    function lockToken(
        address _token,
        uint256 _amount,
        bytes32 _ephemeralAddress
    ) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(_token != address(0), "Invalid token address");

        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        uint256 depositId = depositCounter++;
        deposits[depositId] = DepositEvent({
            user: msg.sender,
            token: _token,
            amount: _amount,
            ephemeralAddress: _ephemeralAddress,
            timestamp: block.timestamp,
            processed: false
        });

        totalLocked[_token] += _amount;

        emit AssetLocked(depositId, msg.sender, _token, _amount, _ephemeralAddress);
    }

    /**
     * @dev Unlock assets using effect proof from ephemeral chain
     */
    function unlockAsset(WithdrawProof calldata _proof) external nonReentrant {
        require(!usedNullifiers[_proof.nullifier], "Nullifier already used");
        require(_verifyEffectProof(_proof), "Invalid effect proof");

        usedNullifiers[_proof.nullifier] = true;

        if (_proof.token == address(0)) {
            // ETH withdrawal
            require(address(this).balance >= _proof.amount, "Insufficient ETH balance");
            totalLocked[address(0)] -= _proof.amount;
            payable(_proof.recipient).transfer(_proof.amount);
        } else {
            // ERC20 withdrawal
            require(
                IERC20(_proof.token).balanceOf(address(this)) >= _proof.amount,
                "Insufficient token balance"
            );
            totalLocked[_proof.token] -= _proof.amount;
            IERC20(_proof.token).safeTransfer(_proof.recipient, _proof.amount);
        }

        emit AssetUnlocked(_proof.recipient, _proof.token, _proof.amount, _proof.nullifier);
    }

    /**
     * @dev Update state commitment (called by ephemeral chain validator)
     */
    function updateStateCommitment(bytes32 _newCommitment) external onlyValidator {
        currentStateCommitment = _newCommitment;
        emit StateCommitmentUpdated(_newCommitment);
    }

    /**
     * @dev Verify effect proof (simplified for demo - in production use proper zk verification)
     */
    function _verifyEffectProof(WithdrawProof calldata _proof) internal view returns (bool) {
        // Simplified verification - in production, this would verify zk-SNARK proof
        // For now, we check basic constraints and signature from validator
        return _proof.stateCommitment == currentStateCommitment && 
               _proof.amount > 0 && 
               _proof.recipient != address(0);
    }

    /**
     * @dev Set new validator address
     */
    function setValidator(address _newValidator) external onlyOwner {
        ephemeralChainValidator = _newValidator;
    }

    /**
     * @dev Get deposit information
     */
    function getDeposit(uint256 _depositId) external view returns (DepositEvent memory) {
        return deposits[_depositId];
    }

    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        if (_token == address(0)) {
            payable(owner()).transfer(_amount);
        } else {
            IERC20(_token).safeTransfer(owner(), _amount);
        }
    }
}
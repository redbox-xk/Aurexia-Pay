// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IPaymentRouter {
    struct PaymentIntent {
        bytes32 id;
        address merchant;
        uint256 amount;
        address token;
        uint256 expiry;
        uint8 status; // 0: pending, 1: confirmed, 2: succeeded, 3: failed
        bytes metadata;
    }

    event PaymentIntentCreated(bytes32 indexed id, address indexed merchant, uint256 amount);
    event PaymentConfirmed(bytes32 indexed id, address indexed payer);
    event PaymentSucceeded(bytes32 indexed id);
    event PaymentFailed(bytes32 indexed id);
    event FeeDistributed(bytes32 indexed id, uint256 feeAmount);
}

contract PaymentRouter is AccessControl, ReentrancyGuard, Pausable, IPaymentRouter {
    bytes32 public constant MERCHANT_ROLE = keccak256("MERCHANT_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    uint256 public baseFeePercent = 29; // 0.29%
    uint256 public fixedFeeWei = 500000000000000; // $0.005 in wei
    uint256 public totalFeesCollected;
    
    mapping(bytes32 => PaymentIntent) public paymentIntents;
    mapping(address => uint256) public merchantBalance;
    mapping(address => bool) public supportedTokens;
    
    address public feeRecipient;
    
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        feeRecipient = msg.sender;
    }
    
    // Create a payment intent (Stripe-like)
    function createPaymentIntent(
        uint256 amount,
        address token,
        uint256 expiryDuration,
        bytes calldata metadata
    ) external onlyRole(MERCHANT_ROLE) returns (bytes32) {
        require(amount > 0, "Amount must be positive");
        require(supportedTokens[token], "Token not supported");
        require(expiryDuration > 0, "Invalid expiry");
        
        bytes32 id = keccak256(abi.encodePacked(msg.sender, amount, block.timestamp));
        
        PaymentIntent storage intent = paymentIntents[id];
        intent.id = id;
        intent.merchant = msg.sender;
        intent.amount = amount;
        intent.token = token;
        intent.expiry = block.timestamp + expiryDuration;
        intent.status = 0; // pending
        intent.metadata = metadata;
        
        emit PaymentIntentCreated(id, msg.sender, amount);
        return id;
    }
    
    // Confirm payment (customer sends tokens)
    function confirmPayment(bytes32 paymentId, address payer) 
        external 
        nonReentrant 
        returns (bool) 
    {
        PaymentIntent storage intent = paymentIntents[paymentId];
        require(intent.merchant != address(0), "Payment intent not found");
        require(intent.status == 0, "Invalid payment status");
        require(block.timestamp <= intent.expiry, "Payment expired");
        
        // Transfer tokens from payer to this contract
        IERC20 token = IERC20(intent.token);
        require(
            token.transferFrom(payer, address(this), intent.amount),
            "Transfer failed"
        );
        
        intent.status = 1; // confirmed
        emit PaymentConfirmed(paymentId, payer);
        
        // Process settlement
        _settlePayment(paymentId);
        return true;
    }
    
    // Internal settlement logic
    function _settlePayment(bytes32 paymentId) internal {
        PaymentIntent storage intent = paymentIntents[paymentId];
        require(intent.status == 1, "Invalid payment status");
        
        // Calculate fees
        uint256 feeAmount = (intent.amount * baseFeePercent) / 10000 + fixedFeeWei;
        uint256 merchantAmount = intent.amount - feeAmount;
        
        // Distribute fees
        totalFeesCollected += feeAmount;
        merchantBalance[feeRecipient] += feeAmount;
        
        // Credit merchant
        merchantBalance[intent.merchant] += merchantAmount;
        
        intent.status = 2; // succeeded
        emit PaymentSucceeded(paymentId);
        emit FeeDistributed(paymentId, feeAmount);
    }
    
    // Merchant withdrawal
    function withdrawBalance(address token) external nonReentrant {
        uint256 amount = merchantBalance[msg.sender];
        require(amount > 0, "No balance to withdraw");
        
        merchantBalance[msg.sender] = 0;
        require(IERC20(token).transfer(msg.sender, amount), "Withdrawal failed");
    }
    
    // Admin functions
    function addSupportedToken(address token) external onlyRole(ADMIN_ROLE) {
        supportedTokens[token] = true;
    }
    
    function removeSupportedToken(address token) external onlyRole(ADMIN_ROLE) {
        supportedTokens[token] = false;
    }
    
    function setBaseFee(uint256 feePercent) external onlyRole(ADMIN_ROLE) {
        require(feePercent <= 1000, "Fee too high");
        baseFeePercent = feePercent;
    }
    
    function setFixedFee(uint256 feeWei) external onlyRole(ADMIN_ROLE) {
        fixedFeeWei = feeWei;
    }
    
    function setFeeRecipient(address recipient) external onlyRole(ADMIN_ROLE) {
        require(recipient != address(0), "Invalid recipient");
        feeRecipient = recipient;
    }
    
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}

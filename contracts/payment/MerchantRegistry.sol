// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * Merchant Registry - Manage merchant accounts and KYC compliance
 * 
 * Features:
 * - Merchant registration and verification
 * - KYC/AML compliance tracking
 * - Tier-based limits and fees
 * - Dispute resolution
 */
contract MerchantRegistry is AccessControl, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant KYC_VERIFIER_ROLE = keccak256("KYC_VERIFIER_ROLE");
    bytes32 public constant DISPUTES_ROLE = keccak256("DISPUTES_ROLE");

    enum MerchantTier {
        UNVERIFIED,
        BASIC,
        STANDARD,
        PREMIUM,
        ENTERPRISE
    }

    enum KYCStatus {
        PENDING,
        VERIFIED,
        REJECTED,
        UNDER_REVIEW
    }

    struct Merchant {
        address wallet;
        string name;
        string email;
        uint256 monthlyVolume;
        uint256 totalTransactions;
        MerchantTier tier;
        KYCStatus kycStatus;
        uint256 registeredAt;
        uint256 verifiedAt;
        bool active;
        uint256 monthlyLimit;
        uint256 transactionLimit;
        uint256 suspensionStartTime;
    }

    struct TierLimits {
        uint256 monthlyVolume;
        uint256 transactionAmount;
        uint256 baseFeePercent; // In basis points (100 = 1%)
        uint256 fixedFeeWei;
        bool kycRequired;
    }

    mapping(address => Merchant) public merchants;
    mapping(MerchantTier => TierLimits) public tierLimits;
    mapping(address => uint256) public monthlyVolumes; // Reset monthly
    mapping(address => uint256) public lastMonthReset;
    mapping(address => uint256[]) public transactionHistory;

    uint256 public totalMerchants;
    uint256 public verifiedMerchants;

    address public owner;

    event MerchantRegistered(address indexed merchant, string name);
    event MerchantVerified(address indexed merchant, MerchantTier tier);
    event MerchantSuspended(address indexed merchant, string reason);
    event MerchantReactivated(address indexed merchant);
    event TierUpgraded(address indexed merchant, MerchantTier newTier);
    event TransactionRecorded(address indexed merchant, uint256 amount);
    event DisputeFiled(address indexed merchant, uint256 transactionId);
    event DisputeResolved(address indexed merchant, uint256 transactionId, bool merchantWon);

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(KYC_VERIFIER_ROLE, msg.sender);
        _setupRole(DISPUTES_ROLE, msg.sender);
        owner = msg.sender;

        // Initialize tier limits
        tierLimits[MerchantTier.BASIC] = TierLimits({
            monthlyVolume: 10000 * 10 ** 18,
            transactionAmount: 100 * 10 ** 18,
            baseFeePercent: 40, // 0.40%
            fixedFeeWei: 1000000000000000, // $0.001
            kycRequired: false
        });

        tierLimits[MerchantTier.STANDARD] = TierLimits({
            monthlyVolume: 100000 * 10 ** 18,
            transactionAmount: 1000 * 10 ** 18,
            baseFeePercent: 35, // 0.35%
            fixedFeeWei: 800000000000000,
            kycRequired: true
        });

        tierLimits[MerchantTier.PREMIUM] = TierLimits({
            monthlyVolume: 1000000 * 10 ** 18,
            transactionAmount: 10000 * 10 ** 18,
            baseFeePercent: 29, // 0.29%
            fixedFeeWei: 500000000000000, // $0.005
            kycRequired: true
        });

        tierLimits[MerchantTier.ENTERPRISE] = TierLimits({
            monthlyVolume: type(uint256).max,
            transactionAmount: type(uint256).max,
            baseFeePercent: 20, // 0.20%
            fixedFeeWei: 200000000000000, // $0.002
            kycRequired: true
        });
    }

    // Register new merchant
    function registerMerchant(
        string calldata name,
        string calldata email
    ) external returns (bool) {
        require(merchants[msg.sender].wallet == address(0), "Already registered");
        require(bytes(name).length > 0, "Invalid name");
        require(bytes(email).length > 0, "Invalid email");

        merchants[msg.sender] = Merchant({
            wallet: msg.sender,
            name: name,
            email: email,
            monthlyVolume: 0,
            totalTransactions: 0,
            tier: MerchantTier.UNVERIFIED,
            kycStatus: KYCStatus.PENDING,
            registeredAt: block.timestamp,
            verifiedAt: 0,
            active: true,
            monthlyLimit: tierLimits[MerchantTier.BASIC].monthlyVolume,
            transactionLimit: tierLimits[MerchantTier.BASIC].transactionAmount,
            suspensionStartTime: 0
        });

        totalMerchants++;
        emit MerchantRegistered(msg.sender, name);

        return true;
    }

    // Verify merchant KYC
    function verifyMerchant(address merchant, MerchantTier newTier)
        external
        onlyRole(KYC_VERIFIER_ROLE)
    {
        require(merchants[merchant].wallet != address(0), "Merchant not found");
        require(newTier != MerchantTier.UNVERIFIED, "Invalid tier");

        Merchant storage merchantData = merchants[merchant];
        merchantData.tier = newTier;
        merchantData.kycStatus = KYCStatus.VERIFIED;
        merchantData.verifiedAt = block.timestamp;
        merchantData.monthlyLimit = tierLimits[newTier].monthlyVolume;
        merchantData.transactionLimit = tierLimits[newTier].transactionAmount;

        verifiedMerchants++;
        emit MerchantVerified(merchant, newTier);
    }

    // Record transaction
    function recordTransaction(address merchant, uint256 amount)
        external
        onlyRole(ADMIN_ROLE)
        returns (bool)
    {
        Merchant storage merchantData = merchants[merchant];
        require(merchantData.wallet != address(0), "Merchant not found");
        require(merchantData.active, "Merchant suspended");

        // Reset monthly volume if new month
        if (lastMonthReset[merchant] == 0 || (block.timestamp - lastMonthReset[merchant] > 30 days)) {
            monthlyVolumes[merchant] = 0;
            lastMonthReset[merchant] = block.timestamp;
        }

        // Check limits
        require(
            monthlyVolumes[merchant] + amount <= merchantData.monthlyLimit,
            "Monthly limit exceeded"
        );
        require(
            amount <= merchantData.transactionLimit,
            "Transaction limit exceeded"
        );

        // Update metrics
        monthlyVolumes[merchant] += amount;
        merchantData.monthlyVolume = monthlyVolumes[merchant];
        merchantData.totalTransactions++;
        transactionHistory[merchant].push(block.timestamp);

        // Auto-upgrade if eligible
        _checkAndUpgradeTier(merchant);

        emit TransactionRecorded(merchant, amount);
        return true;
    }

    // Check and auto-upgrade tier
    function _checkAndUpgradeTier(address merchant) internal {
        Merchant storage merchantData = merchants[merchant];
        uint256 volume = monthlyVolumes[merchant];

        if (
            merchantData.tier == MerchantTier.BASIC &&
            volume >= 100000 * 10 ** 18
        ) {
            merchantData.tier = MerchantTier.STANDARD;
            merchantData.monthlyLimit = tierLimits[MerchantTier.STANDARD].monthlyVolume;
            emit TierUpgraded(merchant, MerchantTier.STANDARD);
        } else if (
            merchantData.tier == MerchantTier.STANDARD &&
            volume >= 1000000 * 10 ** 18
        ) {
            merchantData.tier = MerchantTier.PREMIUM;
            merchantData.monthlyLimit = tierLimits[MerchantTier.PREMIUM].monthlyVolume;
            emit TierUpgraded(merchant, MerchantTier.PREMIUM);
        }
    }

    // Suspend merchant
    function suspendMerchant(address merchant, string calldata reason)
        external
        onlyRole(ADMIN_ROLE)
    {
        require(merchants[merchant].wallet != address(0), "Merchant not found");
        merchants[merchant].active = false;
        merchants[merchant].suspensionStartTime = block.timestamp;
        emit MerchantSuspended(merchant, reason);
    }

    // Reactivate merchant
    function reactivateMerchant(address merchant) external onlyRole(ADMIN_ROLE) {
        require(merchants[merchant].wallet != address(0), "Merchant not found");
        merchants[merchant].active = true;
        merchants[merchant].suspensionStartTime = 0;
        emit MerchantReactivated(merchant);
    }

    // File dispute
    function fileDispute(uint256 transactionId) external {
        require(merchants[msg.sender].wallet != address(0), "Not a merchant");
        emit DisputeFiled(msg.sender, transactionId);
    }

    // Resolve dispute
    function resolveDispute(
        address merchant,
        uint256 transactionId,
        bool merchantWon
    ) external onlyRole(DISPUTES_ROLE) {
        emit DisputeResolved(merchant, transactionId, merchantWon);
    }

    // Get merchant info
    function getMerchantInfo(address merchant)
        external
        view
        returns (
            string memory name,
            MerchantTier tier,
            KYCStatus kycStatus,
            bool active,
            uint256 monthlyVolume,
            uint256 totalTransactions
        )
    {
        Merchant memory m = merchants[merchant];
        return (m.name, m.tier, m.kycStatus, m.active, m.monthlyVolume, m.totalTransactions);
    }

    // Get tier limits
    function getTierLimits(MerchantTier tier)
        external
        view
        returns (TierLimits memory)
    {
        return tierLimits[tier];
    }

    // Pause/unpause
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}

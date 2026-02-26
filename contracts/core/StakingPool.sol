// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * Staking Pool - Earn rewards by staking AURX tokens
 * 
 * Features:
 * - Variable APY (12-24%)
 * - Minimum stake: 100 AURX
 * - Lockup periods: 7, 30, 90, 365 days
 * - Auto-compounding rewards
 * - Slashing for validator misbehavior
 */
contract StakingPool is ReentrancyGuard, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant SLASHER_ROLE = keccak256("SLASHER_ROLE");

    IERC20 public aurxToken;

    uint256 public constant MIN_STAKE = 100 * 10 ** 18;
    uint256 public constant REWARD_PRECISION = 1e18;

    // APY rates for different lockup periods (in basis points, 100 = 1%)
    uint256 public apySevenDays = 1200; // 12%
    uint256 public apyThirtyDays = 1500; // 15%
    uint256 public apyNinetyDays = 1800; // 18%
    uint256 public apyThreeSixtyFiveDays = 2400; // 24%

    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lockupPeriod;
        uint256 lastRewardTime;
        uint256 accumulatedRewards;
        bool isValidator;
        uint256 slashAmount;
    }

    mapping(address => StakeInfo) public stakes;
    mapping(address => bool) public validators;

    uint256 public totalStaked;
    uint256 public totalRewardsDistributed;
    uint256 public totalSlashed;

    address public rewardFund;

    event Staked(address indexed staker, uint256 amount, uint256 lockupPeriod);
    event Unstaked(address indexed staker, uint256 amount, uint256 rewards);
    event RewardsClaimed(address indexed staker, uint256 amount);
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    event Slashed(address indexed validator, uint256 amount, string reason);
    event APYUpdated(uint256 period, uint256 newAPY);

    constructor(address _aurxToken, address _rewardFund) {
        aurxToken = IERC20(_aurxToken);
        rewardFund = _rewardFund;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(SLASHER_ROLE, msg.sender);
    }

    // Stake tokens
    function stake(uint256 amount, uint256 lockupDays) external nonReentrant {
        require(amount >= MIN_STAKE, "Amount below minimum stake");
        require(
            lockupDays == 7 || lockupDays == 30 || lockupDays == 90 || lockupDays == 365,
            "Invalid lockup period"
        );

        // Transfer tokens from user
        require(
            aurxToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        // Claim existing rewards if any
        if (stakes[msg.sender].amount > 0) {
            _claimRewards(msg.sender);
        }

        // Create or update stake
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].startTime = block.timestamp;
        stakes[msg.sender].lockupPeriod = lockupDays * 1 days;
        stakes[msg.sender].lastRewardTime = block.timestamp;

        totalStaked += amount;

        emit Staked(msg.sender, amount, lockupDays);
    }

    // Calculate pending rewards
    function getPendingRewards(address staker) public view returns (uint256) {
        StakeInfo memory stakeInfo = stakes[staker];
        if (stakeInfo.amount == 0) return 0;

        uint256 apy = _getAPY(stakeInfo.lockupPeriod);
        uint256 timeElapsed = block.timestamp - stakeInfo.lastRewardTime;
        
        // Calculate annual reward, then pro-rata for time elapsed
        uint256 annualReward = (stakeInfo.amount * apy) / 10000;
        uint256 reward = (annualReward * timeElapsed) / 365 days;

        return reward;
    }

    // Claim rewards
    function claimRewards() external nonReentrant {
        _claimRewards(msg.sender);
    }

    function _claimRewards(address staker) internal {
        uint256 rewards = getPendingRewards(staker);
        require(rewards > 0, "No rewards to claim");

        stakes[staker].accumulatedRewards += rewards;
        stakes[staker].lastRewardTime = block.timestamp;
        totalRewardsDistributed += rewards;

        require(aurxToken.transfer(staker, rewards), "Reward transfer failed");

        emit RewardsClaimed(staker, rewards);
    }

    // Unstake tokens
    function unstake() external nonReentrant {
        StakeInfo memory stakeInfo = stakes[msg.sender];
        require(stakeInfo.amount > 0, "No stake found");
        require(
            block.timestamp >= stakeInfo.startTime + stakeInfo.lockupPeriod,
            "Lockup period not complete"
        );

        // Claim pending rewards first
        _claimRewards(msg.sender);

        uint256 amount = stakeInfo.amount;
        uint256 rewards = stakeInfo.accumulatedRewards;

        // Clear stake
        delete stakes[msg.sender];
        totalStaked -= amount;

        // Transfer tokens back
        require(
            aurxToken.transfer(msg.sender, amount + rewards),
            "Transfer failed"
        );

        emit Unstaked(msg.sender, amount, rewards);
    }

    // Validator functions
    function addValidator(address validator) external onlyRole(ADMIN_ROLE) {
        require(stakes[validator].amount >= MIN_STAKE * 10, "Insufficient stake for validator");
        validators[validator] = true;
        stakes[validator].isValidator = true;
        emit ValidatorAdded(validator);
    }

    function removeValidator(address validator) external onlyRole(ADMIN_ROLE) {
        validators[validator] = false;
        stakes[validator].isValidator = false;
        emit ValidatorRemoved(validator);
    }

    function slash(
        address validator,
        uint256 amount,
        string calldata reason
    ) external onlyRole(SLASHER_ROLE) {
        require(validators[validator], "Not a validator");
        require(stakes[validator].amount >= amount, "Insufficient stake to slash");

        stakes[validator].amount -= amount;
        stakes[validator].slashAmount += amount;
        totalSlashed += amount;

        // Burn slashed tokens
        require(aurxToken.transfer(address(0), amount), "Slash failed");

        emit Slashed(validator, amount, reason);
    }

    // Admin functions
    function setAPY(uint256 period, uint256 newAPY) external onlyRole(ADMIN_ROLE) {
        require(newAPY <= 5000, "APY too high"); // Max 50%
        
        if (period == 7) apySevenDays = newAPY;
        else if (period == 30) apyThirtyDays = newAPY;
        else if (period == 90) apyNinetyDays = newAPY;
        else if (period == 365) apyThreeSixtyFiveDays = newAPY;
        else revert("Invalid period");

        emit APYUpdated(period, newAPY);
    }

    function setRewardFund(address _rewardFund) external onlyRole(ADMIN_ROLE) {
        rewardFund = _rewardFund;
    }

    // View functions
    function _getAPY(uint256 lockupPeriod) internal view returns (uint256) {
        if (lockupPeriod == 7 days) return apySevenDays;
        if (lockupPeriod == 30 days) return apyThirtyDays;
        if (lockupPeriod == 90 days) return apyNinetyDays;
        if (lockupPeriod == 365 days) return apyThreeSixtyFiveDays;
        return 0;
    }

    function getStakeInfo(address staker)
        external
        view
        returns (
            uint256 amount,
            uint256 pendingRewards,
            uint256 lockupPeriodDays,
            bool isValidator,
            uint256 lockupEndTime
        )
    {
        StakeInfo memory info = stakes[staker];
        return (
            info.amount,
            getPendingRewards(staker),
            info.lockupPeriod / 1 days,
            info.isValidator,
            info.startTime + info.lockupPeriod
        );
    }
}

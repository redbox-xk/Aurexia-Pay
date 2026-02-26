// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract TokenFactory is Ownable, ReentrancyGuard {
    enum FeeType { STANDARD, REFLECTIVE, AUTO_LP, REWARD, DUAL, DEFLATIONARY, INFLATIONARY, CUSTOM }
    enum Chain { AUREXIA_MAINNET, ETHEREUM, POLYGON, ARBITRUM, OPTIMISM, BSC, AVALANCHE, FANTOM }

    struct FeeConfig {
        uint256 buyFee;
        uint256 sellFee;
        uint256 transferFee;
        uint256 reflectionFee;
        uint256 liquidityFee;
        uint256 marketingFee;
        uint256 burnFee;
        uint256 rewardFee;
        address rewardToken;
        address marketingWallet;
        address lpPair;
        uint256 minTokenBalanceForFee;
    }

    struct TokenConfig {
        string name;
        string symbol;
        uint256 totalSupply;
        uint8 decimals;
        FeeType feeType;
        FeeConfig fees;
        bool hasMintable;
        bool hasBurnable;
        bool hasPausable;
        bool hasSnapshot;
        bool hasPermit;
        bool hasVotes;
        bool hasBlacklist;
        address owner;
        uint256 maxTxAmount;
        uint256 maxWalletAmount;
        bool excludeFromFees;
        Chain[] chains;
        uint256 creationFee;
        address referrer;
    }

    struct DeployedToken {
        address tokenAddress;
        string name;
        string symbol;
        address owner;
        Chain chain;
        uint256 deployedAt;
        FeeType feeType;
        bool verified;
        string txHash;
    }

    struct FactoryFee {
        uint256 creationFee;
        uint256 multiChainFee;
        uint256 priorityFee;
        uint256 verificationFee;
        uint256 auditFee;
        uint256 referralShare;
    }

    mapping(address => DeployedToken[]) public userTokens;
    mapping(Chain => uint256) public chainDeploymentCount;
    mapping(Chain => bool) public chainActive;

    FactoryFee public factoryFee;
    address public feeCollector;
    uint256 public totalTokensDeployed;

    event TokenDeployed(address indexed tokenAddress, string name, string symbol, address indexed owner, Chain chain, FeeType feeType, uint256 fee);

    constructor(address _feeCollector) {
        feeCollector = _feeCollector;
        factoryFee = FactoryFee({
            creationFee: 1000 * 10**18,
            multiChainFee: 500 * 10**18,
            priorityFee: 2000 * 10**18,
            verificationFee: 100 * 10**18,
            auditFee: 5000 * 10**18,
            referralShare: 1000
        });

        chainActive[Chain.AUREXIA_MAINNET] = true;
        chainActive[Chain.ETHEREUM] = true;
        chainActive[Chain.POLYGON] = true;
        chainActive[Chain.BSC] = true;
    }

    function deployToken(TokenConfig calldata config)
        external
        payable
        nonReentrant
        returns (address tokenAddress)
    {
        uint256 totalFee = factoryFee.creationFee;
        if (config.chains.length > 1) totalFee += factoryFee.multiChainFee * (config.chains.length - 1);
        require(msg.value >= totalFee, "TokenFactory: insufficient fee");

        if (config.chains[0] == Chain.AUREXIA_MAINNET) tokenAddress = _deployOnAurexia(config);
        else revert("TokenFactory: chain not supported");

        userTokens[config.owner].push(DeployedToken({
            tokenAddress: tokenAddress,
            name: config.name,
            symbol: config.symbol,
            owner: config.owner,
            chain: config.chains[0],
            deployedAt: block.timestamp,
            feeType: config.feeType,
            verified: false,
            txHash: ""
        }));

        totalTokensDeployed++;
        chainDeploymentCount[config.chains[0]]++;

        if (config.referrer != address(0)) {
            uint256 referralAmount = (totalFee * factoryFee.referralShare) / 10000;
            payable(config.referrer).transfer(referralAmount);
        }

        payable(feeCollector).transfer(totalFee);

        emit TokenDeployed(tokenAddress, config.name, config.symbol, config.owner, config.chains[0], config.feeType, totalFee);
        return tokenAddress;
    }

    function _deployOnAurexia(TokenConfig calldata config) internal returns (address) {
        bytes32 salt = keccak256(abi.encodePacked(config.name, config.symbol, config.owner, block.timestamp));

        if (config.feeType == FeeType.STANDARD) {
            return address(new StandardToken{salt: salt}(config.name, config.symbol, config.totalSupply, config.decimals, config.owner, config.fees));
        } else if (config.feeType == FeeType.REFLECTIVE) {
            return address(new ReflectiveToken{salt: salt}(config.name, config.symbol, config.totalSupply, config.decimals, config.owner, config.fees));
        } else if (config.feeType == FeeType.AUTO_LP) {
            return address(new AutoLPToken{salt: salt}(config.name, config.symbol, config.totalSupply, config.decimals, config.owner, config.fees));
        }

        revert("TokenFactory: fee type not implemented");
    }
}

contract StandardToken is ERC20, ERC20Burnable, ERC20Snapshot, AccessControl, Pausable, ERC20Permit {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant BLACKLISTER_ROLE = keccak256("BLACKLISTER_ROLE");

    TokenFactory.FeeConfig public feeConfig;
    mapping(address => bool) public isExcludedFromFees;
    mapping(address => bool) public isBlacklisted;

    uint256 public maxTxAmount;

    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint8,
        address owner,
        TokenFactory.FeeConfig memory _feeConfig
    ) ERC20(name, symbol) ERC20Permit(name) {
        feeConfig = _feeConfig;
        maxTxAmount = totalSupply;

        _grantRole(DEFAULT_ADMIN_ROLE, owner);
        _grantRole(MINTER_ROLE, owner);
        _grantRole(PAUSER_ROLE, owner);
        _grantRole(BLACKLISTER_ROLE, owner);
        _mint(owner, totalSupply);
        isExcludedFromFees[owner] = true;
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Snapshot)
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}

contract ReflectiveToken is StandardToken {
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint8 decimals,
        address owner,
        TokenFactory.FeeConfig memory _feeConfig
    ) StandardToken(name, symbol, totalSupply, decimals, owner, _feeConfig) {}
}

contract AutoLPToken is StandardToken {
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint8 decimals,
        address owner,
        TokenFactory.FeeConfig memory _feeConfig
    ) StandardToken(name, symbol, totalSupply, decimals, owner, _feeConfig) {}
}

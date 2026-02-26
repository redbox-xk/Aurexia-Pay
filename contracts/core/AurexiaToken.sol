// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";

/**
 * AURX Token - The native currency of Aurexia Payment Layer 1
 * 
 * Features:
 * - 1 billion total supply
 * - 18 decimals precision
 * - Burnable tokens
 * - Role-based access control
 * - Snapshot capability for governance
 */
contract AurexiaToken is ERC20, ERC20Burnable, AccessControl, ERC20Snapshot {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant SNAPSHOT_ROLE = keccak256("SNAPSHOT_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10 ** 18; // 1 billion AURX

    // Supply distribution
    uint256 public constant FOUNDATION_SUPPLY = 200_000_000 * 10 ** 18;
    uint256 public constant TEAM_SUPPLY = 150_000_000 * 10 ** 18;
    uint256 public constant COMMUNITY_SUPPLY = 300_000_000 * 10 ** 18;
    uint256 public constant ECOSYSTEM_SUPPLY = 200_000_000 * 10 ** 18;
    uint256 public constant LIQUIDITY_SUPPLY = 150_000_000 * 10 ** 18;

    bool public paused;

    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    event Paused(address indexed by);
    event Unpaused(address indexed by);

    constructor(
        address foundation,
        address team,
        address community,
        address ecosystem,
        address liquidity
    ) ERC20("Aurexia", "AURX") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(SNAPSHOT_ROLE, msg.sender);
        _setupRole(PAUSER_ROLE, msg.sender);

        // Distribute tokens
        _mint(foundation, FOUNDATION_SUPPLY);
        _mint(team, TEAM_SUPPLY);
        _mint(community, COMMUNITY_SUPPLY);
        _mint(ecosystem, ECOSYSTEM_SUPPLY);
        _mint(liquidity, LIQUIDITY_SUPPLY);

        require(totalSupply() == TOTAL_SUPPLY, "Supply mismatch");
    }

    function snapshot() public onlyRole(SNAPSHOT_ROLE) {
        _snapshot();
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        paused = false;
        emit Unpaused(msg.sender);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(!paused, "Minting is paused");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    function burn(uint256 amount) public override {
        super.burn(amount);
        emit TokensBurned(msg.sender, amount);
    }

    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
        emit TokensBurned(account, amount);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Snapshot) {
        require(!paused, "Token transfers are paused");
        super._beforeTokenTransfer(from, to, amount);
    }

    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Snapshot) {
        super._update(from, to, amount);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit)
        returns (uint256)
    {
        return super.nonces(owner);
    }

    function decimals() public pure override returns (uint8) {
        return 18;
    }
}

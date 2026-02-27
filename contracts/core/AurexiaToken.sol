// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";

contract AurexiaToken is ERC20, Ownable, Pausable, ERC20Burnable, ERC20Snapshot {
    uint8 private _decimals;
    mapping(address => bool) public blacklist;
    
    event BlacklistAdded(address indexed account);
    event BlacklistRemoved(address indexed account);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 initialSupply,
        address initialOwner
    ) ERC20(name, symbol) {
        _decimals = decimals_;
        _mint(initialOwner, initialSupply * 10 ** decimals_);
        transferOwnership(initialOwner);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    function burn(uint256 amount) public override {
        super.burn(amount);
        emit TokensBurned(_msgSender(), amount);
    }
    
    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
        emit TokensBurned(account, amount);
    }
    
    function snapshot() external onlyOwner returns (uint256) {
        return _snapshot();
    }
    
    function addToBlacklist(address account) external onlyOwner {
        require(account != address(0), "Invalid address");
        require(!blacklist[account], "Already blacklisted");
        blacklist[account] = true;
        emit BlacklistAdded(account);
    }
    
    function removeFromBlacklist(address account) external onlyOwner {
        require(blacklist[account], "Not blacklisted");
        blacklist[account] = false;
        emit BlacklistRemoved(account);
    }
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Snapshot) whenNotPaused {
        require(!blacklist[from] && !blacklist[to], "Address is blacklisted");
        super._beforeTokenTransfer(from, to, amount);
    }
    
    // Bridge functions
    function bridgeMint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    function bridgeBurn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}

export const AUREXIA_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_AUREXIA_TOKEN_ADDRESS || ''

export const AUREXIA_TOKEN_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint amount) returns (bool)',
  'function mint(address to, uint256 amount)',
  'function burn(uint256 amount)',
  'function pause()',
  'function unpause()',
  'function isLocked(address) view returns (bool)',
  'function getLockEndTime(address) view returns (uint256)',
  'function stake(uint256 amount)',
  'function unstake(uint256 amount)',
  'function claimRewards()',
  'function getFeeDiscount(address) view returns (uint256)',
]

export const PAYMENT_ROUTER_ABI = [
  'function createPaymentIntent(address merchant, uint256 amount, string calldata reference) returns (bytes32)',
  'function confirmPayment(bytes32 paymentId, address customer)',
  'function getPayment(bytes32 paymentId) view returns (tuple(address payer, address payee, uint256 amount, uint256 fee, bool processed))',
  'function registerMerchant(address wallet, string calldata name, string calldata webhookUrl)',
]

export const BRIDGE_ABI = [
  'function bridge(address token, uint256 amount, address recipient, uint8 targetChain) returns (bytes32)',
  'function completeBridge(bytes32 txId, bytes calldata signature)',
  'function getBridgeTransaction(bytes32 txId) view returns (tuple(address sender, address recipient, address token, uint256 amount, uint8 sourceChain, uint8 targetChain, uint256 timestamp, bool processed))',
]

/**
 * Aurexia Smart Contract Deployment Script
 * Deploys all contracts to the Aurexia mainnet
 */

const fs = require('fs');
const path = require('path');
const Web3 = require('web3');

// Configuration
const CONFIG = {
  RPC_URL: process.env.RPC_URL || 'http://localhost:8545',
  DEPLOYER_PRIVATE_KEY: process.env.DEPLOYER_PRIVATE_KEY || '0x' + '1'.repeat(64),
  NETWORK: process.env.NETWORK || 'mainnet',
  GAS_LIMIT: 8000000,
  GAS_PRICE: '20000000000', // 20 Gwei
};

// Initialize Web3
const web3 = new Web3(CONFIG.RPC_URL);
const deployer = web3.eth.accounts.privateKeyToAccount(CONFIG.DEPLOYER_PRIVATE_KEY);
web3.eth.accounts.wallet.add(deployer);
web3.eth.defaultAccount = deployer.address;

const deployedContracts = {};

async function deployContract(contractName, abi, bytecode, constructorArgs = []) {
  console.log(`\n📦 Deploying ${contractName}...`);

  try {
    const contract = new web3.eth.Contract(abi);
    const deployTx = contract.deploy({
      data: bytecode,
      arguments: constructorArgs,
    });

    const gas = await deployTx.estimateGas({ from: deployer.address });
    console.log(`   Gas estimate: ${gas}`);

    const tx = {
      from: deployer.address,
      data: deployTx.encodeABI(),
      gas: Math.min(gas + 100000, CONFIG.GAS_LIMIT),
      gasPrice: CONFIG.GAS_PRICE,
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, CONFIG.DEPLOYER_PRIVATE_KEY);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    deployedContracts[contractName] = {
      address: receipt.contractAddress,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
    };

    console.log(`   ✓ Deployed at: ${receipt.contractAddress}`);
    console.log(`   ✓ Tx Hash: ${receipt.transactionHash}`);

    return receipt.contractAddress;
  } catch (error) {
    console.error(`   ✗ Failed to deploy ${contractName}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('AUREXIA SMART CONTRACT DEPLOYMENT');
  console.log('═══════════════════════════════════════════════════');
  console.log(`Network: ${CONFIG.NETWORK}`);
  console.log(`RPC URL: ${CONFIG.RPC_URL}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Step 1: Deploy AURX Token
    console.log('STEP 1: Deploy Core Contracts');
    console.log('─────────────────────────────');

    // Mock ABI and bytecode for demonstration
    const mockAbi = [{ type: 'constructor' }];
    const mockBytecode = '0x60';

    const aurxAddress = await deployContract(
      'AurexiaToken',
      mockAbi,
      mockBytecode,
      [deployer.address, deployer.address, deployer.address, deployer.address, deployer.address]
    );

    // Step 2: Deploy Staking Pool
    console.log('\nSTEP 2: Deploy Staking & Validator Contracts');
    console.log('────────────────────────────────────────────');

    const stakingAddress = await deployContract(
      'StakingPool',
      mockAbi,
      mockBytecode,
      [aurxAddress, deployer.address]
    );

    // Step 3: Deploy Merchant Registry
    console.log('\nSTEP 3: Deploy Payment Contracts');
    console.log('────────────────────────────────');

    const merchantRegistryAddress = await deployContract(
      'MerchantRegistry',
      mockAbi,
      mockBytecode,
      []
    );

    // Step 4: Deploy Payment Router
    const paymentRouterAddress = await deployContract(
      'PaymentRouter',
      mockAbi,
      mockBytecode,
      []
    );

    // Step 5: Write deployment summary
    console.log('\n═══════════════════════════════════════════════════');
    console.log('DEPLOYMENT SUMMARY');
    console.log('═══════════════════════════════════════════════════');

    const summary = {
      network: CONFIG.NETWORK,
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      contracts: {
        AurexiaToken: {
          address: aurxAddress,
          ...deployedContracts['AurexiaToken'],
        },
        StakingPool: {
          address: stakingAddress,
          ...deployedContracts['StakingPool'],
        },
        MerchantRegistry: {
          address: merchantRegistryAddress,
          ...deployedContracts['MerchantRegistry'],
        },
        PaymentRouter: {
          address: paymentRouterAddress,
          ...deployedContracts['PaymentRouter'],
        },
      },
    };

    // Log summary
    Object.entries(summary.contracts).forEach(([name, data]) => {
      console.log(`\n${name}:`);
      console.log(`  Address: ${data.address}`);
      console.log(`  TxHash:  ${data.transactionHash}`);
    });

    // Save to file
    const outputFile = path.join(__dirname, `../../deployment-${CONFIG.NETWORK}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(summary, null, 2));
    console.log(`\n✓ Deployment summary saved to: ${outputFile}`);

    // Export environment variables
    console.log('\n═══════════════════════════════════════════════════');
    console.log('ENV VARIABLES');
    console.log('═══════════════════════════════════════════════════');
    console.log(`AURX_TOKEN_ADDRESS=${aurxAddress}`);
    console.log(`STAKING_POOL_ADDRESS=${stakingAddress}`);
    console.log(`MERCHANT_REGISTRY_ADDRESS=${merchantRegistryAddress}`);
    console.log(`PAYMENT_ROUTER_ADDRESS=${paymentRouterAddress}`);

    console.log('\n✓ All contracts deployed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Deployment failed:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);

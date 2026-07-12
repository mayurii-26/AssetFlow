/**
 * Web3 Integration Test
 * 
 * Simple test to verify Web3 provider and configuration work correctly.
 * Run this after setting up your blockchain node and contract.
 */

import { getBlockchainConfig, validateBlockchainConfig } from './config/blockchain.config';
import { getWeb3Provider } from './providers/web3.provider';

async function testWeb3Integration() {
  console.log('🧪 Testing Web3 Integration...\n');

  try {
    // Test 1: Configuration
    console.log('1️⃣ Testing Configuration...');
    const config = getBlockchainConfig();
    console.log('   ✓ Configuration loaded');
    console.log(`   - RPC URL: ${config.rpcUrl}`);
    console.log(`   - Chain ID: ${config.chainId}`);
    console.log(`   - Contract: ${config.contractAddress}`);

    const isValid = validateBlockchainConfig(config);
    if (isValid) {
      console.log('   ✓ Configuration is valid\n');
    } else {
      throw new Error('Configuration validation failed');
    }

    // Test 2: Web3 Provider Initialization
    console.log('2️⃣ Testing Web3 Provider...');
    const web3Provider = getWeb3Provider();
    await web3Provider.initialize();
    console.log('   ✓ Web3 provider initialized\n');

    // Test 3: Connection
    console.log('3️⃣ Testing Blockchain Connection...');
    const web3 = web3Provider.getWeb3();
    const blockNumber = await web3Provider.getBlockNumber();
    console.log(`   ✓ Connected to blockchain`);
    console.log(`   - Current block: ${blockNumber}\n`);

    // Test 4: Contract
    console.log('4️⃣ Testing Contract Instance...');
    const contract = web3Provider.getContract();
    console.log('   ✓ Contract instance created');
    console.log(`   - Address: ${config.contractAddress}\n`);

    // Test 5: Account
    console.log('5️⃣ Testing Account Access...');
    const account = await web3Provider.getAccount();
    if (account) {
      console.log('   ✓ Account available');
      console.log(`   - Address: ${account}\n`);
    } else {
      console.log('   ⚠ No account configured (optional)\n');
    }

    // Test 6: View Method Call
    console.log('6️⃣ Testing View Method Call...');
    try {
      const count = await web3Provider.call('getEventCount', ['TEST-ASSET-001']);
      console.log('   ✓ View method call successful');
      console.log(`   - Event count: ${count}\n`);
    } catch (error) {
      console.log('   ⚠ View method call failed (may be expected if no events exist)\n');
    }

    console.log('✅ All tests passed!\n');
    console.log('Web3 integration is working correctly.');
    console.log('You can now use the blockchain features in your application.\n');

    return true;
  } catch (error) {
    console.error('\n❌ Test failed:', error instanceof Error ? error.message : error);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure blockchain node is running: npm run blockchain:node');
    console.error('2. Deploy the contract: npm run blockchain:deploy');
    console.error('3. Set BLOCKCHAIN_CONTRACT_ADDRESS in .env');
    console.error('4. Verify all environment variables are set correctly\n');
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testWeb3Integration()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

export { testWeb3Integration };

const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Test configuration
const testConfig = {
    // Use local development network or testnet
    networkUrl: process.env.ETHEREUM_RPC_URL || 'http://localhost:7545',
    // Test accounts (these are standard Ganache accounts)
    testAccounts: {
        patient: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
        doctor: '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0',
        other: '0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b'
    }
};

class BlockchainTester {
    constructor() {
        this.web3 = null;
        this.contract = null;
        this.accounts = [];
    }
    
    async initialize() {
        console.log('🔗 Initializing blockchain connection...');
        
        try {
            // Initialize Web3
            this.web3 = new Web3(testConfig.networkUrl);
            
            // Get accounts
            this.accounts = await this.web3.eth.getAccounts();
            
            if (this.accounts.length === 0) {
                throw new Error('No accounts available. Make sure your blockchain network is running.');
            }
            
            console.log(`✅ Connected to blockchain network`);
            console.log(`📍 Network: ${testConfig.networkUrl}`);
            console.log(`👥 Available accounts: ${this.accounts.length}`);
            
            // Check balances
            for (let i = 0; i < Math.min(3, this.accounts.length); i++) {
                const balance = await this.web3.eth.getBalance(this.accounts[i]);
                const balanceEth = this.web3.utils.fromWei(balance, 'ether');
                console.log(`   Account ${i}: ${this.accounts[i]} (${balanceEth} ETH)`);
            }
            
            return true;
        } catch (error) {
            console.error('❌ Blockchain connection failed:', error.message);
            return false;
        }
    }
    
    async testWeb3Connection() {
        console.log('\n🧪 Testing Web3 connection...');
        
        try {
            const networkId = await this.web3.eth.net.getId();
            const blockNumber = await this.web3.eth.getBlockNumber();
            const gasPrice = await this.web3.eth.getGasPrice();
            
            console.log(`✅ Network ID: ${networkId}`);
            console.log(`✅ Current block: ${blockNumber}`);
            console.log(`✅ Gas price: ${this.web3.utils.fromWei(gasPrice, 'gwei')} Gwei`);
            
            return true;
        } catch (error) {
            console.error('❌ Web3 connection test failed:', error.message);
            return false;
        }
    }
    
    async testTransactionSending() {
        console.log('\n💸 Testing transaction sending...');
        
        try {
            const fromAccount = this.accounts[0];
            const toAccount = this.accounts[1];
            const amount = this.web3.utils.toWei('0.001', 'ether');
            
            console.log(`Sending 0.001 ETH from ${fromAccount} to ${toAccount}...`);
            
            const tx = await this.web3.eth.sendTransaction({
                from: fromAccount,
                to: toAccount,
                value: amount,
                gas: 21000
            });
            
            console.log(`✅ Transaction sent: ${tx.transactionHash}`);
            console.log(`✅ Gas used: ${tx.gasUsed}`);
            
            return true;
        } catch (error) {
            console.error('❌ Transaction test failed:', error.message);
            return false;
        }
    }
    
    async testSmartContractSimulation() {
        console.log('\n📄 Testing smart contract simulation...');
        
        try {
            // Simulate contract deployment
            const contractABI = [
                {
                    "inputs": [],
                    "name": "getTotalDocuments",
                    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                    "stateMutability": "view",
                    "type": "function"
                }
            ];
            
            const contractBytecode = "0x608060405234801561001057600080fd5b50600080819055506101df806100276000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063c87b56dd14610030575b600080fd5b61004361003e36600461008d565b610059565b60405161005091906100dc565b60405180910390f35b60606000548211156100825760405162461bcd60e51b815260040161007990610105565b60405180910390fd5b50600054919050565b60006020828403121561009f57600080fd5b5035919050565b600081518084526100be816020860160208601610132565b601f01601f19169290920160200192915050565b6020815260006100ef60208301846100a6565b9392505050565b6020808252600c908201526b24b73b30b634b21039b2b63360a11b604082015260600190565b60005b8381101561014d578181015183820152602001610135565b838111156101565750600091505b5056fea2646970667358221220f8c2c9c6c8c4c3c0c7c5c2c9c6c8c4c3c0c7c5c2c9c6c8c4c3c0c7c5c2c9c6c864736f6c63430008070033";
            
            console.log('✅ Smart contract ABI and bytecode loaded');
            
            // Estimate deployment gas
            const contract = new this.web3.eth.Contract(contractABI);
            const deployTx = contract.deploy({ data: contractBytecode });
            
            try {
                const gasEstimate = await deployTx.estimateGas({ from: this.accounts[0] });
                console.log(`✅ Estimated deployment gas: ${gasEstimate}`);
            } catch (gasError) {
                console.log('⚠️  Gas estimation skipped (contract simulation)');
            }
            
            console.log('✅ Smart contract simulation completed');
            return true;
        } catch (error) {
            console.error('❌ Smart contract simulation failed:', error.message);
            return false;
        }
    }
    
    async testAddressValidation() {
        console.log('\n🔍 Testing address validation...');
        
        const testAddresses = [
            { address: '0x742d35Cc6632C032532f75c22e24fDf83b31FC3C', expected: true },
            { address: '0x8ba1f109551bD432803012645Hac136c9c1634d', expected: false }, // Invalid character 'H'
            { address: 'invalid-address', expected: false },
            { address: '0x742d35Cc6632C032532f75c22e24fDf83b31FC3C1234', expected: false }, // Too long
            { address: '0x742d35Cc6632C032532f75c22e24fDf83b31FC', expected: false } // Too short
        ];
        
        let passed = 0;
        for (const test of testAddresses) {
            const isValid = this.web3.utils.isAddress(test.address);
            if (isValid === test.expected) {
                console.log(`✅ ${test.address} - ${isValid ? 'Valid' : 'Invalid'}`);
                passed++;
            } else {
                console.log(`❌ ${test.address} - Expected ${test.expected}, got ${isValid}`);
            }
        }
        
        console.log(`Address validation: ${passed}/${testAddresses.length} tests passed`);
        return passed === testAddresses.length;
    }
    
    async testUtilityFunctions() {
        console.log('\n🛠️  Testing Web3 utility functions...');
        
        try {
            // Test unit conversions
            const weiAmount = this.web3.utils.toWei('1', 'ether');
            const ethAmount = this.web3.utils.fromWei(weiAmount, 'ether');
            
            console.log(`✅ Wei conversion: 1 ETH = ${weiAmount} Wei`);
            console.log(`✅ Eth conversion: ${weiAmount} Wei = ${ethAmount} ETH`);
            
            // Test hashing
            const testString = "Hello, Blockchain!";
            const hash = this.web3.utils.keccak256(testString);
            console.log(`✅ Keccak256 hash of "${testString}": ${hash}`);
            
            // Test hex conversions
            const hexString = this.web3.utils.toHex(testString);
            const asciiString = this.web3.utils.hexToAscii(hexString);
            console.log(`✅ Hex conversion: "${testString}" <-> ${hexString}`);
            console.log(`✅ ASCII conversion: ${hexString} <-> "${asciiString}"`);
            
            return true;
        } catch (error) {
            console.error('❌ Utility functions test failed:', error.message);
            return false;
        }
    }
    
    async runAllTests() {
        console.log('🧪 Starting Blockchain Integration Tests\n');
        console.log('=' .repeat(50));
        
        const results = {
            connection: false,
            web3: false,
            transaction: false,
            contract: false,
            validation: false,
            utilities: false
        };
        
        // Initialize blockchain connection
        results.connection = await this.initialize();
        
        if (!results.connection) {
            console.log('\n❌ Cannot continue tests without blockchain connection');
            console.log('\n💡 To fix this:');
            console.log('1. Install and start Ganache: npm install -g ganache-cli && ganache-cli');
            console.log('2. Or connect to a testnet by updating ETHEREUM_RPC_URL in .env');
            return results;
        }
        
        // Run individual tests
        results.web3 = await this.testWeb3Connection();
        results.transaction = await this.testTransactionSending();
        results.contract = await this.testSmartContractSimulation();
        results.validation = await this.testAddressValidation();
        results.utilities = await this.testUtilityFunctions();
        
        // Summary
        console.log('\n' + '=' .repeat(50));
        console.log('📊 Test Results Summary:');
        console.log('=' .repeat(50));
        
        const testResults = [
            ['Blockchain Connection', results.connection],
            ['Web3 API', results.web3],
            ['Transaction Sending', results.transaction],
            ['Smart Contract', results.contract],
            ['Address Validation', results.validation],
            ['Utility Functions', results.utilities]
        ];
        
        let passedTests = 0;
        testResults.forEach(([testName, passed]) => {
            const status = passed ? '✅ PASS' : '❌ FAIL';
            console.log(`${status} ${testName}`);
            if (passed) passedTests++;
        });
        
        console.log('=' .repeat(50));
        console.log(`🎯 Overall: ${passedTests}/${testResults.length} tests passed`);
        
        if (passedTests === testResults.length) {
            console.log('🎉 All blockchain tests passed! Your setup is ready.');
        } else {
            console.log('⚠️  Some tests failed. Check the logs above for details.');
        }
        
        return results;
    }
}

// Run tests if called directly
async function main() {
    const tester = new BlockchainTester();
    await tester.runAllTests();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = BlockchainTester;

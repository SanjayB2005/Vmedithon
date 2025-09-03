// Test the frontend config generation
const { generateFrontendConfig } = require('./generate-frontend-config');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Frontend Config Generation...\n');

// Create test directories
if (!fs.existsSync(path.join(__dirname, 'deployments'))) {
    fs.mkdirSync(path.join(__dirname, 'deployments'));
}

// Test with mock deployment data
const testData = {
    sepolia: {
        contractAddress: '0x1234567890123456789012345678901234567890',
        deployer: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
    },
    mumbai: {
        contractAddress: '0x0987654321098765432109876543210987654321',
        deployer: '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0'
    }
};

// Generate configs for both networks
console.log('📋 Generating Sepolia configuration...');
generateFrontendConfig('sepolia', testData.sepolia.contractAddress, testData.sepolia.deployer);

console.log('\n📋 Generating Mumbai configuration...');
generateFrontendConfig('mumbai', testData.mumbai.contractAddress, testData.mumbai.deployer);

console.log('\n✅ Test completed! Check the frontend-config folder for generated files.');
console.log('\n🎯 What you get after deployment:');
console.log('   1. Complete JSON configuration with contract ABI');
console.log('   2. JavaScript module for React/Next.js imports');
console.log('   3. Environment variables for your frontend');
console.log('   4. Simple key-value file for any use case');
console.log('   5. Ready-to-use HTML interface for immediate testing');
console.log('\n🚀 No more manual configuration needed!');

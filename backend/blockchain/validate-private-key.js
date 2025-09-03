// Private Key Validator and Formatter
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function validatePrivateKey() {
    console.log('🔍 Validating Private Key Format...\n');
    
    let privateKey = process.env.PRIVATE_KEY;
    
    if (!privateKey) {
        console.log('❌ PRIVATE_KEY not found in .env file');
        console.log('💡 Please add your MetaMask private key to .env file');
        return false;
    }
    
    console.log('📋 Current private key:', privateKey.substring(0, 10) + '...' + privateKey.substring(privateKey.length - 10));
    console.log('📏 Length:', privateKey.length);
    
    // Remove 0x prefix if present
    if (privateKey.startsWith('0x')) {
        privateKey = privateKey.slice(2);
    }
    
    // Check if it's valid hex
    const hexPattern = /^[a-fA-F0-9]+$/;
    if (!hexPattern.test(privateKey)) {
        console.log('❌ Private key contains invalid characters (not hexadecimal)');
        console.log('💡 Private key should only contain 0-9 and a-f characters');
        return false;
    }
    
    // Check length (should be 64 characters for 32 bytes)
    if (privateKey.length !== 64) {
        console.log(`❌ Private key should be 64 characters long (32 bytes), but got ${privateKey.length}`);
        console.log('💡 Make sure you copied the full private key from MetaMask');
        return false;
    }
    
    console.log('✅ Private key format is valid!');
    console.log('🔧 Formatted key:', '0x' + privateKey);
    
    return '0x' + privateKey;
}

function showInstructions() {
    console.log('\n📝 How to get your MetaMask Private Key:');
    console.log('   1. Open MetaMask extension');
    console.log('   2. Click on your account (top right)');
    console.log('   3. Go to Account Details');
    console.log('   4. Click "Export Private Key"');
    console.log('   5. Enter your MetaMask password');
    console.log('   6. Copy the private key (should be 64 characters long)');
    console.log('   7. Add to .env file: PRIVATE_KEY=your_64_character_key');
    
    console.log('\n⚠️  SECURITY WARNING:');
    console.log('   • Never share your private key with anyone');
    console.log('   • Never commit .env file to GitHub');
    console.log('   • Use a test wallet for development');
    console.log('   • Keep your main wallet private key secure');
}

// Run validation
const validKey = validatePrivateKey();

if (!validKey) {
    console.log('\n❌ Private key validation failed');
    showInstructions();
} else {
    console.log('\n🎯 Ready for deployment!');
    console.log('✅ You can now run the deployment script');
    
    // Test account derivation
    try {
        const Web3 = require('web3');
        const web3 = new Web3();
        const account = web3.eth.accounts.privateKeyToAccount(validKey);
        console.log('👤 Your wallet address:', account.address);
        console.log('💰 Make sure this address has Sepolia ETH for deployment');
        console.log('🔗 Get Sepolia ETH from: https://sepoliafaucet.com/');
    } catch (error) {
        console.log('❌ Error deriving account:', error.message);
    }
}

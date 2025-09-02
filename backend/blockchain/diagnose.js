const Web3 = require('web3');

async function diagnose() {
    console.log('🔍 Blockchain Network Diagnostic Tool');
    console.log('=====================================\n');
    
    const ports = [8545, 7545, 8546, 9545];
    let workingPort = null;
    
    console.log('Testing common blockchain ports...\n');
    
    for (const port of ports) {
        try {
            console.log(`🔍 Testing port ${port}...`);
            const web3 = new Web3(`http://localhost:${port}`);
            
            // Set a timeout for the connection
            web3.currentProvider.timeout = 5000;
            
            const accounts = await web3.eth.getAccounts();
            const blockNumber = await web3.eth.getBlockNumber();
            
            console.log(`✅ Port ${port} is WORKING!`);
            console.log(`   📊 Accounts found: ${accounts.length}`);
            console.log(`   📦 Current block: ${blockNumber}`);
            console.log(`   🔗 RPC URL: http://localhost:${port}\n`);
            
            workingPort = port;
            break;
            
        } catch (error) {
            console.log(`❌ Port ${port}: Connection failed`);
            console.log(`   💭 ${error.message.substring(0, 50)}...\n`);
        }
    }
    
    if (workingPort) {
        console.log('🎉 SUCCESS! Blockchain network found\n');
        console.log('📋 Configuration Details:');
        console.log(`   • Working Port: ${workingPort}`);
        console.log(`   • RPC URL: http://localhost:${workingPort}`);
        console.log(`   • Chain ID: 1337 (for local development)`);
        console.log('');
        console.log('🚀 Next Steps:');
        console.log('   1. Update your deployment script if needed');
        console.log('   2. Run: node deploy-simple.js');
        console.log('   3. Configure MetaMask with above details');
        
        // Try to get network info
        try {
            const web3 = new Web3(`http://localhost:${workingPort}`);
            const networkId = await web3.eth.net.getId();
            console.log(`   4. Network ID: ${networkId}`);
        } catch (e) {
            console.log('   4. Network ID: Could not determine');
        }
        
    } else {
        console.log('❌ NO BLOCKCHAIN NETWORK FOUND\n');
        console.log('💡 To start a blockchain network:');
        console.log('');
        console.log('Option 1 - Start Ganache CLI:');
        console.log('   npx ganache-cli -h 0.0.0.0 -p 8545 -a 10 -e 100 --deterministic');
        console.log('');
        console.log('Option 2 - Different port:');
        console.log('   npx ganache-cli -h 0.0.0.0 -p 7545 -a 10 -e 100 --deterministic');
        console.log('');
        console.log('Option 3 - Download Ganache GUI:');
        console.log('   https://trufflesuite.com/ganache/');
        console.log('');
        console.log('🔄 Run this diagnostic again after starting Ganache');
    }
    
    console.log('\n' + '='.repeat(50));
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
    console.log('❌ Diagnostic error:', error.message);
});

// Run diagnostic
if (require.main === module) {
    diagnose().catch(error => {
        console.error('❌ Diagnostic failed:', error.message);
        console.log('\n💡 Make sure you have installed dependencies:');
        console.log('   npm install web3');
    });
}

module.exports = diagnose;

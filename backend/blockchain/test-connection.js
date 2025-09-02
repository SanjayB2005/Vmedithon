const Web3 = require('web3');

async function testConnection() {
    console.log('🔍 Testing blockchain connection...');
    
    const ports = [7545, 8545, 9545];
    
    for (const port of ports) {
        try {
            console.log(`Testing port ${port}...`);
            const web3 = new Web3(`http://localhost:${port}`);
            const accounts = await web3.eth.getAccounts();
            console.log(`✅ SUCCESS: Port ${port} is working with ${accounts.length} accounts`);
            console.log(`First account: ${accounts[0]}`);
            return port;
        } catch (error) {
            console.log(`❌ Port ${port}: ${error.message.substring(0, 50)}...`);
        }
    }
    
    console.log('❌ No working blockchain connection found');
    return null;
}

testConnection();

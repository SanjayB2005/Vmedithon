// Deploy to Local Ganache Network
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Web3 = require('web3');
const fs = require('fs');

async function deployToLocal() {
    console.log('🏠 Deploying to Local Ganache...');
    
    // Connect to local Ganache
    const web3 = new Web3('http://localhost:7545');
    
    // Load your contract
    const contractJSON = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'build', 'contracts', 'MedicalRecords.json'), 'utf8'
    ));
    
    // Use local account (Ganache provides funded accounts)
    const accounts = await web3.eth.getAccounts();
    const deployerAccount = accounts[0];
    
    console.log(`🔑 Deploying from: ${deployerAccount}`);
    
    // Check balance
    const balance = await web3.eth.getBalance(deployerAccount);
    const ethBalance = web3.utils.fromWei(balance, 'ether');
    console.log(`💰 Balance: ${ethBalance} ETH`);
    
    try {
        console.log('🚀 Deploying contract...');
        
        const contract = new web3.eth.Contract(contractJSON.abi);
        const deployedContract = await contract
            .deploy({ data: contractJSON.bytecode })
            .send({
                from: deployerAccount,
                gas: 4000000,
                gasPrice: '20000000000'
            });
        
        console.log('✅ Contract deployed successfully!');
        console.log('📍 Contract Address:', deployedContract.options.address);
        console.log('🌐 Network: Local Ganache');
        
        // Save deployment info
        const deploymentInfo = {
            network: 'local',
            contractAddress: deployedContract.options.address,
            deployedAt: new Date().toISOString(),
            deployer: deployerAccount,
            rpcUrl: 'http://localhost:7545'
        };
        
        fs.writeFileSync(
            path.join(__dirname, 'deployments', 'local.json'),
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log('💾 Deployment info saved to deployments/local.json');
        
        // Generate frontend configuration
        console.log('\n🎯 Generating frontend configuration...');
        const { generateFrontendConfig } = require('./generate-frontend-config');
        generateFrontendConfig('local', deployedContract.options.address, deployerAccount);
        
        console.log('\n🎉 LOCAL DEPLOYMENT COMPLETE!');
        console.log('📋 Next Steps:');
        console.log('   1. ✅ Your contract is deployed and ready to use');
        console.log('   2. ✅ Frontend config files are generated');
        console.log('   3. 🌐 Open local-ready.html in browser to test');
        console.log('   4. 📱 Use local-config.js in your React/Next.js app');
        console.log(`   5. 📍 Contract Address: ${deployedContract.options.address}`);
        console.log('\n💡 For production deployment, get testnet ETH and run:');
        console.log('   • node deploy-sepolia.js (for Ethereum testnet)');
        console.log('   • node deploy-mumbai.js (for Polygon testnet)');
        
        return deployedContract.options.address;
        
    } catch (error) {
        console.log('❌ Deployment failed:', error.message);
    }
}

deployToLocal().catch(console.error);

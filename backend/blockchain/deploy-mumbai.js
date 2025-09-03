// Simple Polygon Mumbai Deployment Script
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Web3 = require('web3');
const fs = require('fs');

async function deployToMumbai() {
    console.log('🟣 Deploying to Polygon Mumbai Testnet...');
    
    // Mumbai testnet RPC (free)
    const web3 = new Web3('https://rpc-mumbai.maticvigil.com');
    
    // Load your contract
    const contractJSON = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'build', 'contracts', 'MedicalRecords.json'), 'utf8'
    ));
    
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.log('❌ Please add PRIVATE_KEY to your .env file');
        return;
    }
    
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);
    
    console.log(`🔑 Deploying from: ${account.address}`);
    
    // Check MATIC balance
    const balance = await web3.eth.getBalance(account.address);
    const maticBalance = web3.utils.fromWei(balance, 'ether');
    console.log(`💰 MATIC Balance: ${maticBalance}`);
    
    if (parseFloat(maticBalance) < 0.01) {
        console.log('❌ Insufficient MATIC for deployment');
        console.log('💡 Get Mumbai MATIC from: https://faucet.polygon.technology/');
        return;
    }
    
    try {
        console.log('🚀 Deploying contract...');
        
        const contract = new web3.eth.Contract(contractJSON.abi);
        const deployedContract = await contract
            .deploy({ data: contractJSON.bytecode })
            .send({
                from: account.address,
                gas: 4000000,
                gasPrice: '1000000000' // Lower gas price for Polygon
            });
        
        console.log('✅ Contract deployed successfully!');
        console.log('📍 Contract Address:', deployedContract.options.address);
        console.log('🔗 View on PolygonScan:', `https://mumbai.polygonscan.com/address/${deployedContract.options.address}`);
        
        // Save deployment info
        const deploymentInfo = {
            network: 'mumbai',
            contractAddress: deployedContract.options.address,
            deployedAt: new Date().toISOString(),
            deployer: account.address,
            polygonscanUrl: `https://mumbai.polygonscan.com/address/${deployedContract.options.address}`
        };
        
        fs.writeFileSync(
            path.join(__dirname, 'deployments', 'mumbai.json'),
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log('💾 Deployment info saved to deployments/mumbai.json');
        
        // Generate frontend configuration
        console.log('\n🎯 Generating frontend configuration...');
        const { generateFrontendConfig } = require('./generate-frontend-config');
        generateFrontendConfig('mumbai', deployedContract.options.address, account.address);
        
        console.log('\n🎉 DEPLOYMENT COMPLETE!');
        console.log('📋 Next Steps:');
        console.log('   1. Copy frontend-config/mumbai-config.js to your frontend project');
        console.log('   2. Or use the environment variables from mumbai.env');
        console.log('   3. Import and use the contract in your React/Next.js app');
        console.log(`   4. Contract Address: ${deployedContract.options.address}`);
        
    } catch (error) {
        console.log('❌ Deployment failed:', error.message);
    }
}

deployToMumbai().catch(console.error);

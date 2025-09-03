// Simple Sepolia Testnet Deployment Script
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Web3 = require('web3');
const fs = require('fs');

async function deployToSepolia() {
    console.log('🌐 Deploying to Sepolia Testnet...');
    
    // Sepolia testnet RPC (free)
    const web3 = new Web3('https://sepolia.infura.io/v3/e2b75194499c43e3ad3964c11e10f437');
    
    // Load your contract
    const contractJSON = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'build', 'contracts', 'MedicalRecords.json'), 'utf8'
    ));
    
    // You'll need to add your private key to .env for deployment
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.log('❌ Please add PRIVATE_KEY to your .env file');
        console.log('💡 Export private key from MetaMask (keep it secret!)');
        return;
    }
    
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);
    
    console.log(`🔑 Deploying from: ${account.address}`);
    
    // Check balance
    const balance = await web3.eth.getBalance(account.address);
    const ethBalance = web3.utils.fromWei(balance, 'ether');
    console.log(`💰 Balance: ${ethBalance} ETH`);
    
    if (parseFloat(ethBalance) < 0.01) {
        console.log('❌ Insufficient balance for deployment');
        console.log('💡 Get Sepolia ETH from: https://sepoliafaucet.com/');
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
                gasPrice: '20000000000'
            });
        
        console.log('✅ Contract deployed successfully!');
        console.log('📍 Contract Address:', deployedContract.options.address);
        console.log('🔗 View on Etherscan:', `https://sepolia.etherscan.io/address/${deployedContract.options.address}`);
        
        // Save deployment info
        const deploymentInfo = {
            network: 'sepolia',
            contractAddress: deployedContract.options.address,
            deployedAt: new Date().toISOString(),
            deployer: account.address,
            etherscanUrl: `https://sepolia.etherscan.io/address/${deployedContract.options.address}`
        };
        
        fs.writeFileSync(
            path.join(__dirname, 'deployments', 'sepolia.json'),
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log('💾 Deployment info saved to deployments/sepolia.json');
        
        // Generate frontend configuration
        console.log('\n🎯 Generating frontend configuration...');
        const { generateFrontendConfig } = require('./generate-frontend-config');
        generateFrontendConfig('sepolia', deployedContract.options.address, account.address);
        
        console.log('\n🎉 DEPLOYMENT COMPLETE!');
        console.log('📋 Next Steps:');
        console.log('   1. Copy frontend-config/sepolia-config.js to your frontend project');
        console.log('   2. Or use the environment variables from sepolia.env');
        console.log('   3. Import and use the contract in your React/Next.js app');
        console.log(`   4. Contract Address: ${deployedContract.options.address}`);
        
        return deployedContract.options.address;
        
    } catch (error) {
        console.log('❌ Deployment failed:', error.message);
    }
}

deployToSepolia().catch(console.error);

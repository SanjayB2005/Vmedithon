// Optimized Sepolia Deployment - Lower Gas Cost
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Web3 = require('web3');
const fs = require('fs');

async function deployToSepoliaLowCost() {
    console.log('🌐 Deploying to Sepolia Testnet (Low Cost Mode)...');
    
    // Sepolia testnet RPC (free)
    const web3 = new Web3('https://sepolia.infura.io/v3/e2b75194499c43e3ad3964c11e10f437');
    
    // Load your contract
    const contractJSON = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'build', 'contracts', 'MedicalRecords.json'), 'utf8'
    ));
    
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.log('❌ Please add PRIVATE_KEY to your .env file');
        return;
    }
    
    const account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    web3.eth.accounts.wallet.add(account);
    
    console.log(`🔑 Deploying from: ${account.address}`);
    
    // Check balance
    const balance = await web3.eth.getBalance(account.address);
    const ethBalance = web3.utils.fromWei(balance, 'ether');
    console.log(`💰 Balance: ${ethBalance} ETH`);
    
    // Get current gas price and reduce it significantly
    const currentGasPrice = await web3.eth.getGasPrice();
    const lowGasPrice = Math.floor(currentGasPrice * 0.5); // Use 50% of current gas price
    
    console.log(`⛽ Current gas price: ${web3.utils.fromWei(currentGasPrice, 'gwei')} Gwei`);
    console.log(`⛽ Using low gas price: ${web3.utils.fromWei(lowGasPrice.toString(), 'gwei')} Gwei`);
    
    try {
        console.log('🚀 Deploying contract with optimized gas settings...');
        
        const contract = new web3.eth.Contract(contractJSON.abi);
        
        // Estimate gas for deployment
        const gasEstimate = await contract
            .deploy({ data: contractJSON.bytecode })
            .estimateGas({ from: account.address });
        
        console.log(`📊 Estimated gas: ${gasEstimate}`);
        
        // Calculate total cost
        const totalCost = BigInt(gasEstimate) * BigInt(lowGasPrice);
        const totalCostEth = web3.utils.fromWei(totalCost.toString(), 'ether');
        
        console.log(`💵 Estimated cost: ${totalCostEth} ETH`);
        
        if (BigInt(balance) < totalCost) {
            console.log('❌ Still insufficient funds even with low gas price');
            console.log('💡 Options:');
            console.log('   1. Get more Sepolia ETH from https://sepoliafaucet.com/');
            console.log('   2. Use Polygon Mumbai (much cheaper): node deploy-mumbai.js');
            console.log('   3. Deploy locally first: node deploy-local.js');
            return;
        }
        
        const deployedContract = await contract
            .deploy({ data: contractJSON.bytecode })
            .send({
                from: account.address,
                gas: gasEstimate + 100000, // Add small buffer
                gasPrice: lowGasPrice.toString()
            });
        
        console.log('✅ Contract deployed successfully!');
        console.log('📍 Contract Address:', deployedContract.options.address);
        console.log('🔗 View on Etherscan:', `https://sepolia.etherscan.io/address/${deployedContract.options.address}`);
        
        // Check remaining balance
        const newBalance = await web3.eth.getBalance(account.address);
        const newEthBalance = web3.utils.fromWei(newBalance, 'ether');
        const spent = parseFloat(ethBalance) - parseFloat(newEthBalance);
        console.log(`💰 Remaining balance: ${newEthBalance} ETH (spent: ${spent.toFixed(6)} ETH)`);
        
        // Save deployment info
        const deploymentInfo = {
            network: 'sepolia',
            contractAddress: deployedContract.options.address,
            deployedAt: new Date().toISOString(),
            deployer: account.address,
            gasUsed: gasEstimate,
            gasPrice: lowGasPrice,
            costEth: spent.toFixed(6),
            etherscanUrl: `https://sepolia.etherscan.io/address/${deployedContract.options.address}`
        };
        
        // Ensure deployments directory exists
        if (!fs.existsSync(path.join(__dirname, 'deployments'))) {
            fs.mkdirSync(path.join(__dirname, 'deployments'));
        }
        
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
        console.log('📋 Your Frontend Keys:');
        console.log(`   📍 Contract Address: ${deployedContract.options.address}`);
        console.log(`   🌐 Network: Sepolia Testnet`);
        console.log(`   🔗 Etherscan: ${deploymentInfo.etherscanUrl}`);
        console.log('\n📁 Generated Files:');
        console.log('   📄 frontend-config/sepolia-config.js - For React/Next.js');
        console.log('   📄 frontend-config/sepolia.env - Environment variables');
        console.log('   🌐 frontend-config/sepolia-ready.html - Test interface');
        
        return deployedContract.options.address;
        
    } catch (error) {
        console.log('❌ Deployment failed:', error.message);
        
        if (error.message.includes('insufficient funds')) {
            console.log('\n💡 Still not enough funds. Try:');
            console.log('   • Get more Sepolia ETH from https://sepoliafaucet.com/');
            console.log('   • Use Polygon Mumbai (cheaper): node deploy-mumbai-low-cost.js');
        }
    }
}

deployToSepoliaLowCost().catch(console.error);

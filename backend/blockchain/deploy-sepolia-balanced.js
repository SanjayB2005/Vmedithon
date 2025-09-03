// Balanced Sepolia Deployment - Reasonable Gas Price
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Web3 = require('web3');
const fs = require('fs');

async function deployToSepoliaBalanced() {
    console.log('🌐 Deploying to Sepolia Testnet (Balanced Cost)...');
    
    const web3 = new Web3('https://sepolia.infura.io/v3/e2b75194499c43e3ad3964c11e10f437');
    
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
    
    const balance = await web3.eth.getBalance(account.address);
    const ethBalance = web3.utils.fromWei(balance, 'ether');
    console.log(`💰 Balance: ${ethBalance} ETH`);
    
    // Use a reasonable gas price (75% of current)
    const currentGasPrice = await web3.eth.getGasPrice();
    const reasonableGasPrice = Math.floor(currentGasPrice * 0.75);
    
    console.log(`⛽ Current gas price: ${web3.utils.fromWei(currentGasPrice, 'gwei')} Gwei`);
    console.log(`⛽ Using gas price: ${web3.utils.fromWei(reasonableGasPrice.toString(), 'gwei')} Gwei`);
    
    try {
        const contract = new web3.eth.Contract(contractJSON.abi);
        
        // Estimate gas with lower amount to be safe
        const gasEstimate = await contract
            .deploy({ data: contractJSON.bytecode })
            .estimateGas({ from: account.address });
        
        const gasLimit = Math.floor(gasEstimate * 1.2); // Add 20% buffer
        
        console.log(`📊 Estimated gas: ${gasEstimate}`);
        console.log(`📊 Gas limit (with buffer): ${gasLimit}`);
        
        // Calculate cost
        const totalCost = BigInt(gasLimit) * BigInt(reasonableGasPrice);
        const totalCostEth = web3.utils.fromWei(totalCost.toString(), 'ether');
        
        console.log(`💵 Maximum cost: ${totalCostEth} ETH`);
        
        if (BigInt(balance) < totalCost) {
            console.log('❌ Insufficient funds for deployment');
            console.log(`💡 Need: ${totalCostEth} ETH, Have: ${ethBalance} ETH`);
            console.log('🎯 Try the super cheap Mumbai option instead!');
            return;
        }
        
        console.log('🚀 Starting deployment...');
        
        const deployedContract = await contract
            .deploy({ data: contractJSON.bytecode })
            .send({
                from: account.address,
                gas: gasLimit,
                gasPrice: reasonableGasPrice.toString()
            });
        
        console.log('✅ CONTRACT DEPLOYED SUCCESSFULLY! 🎉');
        console.log('📍 Contract Address:', deployedContract.options.address);
        console.log('🔗 Etherscan:', `https://sepolia.etherscan.io/address/${deployedContract.options.address}`);
        
        // Check final balance
        const newBalance = await web3.eth.getBalance(account.address);
        const newEthBalance = web3.utils.fromWei(newBalance, 'ether');
        const spent = parseFloat(ethBalance) - parseFloat(newEthBalance);
        console.log(`💰 Remaining balance: ${newEthBalance} ETH`);
        console.log(`💸 Total spent: ${spent.toFixed(6)} ETH`);
        
        // Save deployment info
        const deploymentInfo = {
            network: 'sepolia',
            contractAddress: deployedContract.options.address,
            deployedAt: new Date().toISOString(),
            deployer: account.address,
            gasUsed: gasLimit,
            gasPrice: reasonableGasPrice,
            costEth: spent.toFixed(6),
            etherscanUrl: `https://sepolia.etherscan.io/address/${deployedContract.options.address}`
        };
        
        if (!fs.existsSync(path.join(__dirname, 'deployments'))) {
            fs.mkdirSync(path.join(__dirname, 'deployments'));
        }
        
        fs.writeFileSync(
            path.join(__dirname, 'deployments', 'sepolia.json'),
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        // Generate frontend config
        console.log('\n🎯 Generating frontend configuration...');
        const { generateFrontendConfig } = require('./generate-frontend-config');
        generateFrontendConfig('sepolia', deployedContract.options.address, account.address);
        
        console.log('\n🎊 DEPLOYMENT COMPLETE! YOUR BLOCKCHAIN IS LIVE!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 FRONTEND INTEGRATION KEYS:');
        console.log(`   📍 Contract Address: ${deployedContract.options.address}`);
        console.log(`   🌐 Network: Sepolia Testnet`);
        console.log(`   🔗 Etherscan: ${deploymentInfo.etherscanUrl}`);
        console.log('📁 Generated Files for Frontend:');
        console.log('   📄 frontend-config/sepolia-config.js ← Import this in React/Next.js');
        console.log('   📄 frontend-config/sepolia.env ← Add these to your .env');
        console.log('   🌐 frontend-config/sepolia-ready.html ← Test in browser');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        return deployedContract.options.address;
        
    } catch (error) {
        console.log('❌ Deployment failed:', error.message);
        if (error.message.includes('insufficient funds')) {
            console.log('💡 Not enough ETH. Try getting more from https://sepoliafaucet.com/');
        }
    }
}

deployToSepoliaBalanced().catch(console.error);

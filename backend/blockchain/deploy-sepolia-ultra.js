// Ultra Reliable Sepolia Deployment - Higher Gas Price
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Web3 = require('web3');
const fs = require('fs');

async function ultraReliableDeploy() {
    console.log('⚡ Ultra Reliable Sepolia Deployment...\n');
    
    const web3 = new Web3('https://sepolia.infura.io/v3/e2b75194499c43e3ad3964c11e10f437');
    
    const privateKey = process.env.PRIVATE_KEY;
    const account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    web3.eth.accounts.wallet.add(account);
    
    console.log(`📍 Account: ${account.address}`);
    
    // Check balance
    const balance = await web3.eth.getBalance(account.address);
    const balanceFormatted = web3.utils.fromWei(balance, 'ether');
    console.log(`💰 Balance: ${balanceFormatted} ETH`);
    
    // Load contract
    const contractJSON = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'build', 'contracts', 'MedicalRecords.json'), 'utf8'
    ));
    
    const contract = new web3.eth.Contract(contractJSON.abi);
    
    // Get current gas price and set it higher for reliability
    const currentGasPrice = await web3.eth.getGasPrice();
    console.log(`⛽ Current gas price: ${web3.utils.fromWei(currentGasPrice, 'gwei')} Gwei`);
    
    // Use 110% of current gas price for reliability
    const gasPrice = Math.floor(currentGasPrice * 1.1).toString();
    console.log(`🚀 Using gas price: ${web3.utils.fromWei(gasPrice, 'gwei')} Gwei`);
    
    // Estimate gas
    const gasEstimate = await contract
        .deploy({ data: contractJSON.bytecode })
        .estimateGas({ from: account.address });
    
    const gasLimit = Math.floor(gasEstimate * 1.15); // 15% buffer
    console.log(`⛽ Gas limit: ${gasLimit}`);
    
    // Calculate cost
    const totalCost = BigInt(gasLimit) * BigInt(gasPrice);
    const totalCostFormatted = web3.utils.fromWei(totalCost.toString(), 'ether');
    console.log(`💵 Total cost: ${totalCostFormatted} ETH`);
    
    if (BigInt(balance) < totalCost) {
        console.log('❌ Insufficient funds');
        return;
    }
    
    console.log('\n🚀 Deploying with higher gas price for reliability...');
    
    try {
        const deployedContract = await contract
            .deploy({ data: contractJSON.bytecode })
            .send({
                from: account.address,
                gas: gasLimit,
                gasPrice: gasPrice
            });
        
        console.log('\n✅ DEPLOYMENT SUCCESSFUL! 🎉');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📍 Contract Address: ${deployedContract.options.address}`);
        console.log(`🌐 Network: Sepolia Ethereum Testnet`);
        console.log(`🔗 Explorer: https://sepolia.etherscan.io/address/${deployedContract.options.address}`);
        
        // Check final balance
        const finalBalance = await web3.eth.getBalance(account.address);
        const finalBalanceFormatted = web3.utils.fromWei(finalBalance, 'ether');
        const spent = parseFloat(balanceFormatted) - parseFloat(finalBalanceFormatted);
        console.log(`💰 Remaining: ${finalBalanceFormatted} ETH`);
        console.log(`💸 Spent: ${spent.toFixed(6)} ETH`);
        
        // Save deployment info
        const deploymentInfo = {
            network: 'sepolia',
            networkName: 'Sepolia Ethereum',
            contractAddress: deployedContract.options.address,
            deployedAt: new Date().toISOString(),
            deployer: account.address,
            explorerUrl: `https://sepolia.etherscan.io/address/${deployedContract.options.address}`,
            cost: `${spent.toFixed(6)} ETH`,
            gasUsed: gasLimit,
            gasPrice: web3.utils.fromWei(gasPrice, 'gwei') + ' Gwei'
        };
        
        // Create deployments directory
        if (!fs.existsSync(path.join(__dirname, 'deployments'))) {
            fs.mkdirSync(path.join(__dirname, 'deployments'));
        }
        
        fs.writeFileSync(
            path.join(__dirname, 'deployments', 'sepolia.json'),
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        // Generate frontend configuration
        console.log('\n🎯 Generating frontend integration files...');
        const { generateFrontendConfig } = require('./generate-frontend-config');
        generateFrontendConfig('sepolia', deployedContract.options.address, account.address);
        
        console.log('\n🎊 YOUR BLOCKCHAIN IS LIVE!');
        console.log('🔑 Frontend Integration Keys Generated:');
        console.log('   📄 frontend-config/sepolia-config.js (React/Next.js)');
        console.log('   📄 frontend-config/sepolia.env (Environment Variables)');  
        console.log('   🌐 frontend-config/sepolia-ready.html (Test Interface)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        console.log('\n🎯 NEXT STEPS:');
        console.log('1. Your smart contract is live on Sepolia testnet');
        console.log('2. Import the config files into your frontend');
        console.log('3. Users need MetaMask connected to Sepolia network');
        console.log('4. Test the interface with sepolia-ready.html');
        
        return deployedContract.options.address;
        
    } catch (error) {
        console.log(`\n❌ Deployment failed: ${error.message}`);
        
        if (error.message.includes('underpriced')) {
            console.log('\n💡 Gas price still too low. Let me try with even higher gas...');
            
            // Try with 150% of current gas price
            const higherGasPrice = Math.floor(currentGasPrice * 1.5).toString();
            console.log(`⚡ Trying with ${web3.utils.fromWei(higherGasPrice, 'gwei')} Gwei...`);
            
            const retryContract = await contract
                .deploy({ data: contractJSON.bytecode })
                .send({
                    from: account.address,
                    gas: gasLimit,
                    gasPrice: higherGasPrice
                });
                
            console.log('✅ SUCCESS with higher gas price!');
            console.log(`📍 Contract: ${retryContract.options.address}`);
            return retryContract.options.address;
        }
        
        throw error;
    }
}

ultraReliableDeploy().catch(console.error);

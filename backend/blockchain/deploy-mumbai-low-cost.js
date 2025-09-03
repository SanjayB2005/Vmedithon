// Super Cheap Polygon Mumbai Deployment
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Web3 = require('web3');
const fs = require('fs');

async function deployToMumbaiLowCost() {
    console.log('🟣 Deploying to Polygon Mumbai (Ultra Low Cost)...');
    
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
    
    const account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    web3.eth.accounts.wallet.add(account);
    
    console.log(`🔑 Deploying from: ${account.address}`);
    
    // Check MATIC balance
    const balance = await web3.eth.getBalance(account.address);
    const maticBalance = web3.utils.fromWei(balance, 'ether');
    console.log(`💰 MATIC Balance: ${maticBalance}`);
    
    if (parseFloat(maticBalance) === 0) {
        console.log('❌ No MATIC balance found');
        console.log('💡 Get free Mumbai MATIC from: https://faucet.polygon.technology/');
        console.log('   • Select Mumbai network');
        console.log(`   • Enter address: ${account.address}`);
        console.log('   • Request MATIC tokens (free)');
        return;
    }
    
    // Use very low gas price for Polygon
    const ultraLowGasPrice = '1000000000'; // 1 Gwei - very cheap
    
    console.log(`⛽ Using ultra-low gas price: 1 Gwei`);
    
    try {
        console.log('🚀 Deploying contract with minimal gas cost...');
        
        const contract = new web3.eth.Contract(contractJSON.abi);
        
        // Estimate gas
        const gasEstimate = await contract
            .deploy({ data: contractJSON.bytecode })
            .estimateGas({ from: account.address });
        
        console.log(`📊 Estimated gas: ${gasEstimate}`);
        
        // Calculate total cost in MATIC
        const totalCost = BigInt(gasEstimate) * BigInt(ultraLowGasPrice);
        const totalCostMatic = web3.utils.fromWei(totalCost.toString(), 'ether');
        
        console.log(`💵 Estimated cost: ${totalCostMatic} MATIC (very cheap!)`);
        
        const deployedContract = await contract
            .deploy({ data: contractJSON.bytecode })
            .send({
                from: account.address,
                gas: gasEstimate + 100000,
                gasPrice: ultraLowGasPrice
            });
        
        console.log('✅ Contract deployed successfully!');
        console.log('📍 Contract Address:', deployedContract.options.address);
        console.log('🔗 View on PolygonScan:', `https://mumbai.polygonscan.com/address/${deployedContract.options.address}`);
        
        // Check remaining balance
        const newBalance = await web3.eth.getBalance(account.address);
        const newMaticBalance = web3.utils.fromWei(newBalance, 'ether');
        const spent = parseFloat(maticBalance) - parseFloat(newMaticBalance);
        console.log(`💰 Remaining balance: ${newMaticBalance} MATIC (spent: ${spent.toFixed(8)} MATIC)`);
        
        // Save deployment info
        const deploymentInfo = {
            network: 'mumbai',
            contractAddress: deployedContract.options.address,
            deployedAt: new Date().toISOString(),
            deployer: account.address,
            gasUsed: gasEstimate,
            gasPrice: ultraLowGasPrice,
            costMatic: spent.toFixed(8),
            polygonscanUrl: `https://mumbai.polygonscan.com/address/${deployedContract.options.address}`
        };
        
        // Ensure deployments directory exists
        if (!fs.existsSync(path.join(__dirname, 'deployments'))) {
            fs.mkdirSync(path.join(__dirname, 'deployments'));
        }
        
        fs.writeFileSync(
            path.join(__dirname, 'deployments', 'mumbai.json'),
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log('💾 Deployment info saved to deployments/mumbai.json');
        
        // Generate frontend configuration
        console.log('\n🎯 Generating frontend configuration...');
        const { generateFrontendConfig } = require('./generate-frontend-config');
        generateFrontendConfig('mumbai', deployedContract.options.address, account.address);
        
        console.log('\n🎉 MUMBAI DEPLOYMENT COMPLETE!');
        console.log('📋 Your Frontend Keys:');
        console.log(`   📍 Contract Address: ${deployedContract.options.address}`);
        console.log(`   🌐 Network: Polygon Mumbai Testnet`);
        console.log(`   🔗 PolygonScan: ${deploymentInfo.polygonscanUrl}`);
        console.log('\n📁 Generated Files:');
        console.log('   📄 frontend-config/mumbai-config.js - For React/Next.js');
        console.log('   📄 frontend-config/mumbai.env - Environment variables');
        console.log('   🌐 frontend-config/mumbai-ready.html - Test interface');
        
        return deployedContract.options.address;
        
    } catch (error) {
        console.log('❌ Deployment failed:', error.message);
    }
}

deployToMumbaiLowCost().catch(console.error);

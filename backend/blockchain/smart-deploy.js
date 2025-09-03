// Smart Deployment - Try Cheapest Available Network
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Web3 = require('web3');
const fs = require('fs');

async function smartDeploy() {
    console.log('🎯 Smart Deployment - Finding Cheapest Option...\n');
    
    const networks = [
        {
            name: 'Mumbai (Polygon)',
            rpc: 'https://polygon-mumbai.g.alchemy.com/v2/demo',
            explorer: 'https://mumbai.polygonscan.com',
            currency: 'MATIC',
            gasPrice: '1000000000', // 1 Gwei
            cheapest: true
        },
        {
            name: 'Mumbai (Alternative)',
            rpc: 'https://matic-mumbai.chainstacklabs.com',
            explorer: 'https://mumbai.polygonscan.com',
            currency: 'MATIC',
            gasPrice: '1000000000',
            cheapest: true
        },
        {
            name: 'Sepolia (Ethereum)',
            rpc: 'https://sepolia.infura.io/v3/e2b75194499c43e3ad3964c11e10f437',
            explorer: 'https://sepolia.etherscan.io',
            currency: 'ETH',
            gasPrice: null, // Will get current price
            cheapest: false
        }
    ];
    
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.log('❌ Please add PRIVATE_KEY to your .env file');
        return;
    }
    
    const contractJSON = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'build', 'contracts', 'MedicalRecords.json'), 'utf8'
    ));
    
    // Try each network
    for (const network of networks) {
        try {
            console.log(`🔍 Testing ${network.name}...`);
            
            const web3 = new Web3(network.rpc);
            const account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
            web3.eth.accounts.wallet.add(account);
            
            // Check balance
            const balance = await web3.eth.getBalance(account.address);
            const balanceFormatted = web3.utils.fromWei(balance, 'ether');
            
            console.log(`   💰 Balance: ${balanceFormatted} ${network.currency}`);
            
            if (parseFloat(balanceFormatted) === 0) {
                if (network.cheapest) {
                    console.log(`   💡 Get free ${network.currency} from faucet first`);
                }
                console.log(`   ⏭️  Skipping ${network.name} (no balance)\n`);
                continue;
            }
            
            // Get gas price
            let gasPrice = network.gasPrice;
            if (!gasPrice) {
                const currentGasPrice = await web3.eth.getGasPrice();
                gasPrice = Math.floor(currentGasPrice * 0.75).toString();
            }
            
            // Estimate gas
            const contract = new web3.eth.Contract(contractJSON.abi);
            const gasEstimate = await contract
                .deploy({ data: contractJSON.bytecode })
                .estimateGas({ from: account.address });
            
            const gasLimit = Math.floor(gasEstimate * 1.1);
            
            // Calculate cost
            const totalCost = BigInt(gasLimit) * BigInt(gasPrice);
            const totalCostFormatted = web3.utils.fromWei(totalCost.toString(), 'ether');
            
            console.log(`   ⛽ Gas needed: ${gasLimit}`);
            console.log(`   💵 Estimated cost: ${totalCostFormatted} ${network.currency}`);
            
            if (BigInt(balance) < totalCost) {
                console.log(`   ❌ Insufficient funds for ${network.name}`);
                console.log(`   ⏭️  Trying next option...\n`);
                continue;
            }
            
            // Deploy!
            console.log(`\n🚀 Deploying to ${network.name}...`);
            
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
            console.log(`🌐 Network: ${network.name}`);
            console.log(`🔗 Explorer: ${network.explorer}/address/${deployedContract.options.address}`);
            
            // Check spent amount
            const newBalance = await web3.eth.getBalance(account.address);
            const newBalanceFormatted = web3.utils.fromWei(newBalance, 'ether');
            const spent = parseFloat(balanceFormatted) - parseFloat(newBalanceFormatted);
            console.log(`💰 Remaining: ${newBalanceFormatted} ${network.currency}`);
            console.log(`💸 Spent: ${spent.toFixed(8)} ${network.currency}`);
            
            // Save deployment
            const networkKey = network.name.includes('Mumbai') ? 'mumbai' : 'sepolia';
            const deploymentInfo = {
                network: networkKey,
                networkName: network.name,
                contractAddress: deployedContract.options.address,
                deployedAt: new Date().toISOString(),
                deployer: account.address,
                explorerUrl: `${network.explorer}/address/${deployedContract.options.address}`,
                cost: `${spent.toFixed(8)} ${network.currency}`
            };
            
            if (!fs.existsSync(path.join(__dirname, 'deployments'))) {
                fs.mkdirSync(path.join(__dirname, 'deployments'));
            }
            
            fs.writeFileSync(
                path.join(__dirname, 'deployments', `${networkKey}.json`),
                JSON.stringify(deploymentInfo, null, 2)
            );
            
            // Generate frontend config
            console.log('\n🎯 Generating frontend configuration...');
            const { generateFrontendConfig } = require('./generate-frontend-config');
            generateFrontendConfig(networkKey, deployedContract.options.address, account.address);
            
            console.log('\n🎊 YOUR BLOCKCHAIN IS LIVE!');
            console.log('📁 Frontend Files Generated:');
            console.log(`   📄 frontend-config/${networkKey}-config.js`);
            console.log(`   📄 frontend-config/${networkKey}.env`);
            console.log(`   🌐 frontend-config/${networkKey}-ready.html`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            return deployedContract.options.address;
            
        } catch (error) {
            console.log(`   ❌ Failed on ${network.name}: ${error.message}`);
            console.log(`   ⏭️  Trying next network...\n`);
            continue;
        }
    }
    
    console.log('❌ All deployment attempts failed');
    console.log('\n💡 Options to try:');
    console.log('   1. Get Mumbai MATIC: https://faucet.polygon.technology/');
    console.log('   2. Get more Sepolia ETH: https://sepoliafaucet.com/');
    console.log('   3. Deploy locally first: node deploy-local.js');
}

smartDeploy().catch(console.error);

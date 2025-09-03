const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Web3 = require('web3');
const fs = require('fs');

async function contractCostDetails() {
    const web3 = new Web3('https://sepolia.infura.io/v3/e2b75194499c43e3ad3964c11e10f437');
    const deploymentInfo = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'deployments', 'sepolia.json'), 'utf8'
    ));
    const currentGasPrice = await web3.eth.getGasPrice();
    const currentGasPriceGwei = parseFloat(web3.utils.fromWei(currentGasPrice, 'gwei'));
    const ethPriceUSD = 2500; // Estimated ETH price

    // Example: Gas used for a single block creation transaction
    const blockCreationGasUsed = 100000; // Replace with actual value if known
    const blockCreationCostEth = web3.utils.fromWei(
        (BigInt(currentGasPrice) * BigInt(blockCreationGasUsed)).toString(),
        'ether'
    );
    const blockCreationCostUSD = parseFloat(blockCreationCostEth) * ethPriceUSD;

    console.log('💰 CONTRACT COST DETAILS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`⛽ Current Gas Price: ${currentGasPriceGwei.toFixed(2)} Gwei`);
    console.log(`💱 ETH Price: ~$${ethPriceUSD.toLocaleString()}`);
    console.log(`📍 Contract Address: ${deploymentInfo.contractAddress}`);
    console.log('\n🏗️  Deployment Cost:');
    console.log(`   ⛽ Gas Used: ${deploymentInfo.gasUsed.toLocaleString()}`);
    console.log(`   💸 Cost: ${deploymentInfo.cost} ETH ($${(parseFloat(deploymentInfo.cost) * ethPriceUSD).toFixed(2)})`);
    console.log('\n🧱 Block Creation Transaction Cost:');
    console.log(`   ⛽ Gas Used: ${blockCreationGasUsed.toLocaleString()}`);
    console.log(`   💸 Cost: ${blockCreationCostEth} ETH ($${blockCreationCostUSD.toFixed(2)})`);
}

contractCostDetails().catch(console.error);

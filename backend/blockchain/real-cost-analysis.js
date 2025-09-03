// Calculate Real Transaction Costs - Including Failed Transactions
const Web3 = require('web3');

async function calculateRealCosts() {
    console.log('💰 REAL BLOCKCHAIN COST ANALYSIS');
    console.log('Based on actual transactions (including failed ones)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const web3 = new Web3('https://sepolia.infura.io/v3/e2b75194499c43e3ad3964c11e10f437');
    
    // From the failed transaction we just saw:
    const failedTransactionData = {
        gasUsed: 26024,
        gasPrice: '151888089', // in wei (0.151888089 Gwei)
        status: 'failed'
    };
    
    // Calculate cost of the failed transaction
    const failedCost = BigInt(failedTransactionData.gasUsed) * BigInt(failedTransactionData.gasPrice);
    const failedCostETH = web3.utils.fromWei(failedCost.toString(), 'ether');
    const failedCostUSD = parseFloat(failedCostETH) * 2500;
    
    console.log('❌ FAILED TRANSACTION COST:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   🧾 Transaction: 0xcfc12126c3c88abd299006cf06809bece702d2497bfac14dfceb06f40b2c4ba1`);
    console.log(`   ⛽ Gas Used: ${failedTransactionData.gasUsed.toLocaleString()}`);
    console.log(`   💵 Gas Price: ${web3.utils.fromWei(failedTransactionData.gasPrice, 'gwei')} Gwei`);
    console.log(`   💸 Cost: ${failedCostETH} ETH ($${failedCostUSD.toFixed(3)})`);
    console.log(`   📝 Status: Transaction failed but still costs gas!`);
    
    // Estimated costs for successful transactions
    console.log('\n✅ ESTIMATED SUCCESSFUL TRANSACTION COSTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const currentGasPrice = await web3.eth.getGasPrice();
    const currentGasPriceGwei = web3.utils.fromWei(currentGasPrice, 'gwei');
    
    console.log(`⛽ Current Gas Price: ${currentGasPriceGwei} Gwei`);
    
    const successfulTransactions = [
        { name: 'Register Patient', gasEstimate: 85000, description: 'One-time registration' },
        { name: 'Register Doctor', gasEstimate: 90000, description: 'One-time registration' },
        { name: 'Upload Document + IPFS Hash', gasEstimate: 120000, description: 'Store medical document' },
        { name: 'Request Patient Access', gasEstimate: 75000, description: 'Doctor requests access' },
        { name: 'Approve Access', gasEstimate: 65000, description: 'Patient approves doctor' },
        { name: 'Grant Permission', gasEstimate: 50000, description: 'Basic permission grant' }
    ];
    
    console.log('\n📋 TRANSACTION TYPE | GAS | ETH COST | USD COST');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let totalEstimatedGas = 0;
    let totalEstimatedCost = 0;
    
    successfulTransactions.forEach(tx => {
        const cost = BigInt(tx.gasEstimate) * BigInt(currentGasPrice);
        const costETH = parseFloat(web3.utils.fromWei(cost.toString(), 'ether'));
        const costUSD = costETH * 2500;
        
        totalEstimatedGas += tx.gasEstimate;
        totalEstimatedCost += costETH;
        
        console.log(`${tx.name.padEnd(25)} | ${tx.gasEstimate.toLocaleString().padEnd(8)} | ${costETH.toFixed(6).padEnd(10)} | $${costUSD.toFixed(3)}`);
        console.log(`  └─ ${tx.description}`);
    });
    
    // Real-world block creation cost
    console.log('\n🧱 BLOCK CREATION COSTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 What "creating a block" means in your system:');
    console.log('');
    console.log('1️⃣ Each transaction you make gets included in a block');
    console.log('2️⃣ Miners/validators create blocks every ~12 seconds');
    console.log('3️⃣ YOU pay for transactions, NOT for block creation');
    console.log('4️⃣ Your costs = Gas Used × Gas Price');
    
    const avgTransactionGas = Math.floor(totalEstimatedGas / successfulTransactions.length);
    const avgCost = BigInt(avgTransactionGas) * BigInt(currentGasPrice);
    const avgCostETH = web3.utils.fromWei(avgCost.toString(), 'ether');
    const avgCostUSD = parseFloat(avgCostETH) * 2500;
    
    console.log('\n📊 AVERAGE TRANSACTION COST:');
    console.log(`   ⛽ Average Gas: ${avgTransactionGas.toLocaleString()}`);
    console.log(`   💵 Average Cost: ${avgCostETH} ETH ($${avgCostUSD.toFixed(3)})`);
    
    // Monthly costs for different scales
    console.log('\n🏥 MONTHLY OPERATIONAL COSTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const monthlyScenarios = [
        { name: 'Small Clinic', patients: 50, documents: 200 },
        { name: 'Hospital', patients: 500, documents: 2000 },
        { name: 'Health Network', patients: 2000, documents: 8000 }
    ];
    
    monthlyScenarios.forEach(scenario => {
        const monthlyTransactions = scenario.patients + scenario.documents; // registrations + uploads
        const monthlyCost = monthlyTransactions * parseFloat(avgCostETH);
        const monthlyCostUSD = monthlyCost * 2500;
        
        console.log(`\n🏥 ${scenario.name}:`);
        console.log(`   👥 ${scenario.patients} new patients/month`);
        console.log(`   📄 ${scenario.documents} documents/month`);
        console.log(`   💰 Monthly cost: ${monthlyCost.toFixed(4)} ETH ($${monthlyCostUSD.toFixed(2)})`);
        console.log(`   📈 Per patient: $${(monthlyCostUSD/scenario.patients).toFixed(2)}`);
    });
    
    // Network comparison
    console.log('\n🌐 COST COMPARISON BY NETWORK:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const networks = [
        { name: 'Sepolia (Current)', multiplier: 1, note: 'FREE testnet ETH' },
        { name: 'Ethereum Mainnet', multiplier: 10, note: 'Real ETH required' },
        { name: 'Polygon', multiplier: 0.001, note: '99.9% cheaper!' },
        { name: 'Arbitrum', multiplier: 0.1, note: 'L2 solution' }
    ];
    
    networks.forEach(network => {
        const networkCost = parseFloat(avgCostETH) * network.multiplier;
        const networkCostUSD = networkCost * 2500;
        
        console.log(`\n${network.name}:`);
        console.log(`   💵 Avg transaction: ${networkCost.toFixed(6)} ETH ($${networkCostUSD.toFixed(3)})`);
        console.log(`   📝 ${network.note}`);
    });
    
    console.log('\n🎯 KEY TAKEAWAYS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Even FAILED transactions cost gas: ${failedCostETH} ETH`);
    console.log(`✅ Average successful transaction: ${avgCostETH} ETH`);
    console.log(`✅ Document upload with IPFS hash: ~${(120000 * parseFloat(web3.utils.fromWei(currentGasPrice, 'ether'))).toFixed(6)} ETH`);
    console.log(`✅ Reading data is always FREE`);
    console.log(`✅ Switch to Polygon for production = 99.9% cheaper!`);
    
    console.log('\n💡 YOUR IPFS + BLOCKCHAIN SYSTEM:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔹 Store large files on IPFS (cheap/free)');
    console.log('🔹 Store IPFS hash on blockchain (immutable proof)');
    console.log('🔹 Perfect balance of cost and security');
    console.log('🔹 Each "block" in your system = one transaction');
    console.log(`🔹 Cost per medical document: ~$${(120000 * parseFloat(web3.utils.fromWei(currentGasPrice, 'ether')) * 2500).toFixed(3)}`);
}

calculateRealCosts().catch(console.error);

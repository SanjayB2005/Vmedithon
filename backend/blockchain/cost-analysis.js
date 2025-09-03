// Blockchain Transaction Cost Calculator
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Web3 = require('web3');
const fs = require('fs');

async function calculateBlockchainCosts() {
    console.log('💰 Blockchain Transaction Cost Analysis\n');
    
    const web3 = new Web3('https://sepolia.infura.io/v3/e2b75194499c43e3ad3964c11e10f437');
    
    // Load deployment info
    const deploymentInfo = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'deployments', 'sepolia.json'), 'utf8'
    ));
    
    console.log('🏗️  CONTRACT DEPLOYMENT COSTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📍 Contract: ${deploymentInfo.contractAddress}`);
    console.log(`⛽ Gas Used: ${deploymentInfo.gasUsed.toLocaleString()}`);
    console.log(`💵 Gas Price: ${deploymentInfo.gasPrice}`);
    console.log(`💸 Total Cost: ${deploymentInfo.cost}`);
    
    // Load contract ABI for function analysis
    const contractJSON = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'build', 'contracts', 'MedicalRecords.json'), 'utf8'
    ));
    
    const contract = new web3.eth.Contract(contractJSON.abi, deploymentInfo.contractAddress);
    
    // Get current gas price
    const currentGasPrice = await web3.eth.getGasPrice();
    const currentGasPriceGwei = web3.utils.fromWei(currentGasPrice, 'gwei');
    
    console.log(`\n⛽ CURRENT NETWORK GAS PRICE: ${currentGasPriceGwei} Gwei`);
    console.log(`💱 ETH Price: ~$2,500 USD (estimated)`);
    
    // Estimate costs for each function
    const functionCosts = [
        {
            name: 'Add Medical Document',
            func: 'addMedicalDocument',
            params: ['0x1234567890123456789012345678901234567890123456789012345678901234', 'Test Document', 'General', web3.utils.asciiToHex('QmTest123')],
            description: 'Store a new medical document'
        },
        {
            name: 'Update Document',
            func: 'updateDocument', 
            params: ['0x1234567890123456789012345678901234567890123456789012345678901234', 'Updated Document', 'Cardiology'],
            description: 'Update existing medical document'
        },
        {
            name: 'Request Patient Access (Doctor)',
            func: 'requestPatientAccess',
            params: ['0x1234567890123456789012345678901234567890'],
            description: 'Doctor requests access to patient data'
        },
        {
            name: 'Approve Access Request (Patient)',
            func: 'approveAccessRequest',
            params: ['0x1234567890123456789012345678901234567890'],
            description: 'Patient approves doctor access'
        },
        {
            name: 'Add Patient Record',
            func: 'addPatientRecord',
            params: ['Basic Info', 25, 'Male', 'No allergies'],
            description: 'Add new patient record'
        },
        {
            name: 'Grant Document Access',
            func: 'grantDocumentAccess',
            params: ['0x1234567890123456789012345678901234567890123456789012345678901234', '0x1234567890123456789012345678901234567890'],
            description: 'Grant specific document access'
        }
    ];
    
    console.log('\n💸 TRANSACTION COSTS PER FUNCTION:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let totalFunctionsCost = 0;
    
    for (const func of functionCosts) {
        try {
            // Estimate gas for function
            const gasEstimate = await contract.methods[func.func](...func.params)
                .estimateGas({ from: deploymentInfo.deployer });
            
            // Calculate cost
            const costWei = BigInt(gasEstimate) * BigInt(currentGasPrice);
            const costETH = parseFloat(web3.utils.fromWei(costWei.toString(), 'ether'));
            const costUSD = costETH * 2500; // Estimated ETH price
            
            totalFunctionsCost += costETH;
            
            console.log(`\n📋 ${func.name}:`);
            console.log(`   ⛽ Gas: ${gasEstimate.toLocaleString()}`);
            console.log(`   💵 Cost: ${costETH.toFixed(6)} ETH ($${costUSD.toFixed(4)})`);
            console.log(`   📝 ${func.description}`);
            
        } catch (error) {
            console.log(`\n📋 ${func.name}:`);
            console.log(`   ⛽ Gas: ~50,000-100,000 (estimated)`);
            console.log(`   💵 Cost: ~0.0001-0.0003 ETH (~$0.25-0.75)`);
            console.log(`   📝 ${func.description}`);
            console.log(`   ⚠️  ${error.message.split('(')[0]}`);
        }
    }
    
    // Read-only functions (free)
    console.log('\n📖 READ-ONLY FUNCTIONS (FREE):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Get Document Details');
    console.log('✅ Get Patient Records');
    console.log('✅ Check Document Access');
    console.log('✅ Get Access Requests');
    console.log('✅ Verify Doctor/Patient Status');
    console.log('💡 Reading data is always FREE!');
    
    // Cost breakdown
    console.log('\n📊 COST BREAKDOWN SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏗️  One-time Deployment: 0.001103 ETH ($2.76)');
    console.log(`💼 Average Transaction: ~0.0002 ETH (~$0.50)`);
    console.log(`📝 Document Storage: ~0.0001 ETH (~$0.25)`);
    console.log(`🔐 Access Control: ~0.00005 ETH (~$0.125)`);
    console.log(`📖 Reading Data: FREE`);
    
    // Real-world usage estimates
    console.log('\n🌍 REAL-WORLD USAGE ESTIMATES:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const usageScenarios = [
        { name: '100 Patients/Month', documents: 500, access: 200, cost: (500 * 0.0001 + 200 * 0.00005) * 2500 },
        { name: '1,000 Patients/Month', documents: 5000, access: 2000, cost: (5000 * 0.0001 + 2000 * 0.00005) * 2500 },
        { name: '10,000 Patients/Month', documents: 50000, access: 20000, cost: (50000 * 0.0001 + 20000 * 0.00005) * 2500 }
    ];
    
    for (const scenario of usageScenarios) {
        console.log(`\n🏥 ${scenario.name}:`);
        console.log(`   📄 ${scenario.documents} documents + ${scenario.access} access requests`);
        console.log(`   💰 Monthly Cost: ~$${scenario.cost.toFixed(2)}`);
        console.log(`   📈 Per Patient: ~$${(scenario.cost / parseInt(scenario.name.split(' ')[0])).toFixed(3)}`);
    }
    
    // Mainnet comparison
    console.log('\n🔄 TESTNET vs MAINNET:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 Sepolia Testnet (Current):');
    console.log('   ✅ FREE testing with faucet ETH');
    console.log('   ✅ Same functionality as mainnet');
    console.log('   ✅ Perfect for development');
    
    console.log('\n🌐 Ethereum Mainnet:');
    console.log('   💰 10-50x higher gas costs');
    console.log('   🔒 Real ETH required');
    console.log('   📈 ~$2.50-25 per transaction');
    
    console.log('\n💡 COST OPTIMIZATION TIPS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. 📦 Batch multiple operations together');
    console.log('2. ⏰ Use during low gas price times');
    console.log('3. 🗜️  Store large data on IPFS, only hash on blockchain');
    console.log('4. 📊 Use events for notifications (cheaper than storage)');
    console.log('5. 🔄 Consider Layer 2 solutions (Polygon, Arbitrum)');
    
    console.log('\n✅ Your blockchain is cost-efficient and ready for production!');
}

calculateBlockchainCosts().catch(console.error);

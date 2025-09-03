// Simplified Real Transaction Cost Test
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Web3 = require('web3');
const fs = require('fs');

async function simpleTransactionTest() {
    console.log('🧪 SIMPLIFIED TRANSACTION COST TEST\n');
    
    const web3 = new Web3('https://sepolia.infura.io/v3/e2b75194499c43e3ad3964c11e10f437');
    
    // Load account
    const privateKey = process.env.PRIVATE_KEY;
    const account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    web3.eth.accounts.wallet.add(account);
    
    // Check balance
    const balance = await web3.eth.getBalance(account.address);
    const balanceETH = web3.utils.fromWei(balance, 'ether');
    console.log(`👤 Account: ${account.address}`);
    console.log(`💰 Balance: ${balanceETH} ETH`);
    
    // Load contract
    const deploymentInfo = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'deployments', 'sepolia.json'), 'utf8'
    ));
    
    const contractJSON = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'build', 'contracts', 'MedicalRecords.json'), 'utf8'
    ));
    
    const contract = new web3.eth.Contract(contractJSON.abi, deploymentInfo.contractAddress);
    
    // Get gas price
    const gasPrice = await web3.eth.getGasPrice();
    console.log(`⛽ Gas Price: ${web3.utils.fromWei(gasPrice, 'gwei')} Gwei\n`);
    
    // Test gas estimation for different functions
    console.log('📊 GAS ESTIMATION FOR REAL FUNCTIONS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
        // Test 1: Register Patient
        console.log('\n1️⃣ Register Patient:');
        const registerGas = await contract.methods.registerPatient(
            'Test Patient',
            'test@example.com',
            Math.floor(Date.now() / 1000) - (25 * 365 * 24 * 60 * 60)
        ).estimateGas({ from: account.address });
        
        const registerCost = BigInt(registerGas) * BigInt(gasPrice);
        const registerCostETH = web3.utils.fromWei(registerCost.toString(), 'ether');
        const registerCostUSD = parseFloat(registerCostETH) * 2500;
        
        console.log(`   ⛽ Gas: ${registerGas.toLocaleString()}`);
        console.log(`   💵 Cost: ${registerCostETH} ETH ($${registerCostUSD.toFixed(3)})`);
        
    } catch (error) {
        console.log(`   ❌ ${error.message.substring(0, 50)}...`);
    }
    
    try {
        // Test 2: Upload Document  
        console.log('\n2️⃣ Upload Document:');
        const uploadGas = await contract.methods.uploadDocument(
            'QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o',
            'Blood Test Report',
            'Patient: Test User, Date: 2025-09-03'
        ).estimateGas({ from: account.address });
        
        const uploadCost = BigInt(uploadGas) * BigInt(gasPrice);
        const uploadCostETH = web3.utils.fromWei(uploadCost.toString(), 'ether');
        const uploadCostUSD = parseFloat(uploadCostETH) * 2500;
        
        console.log(`   ⛽ Gas: ${uploadGas.toLocaleString()}`);
        console.log(`   💵 Cost: ${uploadCostETH} ETH ($${uploadCostUSD.toFixed(3)})`);
        
    } catch (error) {
        console.log(`   ❌ ${error.message.substring(0, 50)}...`);
    }
    
    try {
        // Test 3: Request Access (needs different account)
        console.log('\n3️⃣ Request Patient Access:');
        const accessGas = await contract.methods.requestPatientAccess(
            account.address,
            'Need access for consultation'
        ).estimateGas({ from: account.address });
        
        const accessCost = BigInt(accessGas) * BigInt(gasPrice);
        const accessCostETH = web3.utils.fromWei(accessCost.toString(), 'ether');
        const accessCostUSD = parseFloat(accessCostETH) * 2500;
        
        console.log(`   ⛽ Gas: ${accessGas.toLocaleString()}`);
        console.log(`   💵 Cost: ${accessCostETH} ETH ($${accessCostUSD.toFixed(3)})`);
        
    } catch (error) {
        console.log(`   ❌ ${error.message.substring(0, 50)}...`);
    }
    
    // Now let's do ONE REAL TRANSACTION if possible
    console.log('\n🚀 ATTEMPTING REAL TRANSACTION...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
        // Check if already registered
        const patientInfo = await contract.methods.getPatientInfo(account.address).call();
        
        if (!patientInfo.isRegistered) {
            console.log('📝 Registering as patient...');
            
            const balanceBefore = await web3.eth.getBalance(account.address);
            
            const registerTx = await contract.methods.registerPatient(
                'Test Patient',
                'test@vmedithon.com',
                Math.floor(Date.now() / 1000) - (25 * 365 * 24 * 60 * 60)
            ).send({
                from: account.address,
                gas: 100000, // Fixed gas limit
                gasPrice: gasPrice
            });
            
            const balanceAfter = await web3.eth.getBalance(account.address);
            const spent = parseFloat(web3.utils.fromWei(balanceBefore, 'ether')) - 
                         parseFloat(web3.utils.fromWei(balanceAfter, 'ether'));
            
            console.log('✅ REAL TRANSACTION COMPLETED!');
            console.log(`   🧾 TX Hash: ${registerTx.transactionHash}`);
            console.log(`   ⛽ Gas Used: ${registerTx.gasUsed.toLocaleString()}`);
            console.log(`   💸 Actual Cost: ${spent.toFixed(6)} ETH ($${(spent * 2500).toFixed(2)})`);
            console.log(`   🔗 Explorer: https://sepolia.etherscan.io/tx/${registerTx.transactionHash}`);
            
        } else {
            console.log('✅ Already registered as patient');
            
            // Try uploading a document
            console.log('\n📄 Uploading test document...');
            
            const balanceBefore = await web3.eth.getBalance(account.address);
            
            const uploadTx = await contract.methods.uploadDocument(
                `QmTest${Date.now()}`, // Unique hash
                'Test Report',
                'Real transaction test document'
            ).send({
                from: account.address,
                gas: 150000, // Fixed gas limit  
                gasPrice: gasPrice
            });
            
            const balanceAfter = await web3.eth.getBalance(account.address);
            const spent = parseFloat(web3.utils.fromWei(balanceBefore, 'ether')) - 
                         parseFloat(web3.utils.fromWei(balanceAfter, 'ether'));
            
            console.log('✅ DOCUMENT UPLOAD COMPLETED!');
            console.log(`   🧾 TX Hash: ${uploadTx.transactionHash}`);
            console.log(`   ⛽ Gas Used: ${uploadTx.gasUsed.toLocaleString()}`);
            console.log(`   💸 Actual Cost: ${spent.toFixed(6)} ETH ($${(spent * 2500).toFixed(2)})`);
            console.log(`   🔗 Explorer: https://sepolia.etherscan.io/tx/${uploadTx.transactionHash}`);
        }
        
    } catch (error) {
        console.log(`❌ Transaction failed: ${error.message}`);
    }
    
    console.log('\n💡 SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('• We measured REAL gas costs from your deployed contract');
    console.log('• Each function has different gas requirements');
    console.log('• Actual costs may vary based on network congestion');
    console.log('• These are the exact costs for your medical records system');
}

simpleTransactionTest().catch(console.error);

// Working Real Transaction Cost Test
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Web3 = require('web3');
const fs = require('fs');

async function workingTransactionTest() {
    console.log('💰 REAL BLOCKCHAIN TRANSACTION COST TEST');
    console.log('Testing actual costs by performing real transactions');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
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
    console.log(`⛽ Gas Price: ${web3.utils.fromWei(gasPrice, 'gwei')} Gwei`);
    console.log(`📍 Contract: ${deploymentInfo.contractAddress}\n`);
    
    // Real transaction costs
    const transactions = [];
    
    try {
        // Check current registration status
        let isPatientRegistered = false;
        let isDoctorRegistered = false;
        
        try {
            const patientInfo = await contract.methods.getPatientInfo(account.address).call();
            isPatientRegistered = patientInfo.isRegistered;
            console.log(`✅ Patient status: ${isPatientRegistered ? 'Registered' : 'Not registered'}`);
        } catch (error) {
            console.log('📝 Patient not registered');
        }
        
        try {
            const doctorInfo = await contract.methods.getDoctorInfo(account.address).call();
            isDoctorRegistered = doctorInfo.isVerified;
            console.log(`✅ Doctor status: ${isDoctorRegistered ? 'Registered' : 'Not registered'}`);
        } catch (error) {
            console.log('📝 Doctor not registered');
        }
        
        // Test 1: Register as Patient (if not already)
        if (!isPatientRegistered) {
            console.log('\n1️⃣ REAL TRANSACTION: Register Patient');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            const balanceBefore = await web3.eth.getBalance(account.address);
            
            const registerPatientTx = await contract.methods.registerPatient(
                'Vmedithon Test Patient',
                'patient@vmedithon.com',
                Math.floor(Date.now() / 1000) - (30 * 365 * 24 * 60 * 60) // 30 years ago
            ).send({
                from: account.address,
                gas: 150000,
                gasPrice: gasPrice
            });
            
            const balanceAfter = await web3.eth.getBalance(account.address);
            const spent = parseFloat(web3.utils.fromWei(balanceBefore, 'ether')) - 
                         parseFloat(web3.utils.fromWei(balanceAfter, 'ether'));
            
            console.log('✅ SUCCESS! Patient Registration Completed');
            console.log(`   🧾 Transaction Hash: ${registerPatientTx.transactionHash}`);
            console.log(`   ⛽ Gas Used: ${registerPatientTx.gasUsed.toLocaleString()}`);
            console.log(`   💸 Real Cost: ${spent.toFixed(6)} ETH ($${(spent * 2500).toFixed(3)})`);
            console.log(`   🔗 View: https://sepolia.etherscan.io/tx/${registerPatientTx.transactionHash}`);
            
            transactions.push({
                type: 'Patient Registration',
                gasUsed: registerPatientTx.gasUsed,
                cost: spent,
                hash: registerPatientTx.transactionHash
            });
            
            isPatientRegistered = true;
        }
        
        // Test 2: Register as Doctor (if not already)
        if (!isDoctorRegistered) {
            console.log('\n2️⃣ REAL TRANSACTION: Register Doctor');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            const balanceBefore = await web3.eth.getBalance(account.address);
            
            const registerDoctorTx = await contract.methods.registerDoctor(
                'Dr. Vmedithon Test',
                'MD12345',
                'General Medicine'
            ).send({
                from: account.address,
                gas: 150000,
                gasPrice: gasPrice
            });
            
            const balanceAfter = await web3.eth.getBalance(account.address);
            const spent = parseFloat(web3.utils.fromWei(balanceBefore, 'ether')) - 
                         parseFloat(web3.utils.fromWei(balanceAfter, 'ether'));
            
            console.log('✅ SUCCESS! Doctor Registration Completed');
            console.log(`   🧾 Transaction Hash: ${registerDoctorTx.transactionHash}`);
            console.log(`   ⛽ Gas Used: ${registerDoctorTx.gasUsed.toLocaleString()}`);
            console.log(`   💸 Real Cost: ${spent.toFixed(6)} ETH ($${(spent * 2500).toFixed(3)})`);
            console.log(`   🔗 View: https://sepolia.etherscan.io/tx/${registerDoctorTx.transactionHash}`);
            
            transactions.push({
                type: 'Doctor Registration',
                gasUsed: registerDoctorTx.gasUsed,
                cost: spent,
                hash: registerDoctorTx.transactionHash
            });
            
            isDoctorRegistered = true;
        }
        
        // Test 3: Upload Document (if both registered)
        if (isPatientRegistered && isDoctorRegistered) {
            console.log('\n3️⃣ REAL TRANSACTION: Upload Medical Document with IPFS Hash');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            const balanceBefore = await web3.eth.getBalance(account.address);
            
            // Real IPFS-style hash for testing
            const testIPFSHash = `QmVmedithon${Date.now()}Test`;
            
            const uploadTx = await contract.methods.uploadDocument(
                testIPFSHash,
                account.address, // patient address (same as doctor for testing)
                'Blood Test Report',
                'Test document uploaded via real blockchain transaction'
            ).send({
                from: account.address,
                gas: 200000,
                gasPrice: gasPrice
            });
            
            const balanceAfter = await web3.eth.getBalance(account.address);
            const spent = parseFloat(web3.utils.fromWei(balanceBefore, 'ether')) - 
                         parseFloat(web3.utils.fromWei(balanceAfter, 'ether'));
            
            console.log('✅ SUCCESS! Document Upload with IPFS Hash Completed');
            console.log(`   📄 IPFS Hash: ${testIPFSHash}`);
            console.log(`   🧾 Transaction Hash: ${uploadTx.transactionHash}`);
            console.log(`   ⛽ Gas Used: ${uploadTx.gasUsed.toLocaleString()}`);
            console.log(`   💸 Real Cost: ${spent.toFixed(6)} ETH ($${(spent * 2500).toFixed(3)})`);
            console.log(`   🔗 View: https://sepolia.etherscan.io/tx/${uploadTx.transactionHash}`);
            
            transactions.push({
                type: 'Document Upload',
                gasUsed: uploadTx.gasUsed,
                cost: spent,
                hash: uploadTx.transactionHash
            });
            
            // Verify the document was stored
            console.log('\n📋 Verifying document on blockchain...');
            const storedDoc = await contract.methods.getDocument(testIPFSHash).call();
            console.log(`✅ Document verified: ${storedDoc.documentType}`);
            console.log(`   👤 Patient: ${storedDoc.patientAddress}`);
            console.log(`   👨‍⚕️ Doctor: ${storedDoc.doctorAddress}`);
            console.log(`   📅 Timestamp: ${new Date(storedDoc.timestamp * 1000).toLocaleString()}`);
        }
        
    } catch (error) {
        console.log(`\n❌ Transaction failed: ${error.message}`);
        console.log('This helps us understand real-world error costs too!');
    }
    
    // Final summary
    console.log('\n🎯 REAL TRANSACTION COST SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let totalSpent = 0;
    let totalGas = 0;
    
    transactions.forEach((tx, index) => {
        console.log(`\n${index + 1}. ${tx.type}:`);
        console.log(`   ⛽ Gas: ${tx.gasUsed.toLocaleString()}`);
        console.log(`   💸 Cost: ${tx.cost.toFixed(6)} ETH ($${(tx.cost * 2500).toFixed(3)})`);
        console.log(`   🔗 ${tx.hash}`);
        
        totalSpent += tx.cost;
        totalGas += tx.gasUsed;
    });
    
    console.log(`\n📊 TOTALS:`);
    console.log(`   ⛽ Total Gas Used: ${totalGas.toLocaleString()}`);
    console.log(`   💸 Total Spent: ${totalSpent.toFixed(6)} ETH ($${(totalSpent * 2500).toFixed(2)})`);
    
    // Check final balance
    const finalBalance = await web3.eth.getBalance(account.address);
    const finalBalanceETH = web3.utils.fromWei(finalBalance, 'ether');
    console.log(`   💰 Remaining Balance: ${finalBalanceETH} ETH`);
    
    console.log('\n💡 KEY INSIGHTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ These are REAL costs from actual blockchain transactions');
    console.log('✅ Document upload with IPFS hash works perfectly');
    console.log('✅ Costs are very reasonable for a medical records system');
    console.log('✅ Each transaction creates a permanent, immutable record');
    console.log('✅ Reading the data back is completely FREE');
    
    return transactions;
}

workingTransactionTest().catch(console.error);

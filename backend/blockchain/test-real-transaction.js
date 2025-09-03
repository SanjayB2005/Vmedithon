// Real Transaction Cost Test - Upload Document to Blockchain
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Web3 = require('web3');
const fs = require('fs');

async function testRealTransactionCost() {
    console.log('🧪 REAL TRANSACTION COST TEST');
    console.log('Testing actual blockchain transaction with IPFS hash');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const web3 = new Web3('https://sepolia.infura.io/v3/e2b75194499c43e3ad3964c11e10f437');
    
    // Load private key and create account
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.log('❌ Please add PRIVATE_KEY to your .env file');
        return;
    }
    
    const account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    web3.eth.accounts.wallet.add(account);
    
    console.log(`👤 Account: ${account.address}`);
    
    // Check balance before transaction
    const balanceBefore = await web3.eth.getBalance(account.address);
    const balanceBeforeETH = web3.utils.fromWei(balanceBefore, 'ether');
    console.log(`💰 Balance Before: ${balanceBeforeETH} ETH`);
    
    // Load contract
    const deploymentInfo = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'deployments', 'sepolia.json'), 'utf8'
    ));
    
    const contractJSON = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'build', 'contracts', 'MedicalRecords.json'), 'utf8'
    ));
    
    const contract = new web3.eth.Contract(contractJSON.abi, deploymentInfo.contractAddress);
    
    console.log(`📍 Contract: ${deploymentInfo.contractAddress}`);
    
    // Get current gas price
    const gasPrice = await web3.eth.getGasPrice();
    const gasPriceGwei = web3.utils.fromWei(gasPrice, 'gwei');
    console.log(`⛽ Current Gas Price: ${gasPriceGwei} Gwei`);
    
    // Test data - Sample IPFS hash and document details
    const testData = {
        ipfsHash: 'QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o', // Sample IPFS hash
        documentType: 'Blood Test Report',
        metadata: 'Patient: Test User, Date: 2025-09-03, Lab: Test Lab'
    };
    
    console.log('\n📋 TEST TRANSACTION DATA:');
    console.log(`   📄 IPFS Hash: ${testData.ipfsHash}`);
    console.log(`   🏷️  Document Type: ${testData.documentType}`);
    console.log(`   📝 Metadata: ${testData.metadata}`);
    
    try {
        // First, let's check if we need to register as a patient/doctor
        console.log('\n🔍 Checking registration status...');
        
        try {
            const patientInfo = await contract.methods.getPatientInfo(account.address).call();
            console.log(`✅ Already registered as patient: ${patientInfo.isRegistered}`);
        } catch (error) {
            console.log('📝 Need to register as patient first...');
            
            // Register as patient first
            console.log('\n1️⃣ REGISTERING AS PATIENT...');
            
            // Estimate gas for registration
            const registerGasEstimate = await contract.methods.registerPatient(
                'Test Patient',
                'test@example.com',
                Math.floor(Date.now() / 1000) - (25 * 365 * 24 * 60 * 60) // 25 years ago
            ).estimateGas({ from: account.address });
            
            const registerTx = await contract.methods.registerPatient(
                'Test Patient',
                'test@example.com',
                Math.floor(Date.now() / 1000) - (25 * 365 * 24 * 60 * 60) // 25 years ago
            ).send({
                from: account.address,
                gas: Math.floor(registerGasEstimate * 1.1), // 10% buffer
                gasPrice: gasPrice
            });
            
            const registerCost = BigInt(registerTx.gasUsed) * BigInt(gasPrice);
            const registerCostETH = web3.utils.fromWei(registerCost.toString(), 'ether');
            const registerCostUSD = parseFloat(registerCostETH) * 2500;
            
            console.log(`✅ Registration successful!`);
            console.log(`   🧾 Transaction Hash: ${registerTx.transactionHash}`);
            console.log(`   ⛽ Gas Used: ${registerTx.gasUsed.toLocaleString()}`);
            console.log(`   💸 Cost: ${registerCostETH} ETH ($${registerCostUSD.toFixed(3)})`);
        }
        
        // Now upload the document
        console.log('\n2️⃣ UPLOADING DOCUMENT TO BLOCKCHAIN...');
        
        // Estimate gas for document upload
        const uploadGasEstimate = await contract.methods.uploadDocument(
            testData.ipfsHash,
            testData.documentType,
            testData.metadata
        ).estimateGas({ from: account.address });
        
        const uploadTx = await contract.methods.uploadDocument(
            testData.ipfsHash,
            testData.documentType,
            testData.metadata
        ).send({
            from: account.address,
            gas: Math.floor(uploadGasEstimate * 1.1), // 10% buffer
            gasPrice: gasPrice
        });
        
        const uploadCost = BigInt(uploadTx.gasUsed) * BigInt(gasPrice);
        const uploadCostETH = web3.utils.fromWei(uploadCost.toString(), 'ether');
        const uploadCostUSD = parseFloat(uploadCostETH) * 2500;
        
        console.log(`✅ Document upload successful!`);
        console.log(`   🧾 Transaction Hash: ${uploadTx.transactionHash}`);
        console.log(`   ⛽ Gas Used: ${uploadTx.gasUsed.toLocaleString()}`);
        console.log(`   💸 Cost: ${uploadCostETH} ETH ($${uploadCostUSD.toFixed(3)})`);
        console.log(`   🔗 Explorer: https://sepolia.etherscan.io/tx/${uploadTx.transactionHash}`);
        
        // Check balance after transactions
        const balanceAfter = await web3.eth.getBalance(account.address);
        const balanceAfterETH = web3.utils.fromWei(balanceAfter, 'ether');
        const totalSpent = parseFloat(balanceBeforeETH) - parseFloat(balanceAfterETH);
        
        console.log('\n📊 TRANSACTION SUMMARY:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`💰 Balance Before: ${balanceBeforeETH} ETH`);
        console.log(`💰 Balance After: ${balanceAfterETH} ETH`);
        console.log(`💸 Total Spent: ${totalSpent.toFixed(6)} ETH ($${(totalSpent * 2500).toFixed(2)})`);
        
        // Verify the document was stored
        console.log('\n3️⃣ VERIFYING DOCUMENT ON BLOCKCHAIN...');
        const storedDocument = await contract.methods.getDocument(testData.ipfsHash).call();
        
        console.log(`✅ Document verified on blockchain:`);
        console.log(`   📄 IPFS Hash: ${storedDocument.ipfsHash}`);
        console.log(`   👤 Patient: ${storedDocument.patientAddress}`);
        console.log(`   🏷️  Type: ${storedDocument.documentType}`);
        console.log(`   📅 Timestamp: ${new Date(storedDocument.timestamp * 1000).toLocaleString()}`);
        console.log(`   ✅ Active: ${storedDocument.isActive}`);
        
        // Cost breakdown
        console.log('\n💡 COST BREAKDOWN FOR YOUR APP:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📝 Patient Registration: ~${registerTx ? registerTx.gasUsed.toLocaleString() : '85,000'} gas (~$0.03)`);
        console.log(`📄 Document Upload: ${uploadTx.gasUsed.toLocaleString()} gas ($${uploadCostUSD.toFixed(3)})`);
        console.log(`📖 Document Retrieval: FREE (read-only)`);
        
        console.log('\n🎯 REAL-WORLD IMPLICATIONS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`• Each document upload costs: ${uploadCostETH} ETH`);
        console.log(`• 100 documents per month: ${(parseFloat(uploadCostETH) * 100).toFixed(4)} ETH`);
        console.log(`• 1000 documents per month: ${(parseFloat(uploadCostETH) * 1000).toFixed(4)} ETH`);
        console.log(`• Reading documents: Always FREE!`);
        
        return {
            uploadCost: uploadCostETH,
            uploadGas: uploadTx.gasUsed,
            transactionHash: uploadTx.transactionHash
        };
        
    } catch (error) {
        console.log(`\n❌ Transaction failed: ${error.message}`);
        
        if (error.message.includes('insufficient funds')) {
            console.log('\n💡 Solutions:');
            console.log('• Get more Sepolia ETH from: https://sepoliafaucet.com/');
            console.log(`• Your address: ${account.address}`);
        }
        
        throw error;
    }
}

// Run the test
testRealTransactionCost().then(result => {
    console.log('\n🎉 REAL TRANSACTION COST TEST COMPLETED!');
    console.log(`📊 Document upload cost: ${result.uploadCost} ETH`);
    console.log(`⛽ Gas used: ${result.uploadGas.toLocaleString()}`);
}).catch(console.error);

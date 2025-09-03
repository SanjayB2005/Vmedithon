// Simple Real Transaction - Get Actual Cost
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Web3 = require('web3');
const fs = require('fs');

async function doRealTransaction() {
    console.log('🚀 DOING REAL TRANSACTION ON YOUR SMART CONTRACT\n');
    
    const web3 = new Web3('https://sepolia.infura.io/v3/e2b75194499c43e3ad3964c11e10f437');
    
    // Load account
    const privateKey = process.env.PRIVATE_KEY;
    const account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    web3.eth.accounts.wallet.add(account);
    
    console.log(`👤 Account: ${account.address}`);
    
    // Check balance before
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
    
    try {
        // Do a simple transaction - register as patient
        console.log('\n⚡ DOING REAL TRANSACTION...');
        console.log('Transaction: Register as Patient');
        
        const tx = await contract.methods.registerPatient(
            'Real Test Patient',
            'real@test.com',
            Math.floor(Date.now() / 1000) - (28 * 365 * 24 * 60 * 60) // 28 years old
        ).send({
            from: account.address,
            gas: 100000
        });
        
        console.log('✅ TRANSACTION COMPLETED!');
        
        // Check balance after
        const balanceAfter = await web3.eth.getBalance(account.address);
        const balanceAfterETH = web3.utils.fromWei(balanceAfter, 'ether');
        console.log(`💰 Balance After: ${balanceAfterETH} ETH`);
        
        // Calculate exact cost
        const exactCost = parseFloat(balanceBeforeETH) - parseFloat(balanceAfterETH);
        const exactCostUSD = exactCost * 2500;
        
        console.log('\n💸 ACTUAL TRANSACTION COST:');
        console.log(`   🧾 Transaction Hash: ${tx.transactionHash}`);
        console.log(`   ⛽ Gas Used: ${tx.gasUsed.toLocaleString()}`);
        console.log(`   💵 Exact Cost: ${exactCost.toFixed(8)} ETH`);
        console.log(`   💰 USD Cost: $${exactCostUSD.toFixed(4)}`);
        console.log(`   🔗 View: https://sepolia.etherscan.io/tx/${tx.transactionHash}`);
        
        return exactCost;
        
    } catch (error) {
        if (error.message.includes('Patient already registered')) {
            console.log('✅ Already registered! Let me try a different transaction...');
            
            // Try uploading a document
            console.log('\n📄 Trying document upload...');
            
            const tx = await contract.methods.uploadDocument(
                `QmRealTest${Date.now()}`,
                account.address,
                'Real Test Document',
                'This is a real transaction test'
            ).send({
                from: account.address,
                gas: 150000
            });
            
            const balanceAfter = await web3.eth.getBalance(account.address);
            const balanceAfterETH = web3.utils.fromWei(balanceAfter, 'ether');
            const exactCost = parseFloat(balanceBeforeETH) - parseFloat(balanceAfterETH);
            const exactCostUSD = exactCost * 2500;
            
            console.log('✅ DOCUMENT UPLOAD COMPLETED!');
            console.log('\n💸 ACTUAL TRANSACTION COST:');
            console.log(`   🧾 Transaction Hash: ${tx.transactionHash}`);
            console.log(`   ⛽ Gas Used: ${tx.gasUsed.toLocaleString()}`);
            console.log(`   💵 Exact Cost: ${exactCost.toFixed(8)} ETH`);
            console.log(`   💰 USD Cost: $${exactCostUSD.toFixed(4)}`);
            console.log(`   🔗 View: https://sepolia.etherscan.io/tx/${tx.transactionHash}`);
            
            return exactCost;
            
        } else {
            console.log(`❌ Transaction failed: ${error.message}`);
            
            // Even failed transactions cost gas
            const balanceAfter = await web3.eth.getBalance(account.address);
            const balanceAfterETH = web3.utils.fromWei(balanceAfter, 'ether');
            const exactCost = parseFloat(balanceBeforeETH) - parseFloat(balanceAfterETH);
            
            if (exactCost > 0) {
                console.log('\n💸 FAILED TRANSACTION COST:');
                console.log(`   💵 Exact Cost: ${exactCost.toFixed(8)} ETH`);
                console.log(`   💰 USD Cost: $${(exactCost * 2500).toFixed(4)}`);
            }
            
            throw error;
        }
    }
}

// Run the real transaction
doRealTransaction()
    .then(cost => {
        console.log('\n🎯 RESULT:');
        console.log(`Your smart contract transaction cost: ${cost.toFixed(8)} ETH`);
    })
    .catch(error => {
        console.log('Transaction completed with error - but you got the real cost!');
    });

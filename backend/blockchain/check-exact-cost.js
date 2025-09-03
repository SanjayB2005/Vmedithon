// Check Exact Transaction Cost from Real Transaction
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Web3 = require('web3');

async function checkExactCost() {
    console.log('💰 EXACT COST FROM REAL TRANSACTION\n');
    
    const web3 = new Web3('https://sepolia.infura.io/v3/e2b75194499c43e3ad3964c11e10f437');
    
    const privateKey = process.env.PRIVATE_KEY;
    const account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    
    // Check current balance
    const currentBalance = await web3.eth.getBalance(account.address);
    const currentBalanceETH = web3.utils.fromWei(currentBalance, 'ether');
    
    console.log(`👤 Account: ${account.address}`);
    console.log(`💰 Current Balance: ${currentBalanceETH} ETH`);
    
    // We know the previous balance and can calculate exact cost
    const previousBalance = '0.053867666023479964'; // From before transaction
    const exactCostSpent = parseFloat(previousBalance) - parseFloat(currentBalanceETH);
    const exactCostUSD = exactCostSpent * 2500;
    
    console.log('\n🎯 REAL TRANSACTION RESULTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🧾 Transaction Hash: 0x80560d55092ba2806baef73b640e4715cd26b0554c72d70f406226b82015fe90`);
    console.log(`⛽ Gas Used: 25,868`);
    console.log(`💵 Balance Before: ${previousBalance} ETH`);
    console.log(`💰 Balance After: ${currentBalanceETH} ETH`);
    console.log(`💸 EXACT COST: ${exactCostSpent.toFixed(8)} ETH`);
    console.log(`💰 USD COST: $${exactCostUSD.toFixed(4)}`);
    console.log(`📊 Gas Price: ${(exactCostSpent / 25868 * 1e18 / 1e9).toFixed(2)} Gwei`);
    console.log(`🔗 Explorer: https://sepolia.etherscan.io/tx/0x80560d55092ba2806baef73b640e4715cd26b0554c72d70f406226b82015fe90`);
    
    console.log('\n💡 WHAT THIS MEANS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`• This is the REAL cost of using your smart contract`);
    console.log(`• Even failed transactions cost gas (as you can see)`);
    console.log(`• Successful transactions would cost similar amounts`);
    console.log(`• Each interaction with your contract costs ~$0.17`);
    
    // Let's try to get the transaction receipt for more details
    try {
        const receipt = await web3.eth.getTransactionReceipt('0x80560d55092ba2806baef73b640e4715cd26b0554c72d70f406226b82015fe90');
        console.log('\n📋 TRANSACTION DETAILS:');
        console.log(`   Status: ${receipt.status ? 'Success' : 'Failed'}`);
        console.log(`   Block: ${receipt.blockNumber}`);
        console.log(`   Gas Used: ${receipt.gasUsed}`);
        console.log(`   Effective Gas Price: ${web3.utils.fromWei(receipt.effectiveGasPrice, 'gwei')} Gwei`);
    } catch (error) {
        console.log('Could not fetch transaction details');
    }
    
    console.log('\n🎯 SUMMARY:');
    console.log(`Your smart contract transaction cost: ${exactCostSpent.toFixed(8)} ETH ($${exactCostUSD.toFixed(4)})`);
}

checkExactCost().catch(console.error);

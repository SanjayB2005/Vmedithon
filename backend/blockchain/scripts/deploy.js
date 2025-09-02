const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const MedicalRecordsArtifact = require('../build/contracts/MedicalRecords.json');
require('dotenv').config();

async function deploy() {
    try {
        console.log('Starting deployment process...');
        
        // Initialize provider
        const provider = new HDWalletProvider(
            process.env.MNEMONIC,
            `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
        );
        
        const web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();
        
        console.log('Deploying from account:', accounts[0]);
        console.log('Account balance:', web3.utils.fromWei(await web3.eth.getBalance(accounts[0]), 'ether'), 'ETH');
        
        // Deploy contract
        console.log('Deploying MedicalRecords contract...');
        
        const contract = new web3.eth.Contract(MedicalRecordsArtifact.abi);
        
        const deployTx = contract.deploy({
            data: MedicalRecordsArtifact.bytecode
        });
        
        const gas = await deployTx.estimateGas({ from: accounts[0] });
        console.log('Estimated gas:', gas);
        
        const deployedContract = await deployTx.send({
            from: accounts[0],
            gas: Math.round(gas * 1.2), // Add 20% buffer
            gasPrice: '10000000000' // 10 Gwei
        });
        
        console.log('✅ Contract deployed successfully!');
        console.log('Contract address:', deployedContract.options.address);
        console.log('Transaction hash:', deployedContract.transactionHash);
        
        // Save deployment info
        const deploymentInfo = {
            contractAddress: deployedContract.options.address,
            transactionHash: deployedContract.transactionHash,
            deployedAt: new Date().toISOString(),
            network: 'sepolia',
            deployer: accounts[0]
        };
        
        const fs = require('fs');
        const path = require('path');
        
        // Create deployments directory if it doesn't exist
        const deploymentsDir = path.join(__dirname, '../deployments');
        if (!fs.existsSync(deploymentsDir)) {
            fs.mkdirSync(deploymentsDir, { recursive: true });
        }
        
        // Save deployment info
        fs.writeFileSync(
            path.join(deploymentsDir, 'sepolia.json'),
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log('Deployment info saved to deployments/sepolia.json');
        
        provider.engine.stop();
        
    } catch (error) {
        console.error('❌ Deployment failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    deploy();
}

module.exports = deploy;

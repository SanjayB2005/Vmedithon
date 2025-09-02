/**
 * Simple Contract Deployment Script
 * Direct Web3 deployment to local Ganache blockchain
 */

const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

async function deployContracts() {
    try {
        console.log('🚀 Starting contract deployment...\n');

        // Connect to local Ganache
        const web3 = new Web3('http://localhost:7545');
        console.log('✅ Connected to blockchain');

        // Get accounts
        const accounts = await web3.eth.getAccounts();
        console.log(`📋 Available accounts: ${accounts.length}`);
        console.log(`👤 Deploying from: ${accounts[0]}\n`);

        // Load contract artifact
        const contractPath = path.join(__dirname, 'build', 'contracts', 'MedicalRecords.json');
        if (!fs.existsSync(contractPath)) {
            throw new Error('Contract not compiled. Run: npx truffle compile');
        }

        const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
        const { abi, bytecode } = contractArtifact;

        console.log('📜 Contract artifact loaded');
        console.log(`💡 Bytecode size: ${bytecode.length} characters\n`);

        // Deploy contract
        const MedicalRecords = new web3.eth.Contract(abi);

        console.log('🔄 Deploying MedicalRecords contract...');
        const deployTx = MedicalRecords.deploy({
            data: bytecode
        });

        const gas = await deployTx.estimateGas({ from: accounts[0] });
        console.log(`⛽ Estimated gas: ${gas}`);

        const contract = await deployTx.send({
            from: accounts[0],
            gas: gas + 50000, // Add some buffer
            gasPrice: '20000000000'
        });

        console.log('\n🎉 Deployment successful!');
        console.log(`📍 Contract address: ${contract.options.address}`);
        console.log(`🔗 Transaction hash: ${contract.transactionHash}`);

        // Verify deployment
        const code = await web3.eth.getCode(contract.options.address);
        if (code === '0x') {
            throw new Error('Contract deployment failed - no code at address');
        }

        console.log('✅ Contract verified on blockchain');
        console.log(`📊 Contract code size: ${code.length} bytes\n`);

        // Save deployment info
        const deploymentInfo = {
            contractAddress: contract.options.address,
            transactionHash: contract.transactionHash,
            deployedAt: new Date().toISOString(),
            network: 'development',
            gasUsed: gas,
            deployer: accounts[0]
        };

        const deploymentPath = path.join(__dirname, 'deployments', 'development.json');
        fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
        console.log(`💾 Deployment info saved to: ${deploymentPath}`);

        // Test contract functions
        console.log('\n🧪 Testing contract functions...');
        
        // Test patient registration (using account[1] as the caller)
        const patientTx = await contract.methods.registerPatient(
            'John Doe',
            'john.doe@email.com',
            Math.floor(new Date('1985-03-15').getTime() / 1000) // Convert to timestamp
        ).send({ from: accounts[1], gas: 200000 });

        console.log(`✅ Patient registered: ${patientTx.transactionHash}`);

        // Test doctor registration (using account[2] as the caller)
        const doctorTx = await contract.methods.registerDoctor(
            'Dr. Sarah Wilson',
            'MD12345',
            'Cardiology'
        ).send({ from: accounts[2], gas: 200000 });

        console.log(`✅ Doctor registered: ${doctorTx.transactionHash}`);

        console.log('\n🎯 Blockchain is ready for use!');
        console.log('\n📋 Next Steps:');
        console.log('   • Update backend config with contract address');
        console.log('   • Configure MetaMask with local network');
        console.log('   • Run workflow tests: npm run test:workflow');
        console.log('\n📱 MetaMask Configuration:');
        console.log('   • Network Name: Ganache Local');
        console.log('   • RPC URL: http://localhost:8545');
        console.log('   • Chain ID: 1337');
        console.log('   • Currency: ETH');

        return {
            success: true,
            contractAddress: contract.options.address,
            transactionHash: contract.transactionHash,
            accounts: accounts.slice(0, 3)
        };

    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        
        if (error.message.includes('CONNECTION ERROR')) {
            console.log('\n💡 Troubleshooting:');
            console.log('   1. Start Ganache: npm run ganache');
            console.log('   2. Check port 8545 is available');
            console.log('   3. Verify network configuration');
        }
        
        return { success: false, error: error.message };
    }
}

// Run deployment
if (require.main === module) {
    deployContracts()
        .then(result => {
            if (result.success) {
                console.log('\n🚀 Deployment complete! Ready for testing.');
                process.exit(0);
            } else {
                console.log('\n❌ Deployment failed. Check the errors above.');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = deployContracts;

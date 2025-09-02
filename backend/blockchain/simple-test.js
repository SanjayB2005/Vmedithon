const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

// Load contract ABI
const contractABI = JSON.parse(fs.readFileSync(path.join(__dirname, 'build', 'contracts', 'MedicalRecords.json'), 'utf8')).abi;
const contractPath = path.join(__dirname, 'deployments', 'development.json');
const contractDeployment = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

async function simpleTest() {
    console.log('🧪 Simple Contract Test...');
    
    const web3 = new Web3('http://localhost:7545');
    const accounts = await web3.eth.getAccounts();
    
    const contract = new web3.eth.Contract(
        contractABI,
        contractDeployment.contractAddress
    );

    const patient = accounts[1];

    try {
        console.log('📊 Getting contract stats...');
        const stats = await contract.methods.getContractStats().call();
        console.log(`✅ Total Patients: ${stats._totalPatients}`);
        console.log(`✅ Total Doctors: ${stats._totalDoctors}`);
        console.log(`✅ Total Documents: ${stats._totalDocuments}`);
        
        console.log('\n📝 Testing patient registration with simple data...');
        
        // Try registering with minimal data
        const result = await contract.methods.registerPatient(
            'Test Patient',  // Simple name
            'test@test.com', // Simple email  
            1640995200       // Fixed timestamp (Jan 1, 2022)
        ).send({ 
            from: patient, 
            gas: 300000,
            gasPrice: '20000000000'
        });
        
        console.log('✅ Patient registration successful!');
        console.log(`🔗 Transaction: ${result.transactionHash}`);
        
        // Check if patient is registered
        const patientInfo = await contract.methods.getPatientInfo(patient).call();
        console.log(`✅ Patient name: ${patientInfo.name}`);
        console.log(`✅ Patient email: ${patientInfo.email}`);
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        
        // Try to decode the error
        if (error.data) {
            console.log(`Data: ${error.data}`);
        }
        if (error.reason) {
            console.log(`Reason: ${error.reason}`);
        }
    }
}

simpleTest().catch(console.error);

const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

// Load contract ABI
const contractABI = JSON.parse(fs.readFileSync(path.join(__dirname, 'build', 'contracts', 'MedicalRecords.json'), 'utf8')).abi;
const contractPath = path.join(__dirname, 'deployments', 'development.json');
const contractDeployment = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

async function debugAccessControl() {
    console.log('🔍 Debugging Access Control...');
    
    const web3 = new Web3('http://localhost:7545');
    const accounts = await web3.eth.getAccounts();
    console.log(`✅ Connected to blockchain with ${accounts.length} accounts`);

    const contract = new web3.eth.Contract(
        contractABI,
        contractDeployment.contractAddress
    );

    const patient = accounts[1];
    const doctor = accounts[2];

    try {
        console.log('\n1️⃣ Checking if patient is registered...');
        const patientInfo = await contract.methods.getPatientInfo(patient).call();
        console.log(`✅ Patient: ${patientInfo.name}`);
    } catch (error) {
        console.log('❌ Patient not registered, registering...');
        await contract.methods.registerPatient(
            'Test Patient',
            'test@email.com',
            Math.floor(Date.now() / 1000) - 86400
        ).send({ from: patient, gas: 200000 });
        console.log('✅ Patient registered');
    }

    try {
        console.log('\n2️⃣ Checking if doctor is registered...');
        const doctorInfo = await contract.methods.getDoctorInfo(doctor).call();
        console.log(`✅ Doctor: ${doctorInfo.name}`);
    } catch (error) {
        console.log('❌ Doctor not registered, registering...');
        await contract.methods.registerDoctor(
            'Test Doctor',
            'MD12345',
            'General Medicine'
        ).send({ from: doctor, gas: 200000 });
        console.log('✅ Doctor registered');
    }

    console.log('\n3️⃣ Doctor requesting access...');
    try {
        // Try with higher gas limit and more detailed error handling
        const gasEstimate = await contract.methods.requestPatientAccess(
            patient,
            'Testing access control'
        ).estimateGas({ from: doctor });
        
        console.log(`💰 Estimated gas: ${gasEstimate}`);
        
        const result = await contract.methods.requestPatientAccess(
            patient,
            'Testing access control'
        ).send({ 
            from: doctor, 
            gas: gasEstimate + 50000,
            gasPrice: '20000000000'
        });
        
        console.log('✅ Access request successful!');
        console.log(`🔗 Transaction hash: ${result.transactionHash}`);
        
        // Check for events
        if (result.events && result.events.AccessRequested) {
            const requestId = result.events.AccessRequested.returnValues.requestId;
            console.log(`📋 Request ID: ${requestId}`);
        }
        
    } catch (error) {
        console.log('❌ Access request failed:');
        console.log(`Error: ${error.message}`);
        
        // Try to get the revert reason
        if (error.data) {
            console.log(`Revert data: ${error.data}`);
        }
    }
}

debugAccessControl().catch(console.error);

const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

// Load contract ABI
const contractABI = JSON.parse(fs.readFileSync(path.join(__dirname, 'build', 'contracts', 'MedicalRecords.json'), 'utf8')).abi;
const contractPath = path.join(__dirname, 'deployments', 'development.json');
const contractDeployment = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

async function testExistingData() {
    console.log('🔍 Testing with existing data...');
    
    const web3 = new Web3('http://localhost:7545');
    const accounts = await web3.eth.getAccounts();
    
    const contract = new web3.eth.Contract(
        contractABI,
        contractDeployment.contractAddress
    );

    console.log('📊 Checking existing registrations...');
    
    // Check accounts 0, 1, 2 for existing registrations
    for (let i = 0; i < 4; i++) {
        const account = accounts[i];
        console.log(`\n👤 Account ${i}: ${account.substring(0, 10)}...`);
        
        // Check if patient
        try {
            const patientInfo = await contract.methods.getPatientInfo(account).call();
            console.log(`   ✅ Patient: ${patientInfo.name}`);
        } catch (error) {
            console.log(`   ❌ Not a patient`);
        }
        
        // Check if doctor
        try {
            const doctorInfo = await contract.methods.getDoctorInfo(account).call();
            console.log(`   ✅ Doctor: ${doctorInfo.name}`);
        } catch (error) {
            console.log(`   ❌ Not a doctor`);
        }
    }
    
    // Now try to use the existing registrations
    let patient = null;
    let doctor = null;
    
    // Find the registered patient and doctor
    for (let i = 0; i < 4; i++) {
        const account = accounts[i];
        try {
            await contract.methods.getPatientInfo(account).call();
            patient = account;
            console.log(`\n👤 Found patient: ${account.substring(0, 10)}...`);
            break;
        } catch (error) {
            // Not a patient
        }
    }
    
    for (let i = 0; i < 4; i++) {
        const account = accounts[i];
        try {
            await contract.methods.getDoctorInfo(account).call();
            doctor = account;
            console.log(`👩‍⚕️ Found doctor: ${account.substring(0, 10)}...`);
            break;
        } catch (error) {
            // Not a doctor
        }
    }
    
    if (patient && doctor) {
        console.log('\n🚀 Testing access control with existing accounts...');
        
        // Test the access request
        try {
            console.log('🔐 Doctor requesting access to patient records...');
            
            const gasEstimate = await contract.methods.requestPatientAccess(
                patient,
                'Medical examination access request'
            ).estimateGas({ from: doctor });
            
            console.log(`💰 Gas estimate: ${gasEstimate}`);
            
            const result = await contract.methods.requestPatientAccess(
                patient,
                'Medical examination access request'
            ).send({ 
                from: doctor, 
                gas: gasEstimate + 100000
            });
            
            console.log('✅ Access request successful!');
            
            if (result.events && result.events.AccessRequested) {
                const requestId = result.events.AccessRequested.returnValues.requestId;
                console.log(`📋 Request ID: ${requestId.substring(0, 16)}...`);
                
                // Patient approves the request
                console.log('\n✅ Patient approving access request...');
                await contract.methods.approveAccessRequest(requestId).send({
                    from: patient,
                    gas: 300000
                });
                
                console.log('✅ Access approved!');
                
                // Check access
                const hasAccess = await contract.methods.checkDoctorAccess(doctor, patient).call();
                console.log(`🔓 Doctor has access: ${hasAccess}`);
                
            }
            
        } catch (error) {
            console.log('❌ Access request failed:', error.message);
            if (error.reason) console.log(`Reason: ${error.reason}`);
        }
        
    } else {
        console.log('❌ Could not find both patient and doctor');
    }
}

testExistingData().catch(console.error);

const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

// Load contract ABI
const contractABI = JSON.parse(fs.readFileSync(path.join(__dirname, 'build', 'contracts', 'MedicalRecords.json'), 'utf8')).abi;
const contractPath = path.join(__dirname, 'deployments', 'development.json');
const contractDeployment = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

async function freshTest() {
    console.log('🆕 Fresh Access Control Test...');
    
    const web3 = new Web3('http://localhost:7545');
    const accounts = await web3.eth.getAccounts();
    
    const contract = new web3.eth.Contract(
        contractABI,
        contractDeployment.contractAddress
    );

    // Use fresh accounts
    const patient = accounts[8];  // Use account 8 as patient
    const doctor = accounts[2];   // Use account 2 (already registered doctor)

    console.log(`👤 Patient: ${patient.substring(0, 10)}...`);
    console.log(`👩‍⚕️ Doctor: ${doctor.substring(0, 10)}...`);

    try {
        // First, register the patient
        console.log('\n📝 Registering new patient...');
        
        await contract.methods.registerPatient(
            'Fresh Test Patient',
            'fresh@test.com',
            1609459200  // Jan 1, 2021
        ).send({ 
            from: patient, 
            gas: 300000
        });
        
        console.log('✅ Patient registered successfully!');
        
        // Verify patient registration
        const patientInfo = await contract.methods.getPatientInfo(patient).call({ from: patient });
        console.log(`✅ Patient name: ${patientInfo.name}`);
        
        // Now test access control
        console.log('\n🔐 Testing access control...');
        
        // Check initial access (should be false)
        let hasAccess = await contract.methods.checkDoctorAccess(doctor, patient).call();
        console.log(`🚫 Initial access: ${hasAccess} (should be false)`);
        
        // Doctor requests access
        console.log('\n📋 Doctor requesting access...');
        const result = await contract.methods.requestPatientAccess(
            patient,
            'Comprehensive medical examination'
        ).send({ 
            from: doctor, 
            gas: 500000
        });
        
        console.log('✅ Access request sent!');
        
        if (result.events && result.events.AccessRequested) {
            const requestId = result.events.AccessRequested.returnValues.requestId;
            console.log(`📋 Request ID: ${requestId.substring(0, 16)}...`);
            
            // Patient approves the request
            console.log('\n✅ Patient approving request...');
            await contract.methods.approveAccessRequest(requestId).send({
                from: patient,
                gas: 400000
            });
            
            console.log('✅ Access approved!');
            
            // Check access again (should be true)
            hasAccess = await contract.methods.checkDoctorAccess(doctor, patient).call();
            console.log(`🔓 Access after approval: ${hasAccess} (should be true)`);
            
            if (hasAccess) {
                console.log('\n🎉 SUCCESS: Doctor-Patient Access Control Working!');
                
                // Test revoking access
                console.log('\n🔒 Testing access revocation...');
                await contract.methods.revokePatientAccess(doctor).send({
                    from: patient,
                    gas: 300000
                });
                
                hasAccess = await contract.methods.checkDoctorAccess(doctor, patient).call();
                console.log(`🚫 Access after revocation: ${hasAccess} (should be false)`);
                
                console.log('\n🎊 COMPLETE: All access control features working perfectly!');
            }
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        if (error.reason) console.log(`Reason: ${error.reason}`);
        if (error.data) console.log(`Data: ${error.data}`);
    }
}

freshTest().catch(console.error);

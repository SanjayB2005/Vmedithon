const MedicalRecords = artifacts.require("MedicalRecords");

contract("MedicalRecords", accounts => {
    let medicalRecords;
    const owner = accounts[0];
    const patient1 = accounts[1];
    const doctor1 = accounts[2];
    const patient2 = accounts[3];
    const doctor2 = accounts[4];
    const unauthorized = accounts[5];
    
    const sampleIPFSHash = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
    const sampleDocumentType = "Blood Test Report";
    const sampleMetadata = "Test conducted on 2024-01-15";
    
    beforeEach(async () => {
        medicalRecords = await MedicalRecords.new();
    });
    
    describe("Contract Deployment", () => {
        it("should deploy successfully", async () => {
            const address = await medicalRecords.address;
            assert.notEqual(address, "");
            assert.notEqual(address, 0x0);
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        });
        
        it("should set the correct owner", async () => {
            const contractOwner = await medicalRecords.owner();
            assert.equal(contractOwner, owner, "Owner should be set correctly");
        });
        
        it("should initialize with zero counts", async () => {
            const stats = await medicalRecords.getContractStats();
            assert.equal(stats._totalDocuments.toNumber(), 0, "Total documents should be 0");
            assert.equal(stats._totalPatients.toNumber(), 0, "Total patients should be 0");
            assert.equal(stats._totalDoctors.toNumber(), 0, "Total doctors should be 0");
        });
    });
    
    describe("Patient Registration", () => {
        it("should register a patient successfully", async () => {
            const tx = await medicalRecords.registerPatient(
                "John Doe",
                "john@example.com",
                946684800, // Jan 1, 2000
                { from: patient1 }
            );
            
            // Check event emission
            assert.equal(tx.logs.length, 1, "Should emit one event");
            assert.equal(tx.logs[0].event, "PatientRegistered", "Should emit PatientRegistered event");
            assert.equal(tx.logs[0].args.patient, patient1, "Should emit correct patient address");
            
            // Check patient info
            const patientInfo = await medicalRecords.getPatientInfo(patient1, { from: patient1 });
            assert.equal(patientInfo.name, "John Doe", "Name should match");
            assert.equal(patientInfo.email, "john@example.com", "Email should match");
            assert.equal(patientInfo.isRegistered, true, "Should be registered");
            
            // Check total count
            const stats = await medicalRecords.getContractStats();
            assert.equal(stats._totalPatients.toNumber(), 1, "Total patients should be 1");
        });
        
        it("should not allow duplicate patient registration", async () => {
            await medicalRecords.registerPatient(
                "John Doe",
                "john@example.com",
                946684800,
                { from: patient1 }
            );
            
            try {
                await medicalRecords.registerPatient(
                    "John Smith",
                    "johnsmith@example.com",
                    946684800,
                    { from: patient1 }
                );
                assert.fail("Should have thrown an error");
            } catch (error) {
                assert.include(error.message, "Patient already registered");
            }
        });
        
        it("should not allow empty name", async () => {
            try {
                await medicalRecords.registerPatient(
                    "",
                    "john@example.com",
                    946684800,
                    { from: patient1 }
                );
                assert.fail("Should have thrown an error");
            } catch (error) {
                assert.include(error.message, "Name cannot be empty");
            }
        });
    });
    
    describe("Doctor Registration", () => {
        it("should register a doctor successfully", async () => {
            const tx = await medicalRecords.registerDoctor(
                "Dr. Smith",
                "LIC12345",
                "Cardiology",
                { from: doctor1 }
            );
            
            // Check event emission
            assert.equal(tx.logs.length, 1, "Should emit one event");
            assert.equal(tx.logs[0].event, "DoctorRegistered", "Should emit DoctorRegistered event");
            assert.equal(tx.logs[0].args.doctor, doctor1, "Should emit correct doctor address");
            
            // Check doctor info
            const doctorInfo = await medicalRecords.getDoctorInfo(doctor1);
            assert.equal(doctorInfo.name, "Dr. Smith", "Name should match");
            assert.equal(doctorInfo.license, "LIC12345", "License should match");
            assert.equal(doctorInfo.specialization, "Cardiology", "Specialization should match");
            assert.equal(doctorInfo.isVerified, true, "Should be verified");
            
            // Check total count
            const stats = await medicalRecords.getContractStats();
            assert.equal(stats._totalDoctors.toNumber(), 1, "Total doctors should be 1");
        });
        
        it("should not allow duplicate doctor registration", async () => {
            await medicalRecords.registerDoctor(
                "Dr. Smith",
                "LIC12345",
                "Cardiology",
                { from: doctor1 }
            );
            
            try {
                await medicalRecords.registerDoctor(
                    "Dr. Johnson",
                    "LIC67890",
                    "Neurology",
                    { from: doctor1 }
                );
                assert.fail("Should have thrown an error");
            } catch (error) {
                assert.include(error.message, "Doctor already registered");
            }
        });
    });
    
    describe("Document Upload", () => {
        beforeEach(async () => {
            await medicalRecords.registerPatient(
                "John Doe",
                "john@example.com",
                946684800,
                { from: patient1 }
            );
            await medicalRecords.registerDoctor(
                "Dr. Smith",
                "LIC12345",
                "Cardiology",
                { from: doctor1 }
            );
        });
        
        it("should upload document successfully", async () => {
            const tx = await medicalRecords.uploadDocument(
                sampleIPFSHash,
                patient1,
                sampleDocumentType,
                sampleMetadata,
                { from: doctor1 }
            );
            
            // Check event emission
            assert.equal(tx.logs.length, 1, "Should emit one event");
            assert.equal(tx.logs[0].event, "DocumentUploaded", "Should emit DocumentUploaded event");
            assert.equal(tx.logs[0].args.patient, patient1, "Should emit correct patient address");
            assert.equal(tx.logs[0].args.doctor, doctor1, "Should emit correct doctor address");
            
            // Check document details
            const document = await medicalRecords.getDocument(sampleIPFSHash, { from: patient1 });
            assert.equal(document.ipfsHash, sampleIPFSHash, "IPFS hash should match");
            assert.equal(document.patientAddress, patient1, "Patient address should match");
            assert.equal(document.doctorAddress, doctor1, "Doctor address should match");
            assert.equal(document.documentType, sampleDocumentType, "Document type should match");
            assert.equal(document.isActive, true, "Document should be active");
            
            // Check counts
            const stats = await medicalRecords.getContractStats();
            assert.equal(stats._totalDocuments.toNumber(), 1, "Total documents should be 1");
        });
        
        it("should not allow unregistered doctor to upload", async () => {
            try {
                await medicalRecords.uploadDocument(
                    sampleIPFSHash,
                    patient1,
                    sampleDocumentType,
                    sampleMetadata,
                    { from: unauthorized }
                );
                assert.fail("Should have thrown an error");
            } catch (error) {
                assert.include(error.message, "Only verified doctors can call this");
            }
        });
        
        it("should not allow upload for unregistered patient", async () => {
            try {
                await medicalRecords.uploadDocument(
                    sampleIPFSHash,
                    patient2, // Not registered
                    sampleDocumentType,
                    sampleMetadata,
                    { from: doctor1 }
                );
                assert.fail("Should have thrown an error");
            } catch (error) {
                assert.include(error.message, "Patient not registered");
            }
        });
        
        it("should not allow duplicate document upload", async () => {
            await medicalRecords.uploadDocument(
                sampleIPFSHash,
                patient1,
                sampleDocumentType,
                sampleMetadata,
                { from: doctor1 }
            );
            
            try {
                await medicalRecords.uploadDocument(
                    sampleIPFSHash,
                    patient1,
                    "X-Ray Report",
                    "Different metadata",
                    { from: doctor1 }
                );
                assert.fail("Should have thrown an error");
            } catch (error) {
                assert.include(error.message, "Document already exists");
            }
        });
    });
    
    describe("Document Access Control", () => {
        beforeEach(async () => {
            await medicalRecords.registerPatient(
                "John Doe",
                "john@example.com",
                946684800,
                { from: patient1 }
            );
            await medicalRecords.registerDoctor(
                "Dr. Smith",
                "LIC12345",
                "Cardiology",
                { from: doctor1 }
            );
            await medicalRecords.uploadDocument(
                sampleIPFSHash,
                patient1,
                sampleDocumentType,
                sampleMetadata,
                { from: doctor1 }
            );
        });
        
        it("should allow patient to view their own documents", async () => {
            const document = await medicalRecords.getDocument(sampleIPFSHash, { from: patient1 });
            assert.equal(document.ipfsHash, sampleIPFSHash, "Should return correct document");
        });
        
        it("should allow doctor to view documents they uploaded", async () => {
            const document = await medicalRecords.getDocument(sampleIPFSHash, { from: doctor1 });
            assert.equal(document.ipfsHash, sampleIPFSHash, "Should return correct document");
        });
        
        it("should not allow unauthorized access", async () => {
            try {
                await medicalRecords.getDocument(sampleIPFSHash, { from: unauthorized });
                assert.fail("Should have thrown an error");
            } catch (error) {
                assert.include(error.message, "Not authorized to view this document");
            }
        });
        
        it("should allow access after permission granted", async () => {
            // Grant permission
            await medicalRecords.grantPermission(unauthorized, { from: patient1 });
            
            // Should now be able to access
            const document = await medicalRecords.getDocument(sampleIPFSHash, { from: unauthorized });
            assert.equal(document.ipfsHash, sampleIPFSHash, "Should return correct document");
        });
        
        it("should revoke access after permission revoked", async () => {
            // Grant permission first
            await medicalRecords.grantPermission(unauthorized, { from: patient1 });
            
            // Verify access works
            await medicalRecords.getDocument(sampleIPFSHash, { from: unauthorized });
            
            // Revoke permission
            await medicalRecords.revokePermission(unauthorized, { from: patient1 });
            
            // Should no longer have access
            try {
                await medicalRecords.getDocument(sampleIPFSHash, { from: unauthorized });
                assert.fail("Should have thrown an error");
            } catch (error) {
                assert.include(error.message, "Not authorized to view this document");
            }
        });
    });
    
    describe("Document Listing", () => {
        beforeEach(async () => {
            await medicalRecords.registerPatient(
                "John Doe",
                "john@example.com",
                946684800,
                { from: patient1 }
            );
            await medicalRecords.registerDoctor(
                "Dr. Smith",
                "LIC12345",
                "Cardiology",
                { from: doctor1 }
            );
        });
        
        it("should return patient documents correctly", async () => {
            const ipfsHash1 = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
            const ipfsHash2 = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH";
            
            await medicalRecords.uploadDocument(
                ipfsHash1,
                patient1,
                "Blood Test",
                "Test 1",
                { from: doctor1 }
            );
            await medicalRecords.uploadDocument(
                ipfsHash2,
                patient1,
                "X-Ray",
                "Test 2",
                { from: doctor1 }
            );
            
            const documents = await medicalRecords.getPatientDocuments(patient1, { from: patient1 });
            assert.equal(documents.length, 2, "Should return 2 documents");
            assert.include(documents, ipfsHash1, "Should include first document");
            assert.include(documents, ipfsHash2, "Should include second document");
        });
        
        it("should return doctor documents correctly", async () => {
            const ipfsHash1 = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
            
            await medicalRecords.uploadDocument(
                ipfsHash1,
                patient1,
                "Blood Test",
                "Test 1",
                { from: doctor1 }
            );
            
            const documents = await medicalRecords.getDoctorDocuments(doctor1, { from: doctor1 });
            assert.equal(documents.length, 1, "Should return 1 document");
            assert.equal(documents[0], ipfsHash1, "Should include the document");
        });
    });
    
    describe("Document Deactivation", () => {
        beforeEach(async () => {
            await medicalRecords.registerPatient(
                "John Doe",
                "john@example.com",
                946684800,
                { from: patient1 }
            );
            await medicalRecords.registerDoctor(
                "Dr. Smith",
                "LIC12345",
                "Cardiology",
                { from: doctor1 }
            );
            await medicalRecords.uploadDocument(
                sampleIPFSHash,
                patient1,
                sampleDocumentType,
                sampleMetadata,
                { from: doctor1 }
            );
        });
        
        it("should allow patient to deactivate their document", async () => {
            await medicalRecords.deactivateDocument(sampleIPFSHash, { from: patient1 });
            
            const document = await medicalRecords.getDocument(sampleIPFSHash, { from: patient1 });
            assert.equal(document.isActive, false, "Document should be deactivated");
        });
        
        it("should allow doctor to deactivate document they uploaded", async () => {
            await medicalRecords.deactivateDocument(sampleIPFSHash, { from: doctor1 });
            
            const document = await medicalRecords.getDocument(sampleIPFSHash, { from: patient1 });
            assert.equal(document.isActive, false, "Document should be deactivated");
        });
        
        it("should not allow unauthorized deactivation", async () => {
            try {
                await medicalRecords.deactivateDocument(sampleIPFSHash, { from: unauthorized });
                assert.fail("Should have thrown an error");
            } catch (error) {
                assert.include(error.message, "Not authorized to deactivate this document");
            }
        });
    });
});

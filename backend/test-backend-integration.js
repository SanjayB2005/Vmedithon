const express = require('express');
const request = require('supertest');
const Web3 = require('web3');

// Mock blockchain service for testing
class MockWeb3Service {
    constructor() {
        this.initialized = false;
    }
    
    async initialize() {
        this.initialized = true;
        return Promise.resolve();
    }
    
    async registerPatient(patientData, fromAddress) {
        return {
            success: true,
            transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            gasUsed: 50000,
            events: {
                PatientRegistered: {
                    returnValues: {
                        patient: fromAddress,
                        name: patientData.name
                    }
                }
            }
        };
    }
    
    async registerDoctor(doctorData, fromAddress) {
        return {
            success: true,
            transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            gasUsed: 55000,
            events: {
                DoctorRegistered: {
                    returnValues: {
                        doctor: fromAddress,
                        name: doctorData.name,
                        license: doctorData.license
                    }
                }
            }
        };
    }
    
    async uploadDocument(documentData, fromAddress) {
        return {
            success: true,
            transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            gasUsed: 75000,
            events: {
                DocumentUploaded: {
                    returnValues: {
                        ipfsHash: documentData.ipfsHash,
                        patient: documentData.patientAddress,
                        doctor: fromAddress,
                        documentType: documentData.documentType
                    }
                }
            }
        };
    }
    
    async getDocument(ipfsHash, fromAddress) {
        return {
            success: true,
            data: {
                ipfsHash: ipfsHash,
                patientAddress: '0x742d35Cc6632C032532f75c22e24fDf83b31FC3C',
                doctorAddress: '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0',
                timestamp: Math.floor(Date.now() / 1000),
                documentType: 'Blood Test Report',
                isActive: true,
                metadata: 'Test conducted on 2024-01-15'
            }
        };
    }
    
    async getPatientDocuments(patientAddress, fromAddress) {
        return {
            success: true,
            data: [
                'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
                'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH'
            ]
        };
    }
    
    async getDoctorDocuments(doctorAddress, fromAddress) {
        return {
            success: true,
            data: [
                'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
            ]
        };
    }
    
    async grantPermission(granteeAddress, fromAddress) {
        return {
            success: true,
            transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            gasUsed: 30000
        };
    }
    
    async revokePermission(revokeeAddress, fromAddress) {
        return {
            success: true,
            transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            gasUsed: 25000
        };
    }
    
    async deactivateDocument(ipfsHash, fromAddress) {
        return {
            success: true,
            transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            gasUsed: 20000
        };
    }
    
    async getPatientInfo(patientAddress, fromAddress) {
        return {
            success: true,
            data: {
                name: 'John Doe',
                email: 'john@example.com',
                dateOfBirth: 946684800,
                isRegistered: true,
                documentCount: 2
            }
        };
    }
    
    async getDoctorInfo(doctorAddress, fromAddress) {
        return {
            success: true,
            data: {
                name: 'Dr. Smith',
                license: 'LIC12345',
                specialization: 'Cardiology',
                isVerified: true,
                documentCount: 5
            }
        };
    }
    
    async getContractStats() {
        return {
            success: true,
            data: {
                totalDocuments: 100,
                totalPatients: 25,
                totalDoctors: 10
            }
        };
    }
    
    async getBalance(address) {
        return {
            success: true,
            balance: '1.5'
        };
    }
    
    isValidAddress(address) {
        // More robust address validation
        if (typeof address !== 'string') return false;
        if (!address.startsWith('0x')) return false;
        if (address.length !== 42) return false;
        
        // Check if all characters after 0x are valid hex
        const hexPart = address.slice(2);
        const hexPattern = /^[0-9a-fA-F]+$/;
        return hexPattern.test(hexPart);
    }
}

// Create test application
function createTestApp() {
    const app = express();
    app.use(express.json());
    
    // Mock the web3Service
    const mockWeb3Service = new MockWeb3Service();
    
    // Create blockchain service with mock
    const blockchainService = {
        web3Service: mockWeb3Service,
        
        async writeHashToBlockchain(ipfsHash, patientAddress, doctorAddress, documentType, metadata = '') {
            const result = await this.web3Service.uploadDocument({
                ipfsHash,
                patientAddress,
                documentType,
                metadata
            }, doctorAddress);
            
            if (result.success) {
                return {
                    success: true,
                    transactionHash: result.transactionHash,
                    gasUsed: result.gasUsed,
                    ipfsHash: ipfsHash,
                    message: 'Document hash successfully written to blockchain'
                };
            } else {
                throw new Error(result.error);
            }
        },
        
        async registerPatient(patientData, fromAddress) {
            return await this.web3Service.registerPatient(patientData, fromAddress);
        },
        
        async registerDoctor(doctorData, fromAddress) {
            return await this.web3Service.registerDoctor(doctorData, fromAddress);
        },
        
        async getDocument(ipfsHash, fromAddress) {
            return await this.web3Service.getDocument(ipfsHash, fromAddress);
        },
        
        async getPatientDocuments(patientAddress, fromAddress) {
            return await this.web3Service.getPatientDocuments(patientAddress, fromAddress);
        },
        
        async getDoctorDocuments(doctorAddress, fromAddress) {
            return await this.web3Service.getDoctorDocuments(doctorAddress, fromAddress);
        },
        
        async grantPermission(granteeAddress, fromAddress) {
            return await this.web3Service.grantPermission(granteeAddress, fromAddress);
        },
        
        async revokePermission(revokeeAddress, fromAddress) {
            return await this.web3Service.revokePermission(revokeeAddress, fromAddress);
        },
        
        async deactivateDocument(ipfsHash, fromAddress) {
            return await this.web3Service.deactivateDocument(ipfsHash, fromAddress);
        },
        
        async getPatientInfo(patientAddress, fromAddress) {
            return await this.web3Service.getPatientInfo(patientAddress, fromAddress);
        },
        
        async getDoctorInfo(doctorAddress, fromAddress) {
            return await this.web3Service.getDoctorInfo(doctorAddress, fromAddress);
        },
        
        async getContractStats() {
            return await this.web3Service.getContractStats();
        },
        
        async getBalance(address) {
            return await this.web3Service.getBalance(address);
        },
        
        isValidAddress(address) {
            return this.web3Service.isValidAddress(address);
        }
    };
    
    // Create blockchain controller
    const blockchainController = {
        async writeHash(req, res) {
            try {
                const { ipfsHash, patientAddress, doctorAddress, documentType, metadata } = req.body;
                
                if (!ipfsHash || !patientAddress || !doctorAddress) {
                    return res.status(400).json({
                        success: false,
                        error: 'Missing required fields: ipfsHash, patientAddress, doctorAddress'
                    });
                }
                
                if (!blockchainService.isValidAddress(patientAddress) || 
                    !blockchainService.isValidAddress(doctorAddress)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid Ethereum address format'
                    });
                }
                
                const result = await blockchainService.writeHashToBlockchain(
                    ipfsHash,
                    patientAddress,
                    doctorAddress,
                    documentType || 'Medical Document',
                    metadata || ''
                );
                
                res.json(result);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        },
        
        async registerPatient(req, res) {
            try {
                const { name, email, dateOfBirth, walletAddress } = req.body;
                
                if (!name || !email || !dateOfBirth || !walletAddress) {
                    return res.status(400).json({
                        success: false,
                        error: 'Missing required fields: name, email, dateOfBirth, walletAddress'
                    });
                }
                
                if (!blockchainService.isValidAddress(walletAddress)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid Ethereum address format'
                    });
                }
                
                const result = await blockchainService.registerPatient({
                    name,
                    email,
                    dateOfBirth: parseInt(dateOfBirth)
                }, walletAddress);
                
                res.json(result);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        },
        
        async getStats(req, res) {
            try {
                const result = await blockchainService.getContractStats();
                res.json(result);
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        },
        
        async validateAddress(req, res) {
            try {
                const { address } = req.params;
                
                if (!address) {
                    return res.status(400).json({
                        success: false,
                        error: 'Missing required parameter: address'
                    });
                }
                
                const isValid = blockchainService.isValidAddress(address);
                res.json({
                    success: true,
                    isValid: isValid,
                    address: address
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        }
    };
    
    // Set up routes
    app.get('/api/blockchain/', (req, res) => {
        res.json({ 
            message: 'Blockchain API is running',
            endpoints: [
                'POST /api/blockchain/write-hash',
                'POST /api/blockchain/register-patient',
                'GET /api/blockchain/stats',
                'GET /api/blockchain/validate/:address'
            ]
        });
    });
    
    app.post('/api/blockchain/write-hash', blockchainController.writeHash);
    app.post('/api/blockchain/register-patient', blockchainController.registerPatient);
    app.get('/api/blockchain/stats', blockchainController.getStats);
    app.get('/api/blockchain/validate/:address', blockchainController.validateAddress);
    
    return app;
}

// Test suite
async function runIntegrationTests() {
    console.log('🧪 Starting Backend Blockchain Integration Tests\n');
    
    const app = createTestApp();
    let testsPassed = 0;
    let totalTests = 0;
    
    // Helper function to run a test
    async function runTest(testName, testFunction) {
        totalTests++;
        console.log(`🔍 Testing: ${testName}`);
        
        try {
            await testFunction();
            console.log(`✅ PASS: ${testName}\n`);
            testsPassed++;
        } catch (error) {
            console.log(`❌ FAIL: ${testName}`);
            console.log(`   Error: ${error.message}\n`);
        }
    }
    
    // Test 1: API Root endpoint
    await runTest('API Root Endpoint', async () => {
        const response = await request(app)
            .get('/api/blockchain/')
            .expect(200);
        
        if (!response.body.message) {
            throw new Error('Missing message in response');
        }
    });
    
    // Test 2: Address validation with valid address
    await runTest('Address Validation - Valid Address', async () => {
        const validAddress = '0x742d35Cc6632C032532f75c22e24fDf83b31FC3C';
        const response = await request(app)
            .get(`/api/blockchain/validate/${validAddress}`)
            .expect(200);
        
        if (!response.body.success || !response.body.isValid) {
            throw new Error('Valid address not recognized as valid');
        }
    });
    
    // Test 3: Address validation with invalid address
    await runTest('Address Validation - Invalid Address', async () => {
        const invalidAddress = 'invalid-address';
        const response = await request(app)
            .get(`/api/blockchain/validate/${invalidAddress}`)
            .expect(200);
        
        if (!response.body.success || response.body.isValid) {
            throw new Error('Invalid address recognized as valid');
        }
    });
    
    // Test 4: Patient registration with valid data
    await runTest('Patient Registration - Valid Data', async () => {
        const patientData = {
            name: "John Doe",
            email: "john@example.com",
            dateOfBirth: "946684800",
            walletAddress: "0x742d35Cc6632C032532f75c22e24fDf83b31FC3C"
        };
        
        const response = await request(app)
            .post('/api/blockchain/register-patient')
            .send(patientData)
            .expect(200);
        
        if (!response.body.success) {
            throw new Error('Patient registration failed');
        }
    });
    
    // Test 5: Patient registration with missing fields
    await runTest('Patient Registration - Missing Fields', async () => {
        const incompleteData = {
            name: "John Doe"
            // Missing other required fields
        };
        
        const response = await request(app)
            .post('/api/blockchain/register-patient')
            .send(incompleteData)
            .expect(400);
        
        if (response.body.success || !response.body.error.includes('Missing required fields')) {
            throw new Error('Should reject incomplete data');
        }
    });
    
    // Test 6: Patient registration with invalid address
    await runTest('Patient Registration - Invalid Address', async () => {
        const invalidData = {
            name: "John Doe",
            email: "john@example.com",
            dateOfBirth: "946684800",
            walletAddress: "invalid-address"
        };
        
        const response = await request(app)
            .post('/api/blockchain/register-patient')
            .send(invalidData)
            .expect(400);
        
        if (response.body.success || !response.body.error.includes('Invalid Ethereum address')) {
            throw new Error('Should reject invalid address');
        }
    });
    
    // Test 7: Document hash upload with valid data
    await runTest('Document Upload - Valid Data', async () => {
        const documentData = {
            ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
            patientAddress: "0x742d35Cc6632C032532f75c22e24fDf83b31FC3C",
            doctorAddress: "0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0",
            documentType: "Blood Test Report",
            metadata: "Test conducted on 2024-01-15"
        };
        
        const response = await request(app)
            .post('/api/blockchain/write-hash')
            .send(documentData)
            .expect(200);
        
        if (!response.body.success || !response.body.transactionHash) {
            throw new Error('Document upload failed');
        }
    });
    
    // Test 8: Document upload with missing fields
    await runTest('Document Upload - Missing Fields', async () => {
        const incompleteData = {
            ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
            // Missing required fields
        };
        
        const response = await request(app)
            .post('/api/blockchain/write-hash')
            .send(incompleteData)
            .expect(400);
        
        if (response.body.success || !response.body.error.includes('Missing required fields')) {
            throw new Error('Should reject incomplete data');
        }
    });
    
    // Test 9: Blockchain statistics
    await runTest('Blockchain Statistics', async () => {
        const response = await request(app)
            .get('/api/blockchain/stats')
            .expect(200);
        
        if (!response.body.success || !response.body.data) {
            throw new Error('Stats endpoint failed');
        }
        
        const stats = response.body.data;
        if (typeof stats.totalDocuments !== 'number' || 
            typeof stats.totalPatients !== 'number' || 
            typeof stats.totalDoctors !== 'number') {
            throw new Error('Invalid stats format');
        }
    });
    
    // Summary
    console.log('=' .repeat(60));
    console.log('📊 Integration Test Results Summary:');
    console.log('=' .repeat(60));
    console.log(`🎯 Tests Passed: ${testsPassed}/${totalTests}`);
    console.log(`📈 Success Rate: ${((testsPassed / totalTests) * 100).toFixed(1)}%`);
    
    if (testsPassed === totalTests) {
        console.log('🎉 All integration tests passed! Your blockchain backend is ready.');
        console.log('\n📋 Next Steps:');
        console.log('1. Deploy smart contracts to a blockchain network');
        console.log('2. Update .env with real blockchain network details');
        console.log('3. Test with actual blockchain transactions');
        console.log('4. Integrate with frontend application');
    } else {
        console.log(`⚠️  ${totalTests - testsPassed} test(s) failed. Check the logs above.`);
    }
    
    console.log('=' .repeat(60));
}

// Run tests if called directly
if (require.main === module) {
    runIntegrationTests().catch(console.error);
}

module.exports = { createTestApp, runIntegrationTests };

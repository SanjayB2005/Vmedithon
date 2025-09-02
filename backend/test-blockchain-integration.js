const request = require('supertest');
const express = require('express');
const blockchainRoutes = require('../routes/blockchainRoutes');

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/blockchain', blockchainRoutes);

describe('Blockchain API Integration Tests', () => {
    
    // Test data
    const testPatient = {
        name: "John Doe",
        email: "john@example.com",
        dateOfBirth: "946684800", // Jan 1, 2000
        walletAddress: "0x742d35Cc6632C032532f75c22e24fDf83b31FC3C" // Example address
    };
    
    const testDoctor = {
        name: "Dr. Smith",
        license: "LIC12345",
        specialization: "Cardiology",
        walletAddress: "0x8ba1f109551bD432803012645Hac136c9c1634d" // Example address
    };
    
    const testDocument = {
        ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
        patientAddress: "0x742d35Cc6632C032532f75c22e24fDf83b31FC3C",
        doctorAddress: "0x8ba1f109551bD432803012645Hac136c9c1634d",
        documentType: "Blood Test Report",
        metadata: "Test conducted on 2024-01-15"
    };
    
    describe('GET /api/blockchain/', () => {
        it('should return HTML documentation', async () => {
            const response = await request(app)
                .get('/api/blockchain/')
                .expect(200);
                
            expect(response.text).toContain('Blockchain API Routes');
            expect(response.text).toContain('Medical Records Smart Contract');
        });
    });
    
    describe('Address Validation', () => {
        it('should validate correct Ethereum address', async () => {
            const response = await request(app)
                .get('/api/blockchain/validate/0x742d35Cc6632C032532f75c22e24fDf83b31FC3C')
                .expect(200);
                
            expect(response.body.success).toBe(true);
            expect(response.body.isValid).toBe(true);
        });
        
        it('should reject invalid Ethereum address', async () => {
            const response = await request(app)
                .get('/api/blockchain/validate/invalid-address')
                .expect(200);
                
            expect(response.body.success).toBe(true);
            expect(response.body.isValid).toBe(false);
        });
    });
    
    describe('Patient Registration', () => {
        it('should register a patient successfully', async () => {
            const response = await request(app)
                .post('/api/blockchain/register-patient')
                .send(testPatient)
                .expect(200);
                
            expect(response.body.success).toBeDefined();
            // Note: Actual blockchain interaction will depend on network availability
        });
        
        it('should reject registration with missing fields', async () => {
            const response = await request(app)
                .post('/api/blockchain/register-patient')
                .send({
                    name: "John Doe"
                    // Missing other required fields
                })
                .expect(400);
                
            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Missing required fields');
        });
        
        it('should reject registration with invalid address', async () => {
            const response = await request(app)
                .post('/api/blockchain/register-patient')
                .send({
                    ...testPatient,
                    walletAddress: "invalid-address"
                })
                .expect(400);
                
            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Invalid Ethereum address');
        });
    });
    
    describe('Doctor Registration', () => {
        it('should register a doctor successfully', async () => {
            const response = await request(app)
                .post('/api/blockchain/register-doctor')
                .send(testDoctor)
                .expect(200);
                
            expect(response.body.success).toBeDefined();
        });
        
        it('should reject registration with missing fields', async () => {
            const response = await request(app)
                .post('/api/blockchain/register-doctor')
                .send({
                    name: "Dr. Smith"
                    // Missing other required fields
                })
                .expect(400);
                
            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Missing required fields');
        });
    });
    
    describe('Document Upload', () => {
        it('should upload document hash successfully', async () => {
            const response = await request(app)
                .post('/api/blockchain/write-hash')
                .send(testDocument)
                .expect(200);
                
            expect(response.body.success).toBeDefined();
        });
        
        it('should reject upload with missing fields', async () => {
            const response = await request(app)
                .post('/api/blockchain/write-hash')
                .send({
                    ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
                    // Missing other required fields
                })
                .expect(400);
                
            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Missing required fields');
        });
        
        it('should reject upload with invalid addresses', async () => {
            const response = await request(app)
                .post('/api/blockchain/write-hash')
                .send({
                    ...testDocument,
                    patientAddress: "invalid-address"
                })
                .expect(400);
                
            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Invalid Ethereum address');
        });
    });
    
    describe('Document Retrieval', () => {
        it('should get document by IPFS hash', async () => {
            const response = await request(app)
                .get(`/api/blockchain/document/${testDocument.ipfsHash}`)
                .query({ walletAddress: testDocument.patientAddress })
                .expect(200);
                
            expect(response.body.success).toBeDefined();
        });
        
        it('should reject without wallet address', async () => {
            const response = await request(app)
                .get(`/api/blockchain/document/${testDocument.ipfsHash}`)
                .expect(400);
                
            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Missing required parameters');
        });
    });
    
    describe('Permission Management', () => {
        const permissionData = {
            granteeAddress: "0x1234567890123456789012345678901234567890",
            walletAddress: testPatient.walletAddress
        };
        
        it('should grant permission successfully', async () => {
            const response = await request(app)
                .post('/api/blockchain/grant-permission')
                .send(permissionData)
                .expect(200);
                
            expect(response.body.success).toBeDefined();
        });
        
        it('should revoke permission successfully', async () => {
            const response = await request(app)
                .post('/api/blockchain/revoke-permission')
                .send({
                    revokeeAddress: permissionData.granteeAddress,
                    walletAddress: permissionData.walletAddress
                })
                .expect(200);
                
            expect(response.body.success).toBeDefined();
        });
    });
    
    describe('Statistics and Utility', () => {
        it('should get blockchain statistics', async () => {
            const response = await request(app)
                .get('/api/blockchain/stats')
                .expect(200);
                
            expect(response.body.success).toBeDefined();
        });
        
        it('should get wallet balance', async () => {
            const response = await request(app)
                .get(`/api/blockchain/balance/${testPatient.walletAddress}`)
                .expect(200);
                
            expect(response.body.success).toBeDefined();
        });
        
        it('should reject balance request for invalid address', async () => {
            const response = await request(app)
                .get('/api/blockchain/balance/invalid-address')
                .expect(400);
                
            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Invalid Ethereum address');
        });
    });
    
    describe('Document Lists', () => {
        it('should get patient documents', async () => {
            const response = await request(app)
                .get(`/api/blockchain/patient/${testPatient.walletAddress}/documents`)
                .query({ walletAddress: testPatient.walletAddress })
                .expect(200);
                
            expect(response.body.success).toBeDefined();
        });
        
        it('should get doctor documents', async () => {
            const response = await request(app)
                .get(`/api/blockchain/doctor/${testDoctor.walletAddress}/documents`)
                .query({ walletAddress: testDoctor.walletAddress })
                .expect(200);
                
            expect(response.body.success).toBeDefined();
        });
    });
});

module.exports = app;

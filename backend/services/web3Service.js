const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const MedicalRecordsArtifact = require('../blockchain/build/contracts/MedicalRecords.json');
require('dotenv').config();

class Web3Service {
    constructor() {
        this.web3 = null;
        this.contract = null;
        this.accounts = [];
        this.initialized = false;
    }
    
    async initialize() {
        try {
            if (this.initialized) return;
            
            // Initialize Web3
            if (process.env.NODE_ENV === 'development') {
                // Local development with Ganache
                this.web3 = new Web3('http://localhost:7545');
            } else {
                // Use HDWallet provider for testnet/mainnet
                const provider = new HDWalletProvider(
                    process.env.MNEMONIC,
                    process.env.ETHEREUM_RPC_URL || `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
                );
                this.web3 = new Web3(provider);
            }
            
            // Get accounts
            this.accounts = await this.web3.eth.getAccounts();
            
            // Load contract
            const networkId = await this.web3.eth.net.getId();
            let contractAddress;
            
            if (MedicalRecordsArtifact.networks[networkId]) {
                contractAddress = MedicalRecordsArtifact.networks[networkId].address;
            } else if (process.env.MEDICAL_RECORDS_CONTRACT_ADDRESS) {
                contractAddress = process.env.MEDICAL_RECORDS_CONTRACT_ADDRESS;
            } else {
                throw new Error('Contract not deployed to current network');
            }
            
            this.contract = new this.web3.eth.Contract(
                MedicalRecordsArtifact.abi,
                contractAddress
            );
            
            this.initialized = true;
            console.log('✅ Web3Service initialized successfully');
            console.log('Network ID:', networkId);
            console.log('Contract Address:', contractAddress);
            
        } catch (error) {
            console.error('❌ Web3Service initialization failed:', error);
            throw error;
        }
    }
    
    async registerPatient(patientData, fromAddress) {
        await this.initialize();
        
        try {
            const { name, email, dateOfBirth } = patientData;
            
            const tx = await this.contract.methods
                .registerPatient(name, email, dateOfBirth)
                .send({ from: fromAddress });
                
            return {
                success: true,
                transactionHash: tx.transactionHash,
                gasUsed: tx.gasUsed,
                events: tx.events
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async registerDoctor(doctorData, fromAddress) {
        await this.initialize();
        
        try {
            const { name, license, specialization } = doctorData;
            
            const tx = await this.contract.methods
                .registerDoctor(name, license, specialization)
                .send({ from: fromAddress });
                
            return {
                success: true,
                transactionHash: tx.transactionHash,
                gasUsed: tx.gasUsed,
                events: tx.events
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async uploadDocument(documentData, fromAddress) {
        await this.initialize();
        
        try {
            const { ipfsHash, patientAddress, documentType, metadata } = documentData;
            
            const tx = await this.contract.methods
                .uploadDocument(ipfsHash, patientAddress, documentType, metadata)
                .send({ from: fromAddress });
                
            return {
                success: true,
                transactionHash: tx.transactionHash,
                gasUsed: tx.gasUsed,
                events: tx.events
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async getDocument(ipfsHash, fromAddress) {
        await this.initialize();
        
        try {
            const document = await this.contract.methods
                .getDocument(ipfsHash)
                .call({ from: fromAddress });
                
            return {
                success: true,
                data: {
                    ipfsHash: document.ipfsHash,
                    patientAddress: document.patientAddress,
                    doctorAddress: document.doctorAddress,
                    timestamp: parseInt(document.timestamp),
                    documentType: document.documentType,
                    isActive: document.isActive,
                    metadata: document.metadata
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async getPatientDocuments(patientAddress, fromAddress) {
        await this.initialize();
        
        try {
            const documents = await this.contract.methods
                .getPatientDocuments(patientAddress)
                .call({ from: fromAddress });
                
            return {
                success: true,
                data: documents
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async getDoctorDocuments(doctorAddress, fromAddress) {
        await this.initialize();
        
        try {
            const documents = await this.contract.methods
                .getDoctorDocuments(doctorAddress)
                .call({ from: fromAddress });
                
            return {
                success: true,
                data: documents
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async getPatientInfo(patientAddress, fromAddress) {
        await this.initialize();
        
        try {
            const patientInfo = await this.contract.methods
                .getPatientInfo(patientAddress)
                .call({ from: fromAddress });
                
            return {
                success: true,
                data: {
                    name: patientInfo.name,
                    email: patientInfo.email,
                    dateOfBirth: parseInt(patientInfo.dateOfBirth),
                    isRegistered: patientInfo.isRegistered,
                    documentCount: parseInt(patientInfo.documentCount)
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async getDoctorInfo(doctorAddress, fromAddress) {
        await this.initialize();
        
        try {
            const doctorInfo = await this.contract.methods
                .getDoctorInfo(doctorAddress)
                .call({ from: fromAddress });
                
            return {
                success: true,
                data: {
                    name: doctorInfo.name,
                    license: doctorInfo.license,
                    specialization: doctorInfo.specialization,
                    isVerified: doctorInfo.isVerified,
                    documentCount: parseInt(doctorInfo.documentCount)
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async grantPermission(granteeAddress, fromAddress) {
        await this.initialize();
        
        try {
            const tx = await this.contract.methods
                .grantPermission(granteeAddress)
                .send({ from: fromAddress });
                
            return {
                success: true,
                transactionHash: tx.transactionHash,
                gasUsed: tx.gasUsed
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async revokePermission(revokeeAddress, fromAddress) {
        await this.initialize();
        
        try {
            const tx = await this.contract.methods
                .revokePermission(revokeeAddress)
                .send({ from: fromAddress });
                
            return {
                success: true,
                transactionHash: tx.transactionHash,
                gasUsed: tx.gasUsed
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async deactivateDocument(ipfsHash, fromAddress) {
        await this.initialize();
        
        try {
            const tx = await this.contract.methods
                .deactivateDocument(ipfsHash)
                .send({ from: fromAddress });
                
            return {
                success: true,
                transactionHash: tx.transactionHash,
                gasUsed: tx.gasUsed
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async getContractStats() {
        await this.initialize();
        
        try {
            const stats = await this.contract.methods
                .getContractStats()
                .call();
                
            return {
                success: true,
                data: {
                    totalDocuments: parseInt(stats._totalDocuments),
                    totalPatients: parseInt(stats._totalPatients),
                    totalDoctors: parseInt(stats._totalDoctors)
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async getBalance(address) {
        await this.initialize();
        
        try {
            const balance = await this.web3.eth.getBalance(address);
            return {
                success: true,
                balance: this.web3.utils.fromWei(balance, 'ether')
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    isValidAddress(address) {
        return this.web3 ? this.web3.utils.isAddress(address) : false;
    }
    
    async estimateGas(method, fromAddress) {
        await this.initialize();
        
        try {
            const gas = await method.estimateGas({ from: fromAddress });
            return {
                success: true,
                gas: gas
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new Web3Service();

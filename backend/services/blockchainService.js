// Enhanced blockchain service using Web3 and smart contracts
const web3Service = require('./web3Service');
const axios = require('axios');
const blockchainConfig = require('../config/blockchain');

class BlockchainService {
    constructor() {
        this.web3Service = web3Service;
    }
    
    /**
     * Write IPFS hash to blockchain smart contract
     * @param {string} ipfsHash - IPFS hash of the document
     * @param {string} patientAddress - Patient's wallet address
     * @param {string} doctorAddress - Doctor's wallet address
     * @param {string} documentType - Type of medical document
     * @param {string} metadata - Additional metadata
     */
    async writeHashToBlockchain(ipfsHash, patientAddress, doctorAddress, documentType, metadata = '') {
        try {
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
        } catch (error) {
            console.error('Error writing hash to blockchain:', error);
            
            // Fallback to legacy API if Web3 fails
            if (blockchainConfig.BLOCKCHAIN_API_URL) {
                return await this.fallbackWriteHash(ipfsHash);
            }
            
            throw new Error(`Failed to write hash to blockchain: ${error.message}`);
        }
    }
    
    /**
     * Fallback method using legacy blockchain API
     */
    async fallbackWriteHash(ipfsHash) {
        try {
            const response = await axios.post(blockchainConfig.BLOCKCHAIN_API_URL, { ipfsHash });
            return response.data;
        } catch (error) {
            throw new Error(`Fallback blockchain API failed: ${error.message}`);
        }
    }
    
    /**
     * Register a patient on the blockchain
     */
    async registerPatient(patientData, fromAddress) {
        try {
            return await this.web3Service.registerPatient(patientData, fromAddress);
        } catch (error) {
            console.error('Error registering patient:', error);
            throw new Error(`Failed to register patient: ${error.message}`);
        }
    }
    
    /**
     * Register a doctor on the blockchain
     */
    async registerDoctor(doctorData, fromAddress) {
        try {
            return await this.web3Service.registerDoctor(doctorData, fromAddress);
        } catch (error) {
            console.error('Error registering doctor:', error);
            throw new Error(`Failed to register doctor: ${error.message}`);
        }
    }
    
    /**
     * Get document from blockchain
     */
    async getDocument(ipfsHash, fromAddress) {
        try {
            return await this.web3Service.getDocument(ipfsHash, fromAddress);
        } catch (error) {
            console.error('Error getting document:', error);
            throw new Error(`Failed to get document: ${error.message}`);
        }
    }
    
    /**
     * Get all documents for a patient
     */
    async getPatientDocuments(patientAddress, fromAddress) {
        try {
            return await this.web3Service.getPatientDocuments(patientAddress, fromAddress);
        } catch (error) {
            console.error('Error getting patient documents:', error);
            throw new Error(`Failed to get patient documents: ${error.message}`);
        }
    }
    
    /**
     * Get all documents uploaded by a doctor
     */
    async getDoctorDocuments(doctorAddress, fromAddress) {
        try {
            return await this.web3Service.getDoctorDocuments(doctorAddress, fromAddress);
        } catch (error) {
            console.error('Error getting doctor documents:', error);
            throw new Error(`Failed to get doctor documents: ${error.message}`);
        }
    }
    
    /**
     * Grant permission to access documents
     */
    async grantPermission(granteeAddress, fromAddress) {
        try {
            return await this.web3Service.grantPermission(granteeAddress, fromAddress);
        } catch (error) {
            console.error('Error granting permission:', error);
            throw new Error(`Failed to grant permission: ${error.message}`);
        }
    }
    
    /**
     * Revoke permission to access documents
     */
    async revokePermission(revokeeAddress, fromAddress) {
        try {
            return await this.web3Service.revokePermission(revokeeAddress, fromAddress);
        } catch (error) {
            console.error('Error revoking permission:', error);
            throw new Error(`Failed to revoke permission: ${error.message}`);
        }
    }
    
    /**
     * Deactivate a document
     */
    async deactivateDocument(ipfsHash, fromAddress) {
        try {
            return await this.web3Service.deactivateDocument(ipfsHash, fromAddress);
        } catch (error) {
            console.error('Error deactivating document:', error);
            throw new Error(`Failed to deactivate document: ${error.message}`);
        }
    }
    
    /**
     * Get patient information from blockchain
     */
    async getPatientInfo(patientAddress, fromAddress) {
        try {
            return await this.web3Service.getPatientInfo(patientAddress, fromAddress);
        } catch (error) {
            console.error('Error getting patient info:', error);
            throw new Error(`Failed to get patient info: ${error.message}`);
        }
    }
    
    /**
     * Get doctor information from blockchain
     */
    async getDoctorInfo(doctorAddress, fromAddress) {
        try {
            return await this.web3Service.getDoctorInfo(doctorAddress, fromAddress);
        } catch (error) {
            console.error('Error getting doctor info:', error);
            throw new Error(`Failed to get doctor info: ${error.message}`);
        }
    }
    
    /**
     * Get blockchain statistics
     */
    async getContractStats() {
        try {
            return await this.web3Service.getContractStats();
        } catch (error) {
            console.error('Error getting contract stats:', error);
            throw new Error(`Failed to get contract stats: ${error.message}`);
        }
    }
    
    /**
     * Get wallet balance
     */
    async getBalance(address) {
        try {
            return await this.web3Service.getBalance(address);
        } catch (error) {
            console.error('Error getting balance:', error);
            throw new Error(`Failed to get balance: ${error.message}`);
        }
    }
    
    /**
     * Validate Ethereum address
     */
    isValidAddress(address) {
        return this.web3Service.isValidAddress(address);
    }
    
    /**
     * Estimate gas for a transaction
     */
    async estimateGas(method, fromAddress) {
        try {
            return await this.web3Service.estimateGas(method, fromAddress);
        } catch (error) {
            console.error('Error estimating gas:', error);
            throw new Error(`Failed to estimate gas: ${error.message}`);
        }
    }
}

module.exports = new BlockchainService();

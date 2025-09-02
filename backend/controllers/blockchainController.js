// Enhanced blockchain controller with full smart contract integration
const blockchainService = require('../services/blockchainService');

class BlockchainController {
    
    /**
     * Write document hash to blockchain
     */
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
            console.error('Error in writeHash:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Register a patient on blockchain
     */
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
            console.error('Error in registerPatient:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Register a doctor on blockchain
     */
    async registerDoctor(req, res) {
        try {
            const { name, license, specialization, walletAddress } = req.body;
            
            if (!name || !license || !specialization || !walletAddress) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: name, license, specialization, walletAddress'
                });
            }
            
            if (!blockchainService.isValidAddress(walletAddress)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid Ethereum address format'
                });
            }
            
            const result = await blockchainService.registerDoctor({
                name,
                license,
                specialization
            }, walletAddress);
            
            res.json(result);
        } catch (error) {
            console.error('Error in registerDoctor:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Get document from blockchain
     */
    async getDocument(req, res) {
        try {
            const { ipfsHash } = req.params;
            const { walletAddress } = req.query;
            
            if (!ipfsHash || !walletAddress) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameters: ipfsHash, walletAddress'
                });
            }
            
            if (!blockchainService.isValidAddress(walletAddress)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid Ethereum address format'
                });
            }
            
            const result = await blockchainService.getDocument(ipfsHash, walletAddress);
            res.json(result);
        } catch (error) {
            console.error('Error in getDocument:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Get all documents for a patient
     */
    async getPatientDocuments(req, res) {
        try {
            const { patientAddress } = req.params;
            const { walletAddress } = req.query;
            
            if (!patientAddress || !walletAddress) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameters: patientAddress, walletAddress'
                });
            }
            
            if (!blockchainService.isValidAddress(patientAddress) || 
                !blockchainService.isValidAddress(walletAddress)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid Ethereum address format'
                });
            }
            
            const result = await blockchainService.getPatientDocuments(patientAddress, walletAddress);
            res.json(result);
        } catch (error) {
            console.error('Error in getPatientDocuments:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Get all documents uploaded by a doctor
     */
    async getDoctorDocuments(req, res) {
        try {
            const { doctorAddress } = req.params;
            const { walletAddress } = req.query;
            
            if (!doctorAddress || !walletAddress) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameters: doctorAddress, walletAddress'
                });
            }
            
            if (!blockchainService.isValidAddress(doctorAddress) || 
                !blockchainService.isValidAddress(walletAddress)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid Ethereum address format'
                });
            }
            
            const result = await blockchainService.getDoctorDocuments(doctorAddress, walletAddress);
            res.json(result);
        } catch (error) {
            console.error('Error in getDoctorDocuments:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Grant permission to access documents
     */
    async grantPermission(req, res) {
        try {
            const { granteeAddress, walletAddress } = req.body;
            
            if (!granteeAddress || !walletAddress) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: granteeAddress, walletAddress'
                });
            }
            
            if (!blockchainService.isValidAddress(granteeAddress) || 
                !blockchainService.isValidAddress(walletAddress)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid Ethereum address format'
                });
            }
            
            const result = await blockchainService.grantPermission(granteeAddress, walletAddress);
            res.json(result);
        } catch (error) {
            console.error('Error in grantPermission:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Revoke permission to access documents
     */
    async revokePermission(req, res) {
        try {
            const { revokeeAddress, walletAddress } = req.body;
            
            if (!revokeeAddress || !walletAddress) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: revokeeAddress, walletAddress'
                });
            }
            
            if (!blockchainService.isValidAddress(revokeeAddress) || 
                !blockchainService.isValidAddress(walletAddress)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid Ethereum address format'
                });
            }
            
            const result = await blockchainService.revokePermission(revokeeAddress, walletAddress);
            res.json(result);
        } catch (error) {
            console.error('Error in revokePermission:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Deactivate a document
     */
    async deactivateDocument(req, res) {
        try {
            const { ipfsHash, walletAddress } = req.body;
            
            if (!ipfsHash || !walletAddress) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: ipfsHash, walletAddress'
                });
            }
            
            if (!blockchainService.isValidAddress(walletAddress)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid Ethereum address format'
                });
            }
            
            const result = await blockchainService.deactivateDocument(ipfsHash, walletAddress);
            res.json(result);
        } catch (error) {
            console.error('Error in deactivateDocument:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Get patient information
     */
    async getPatientInfo(req, res) {
        try {
            const { patientAddress } = req.params;
            const { walletAddress } = req.query;
            
            if (!patientAddress || !walletAddress) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameters: patientAddress, walletAddress'
                });
            }
            
            if (!blockchainService.isValidAddress(patientAddress) || 
                !blockchainService.isValidAddress(walletAddress)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid Ethereum address format'
                });
            }
            
            const result = await blockchainService.getPatientInfo(patientAddress, walletAddress);
            res.json(result);
        } catch (error) {
            console.error('Error in getPatientInfo:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Get doctor information
     */
    async getDoctorInfo(req, res) {
        try {
            const { doctorAddress } = req.params;
            
            if (!doctorAddress) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameter: doctorAddress'
                });
            }
            
            if (!blockchainService.isValidAddress(doctorAddress)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid Ethereum address format'
                });
            }
            
            const result = await blockchainService.getDoctorInfo(doctorAddress, doctorAddress);
            res.json(result);
        } catch (error) {
            console.error('Error in getDoctorInfo:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Get blockchain statistics
     */
    async getStats(req, res) {
        try {
            const result = await blockchainService.getContractStats();
            res.json(result);
        } catch (error) {
            console.error('Error in getStats:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Get wallet balance
     */
    async getBalance(req, res) {
        try {
            const { address } = req.params;
            
            if (!address) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required parameter: address'
                });
            }
            
            if (!blockchainService.isValidAddress(address)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid Ethereum address format'
                });
            }
            
            const result = await blockchainService.getBalance(address);
            res.json(result);
        } catch (error) {
            console.error('Error in getBalance:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    /**
     * Validate Ethereum address
     */
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
            console.error('Error in validateAddress:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new BlockchainController();

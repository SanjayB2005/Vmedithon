// Blockchain configuration
require('dotenv').config();

const blockchainConfig = {
    // Network configurations
    networks: {
        development: {
            host: "127.0.0.1",
            port: 7545,
            network_id: "*",
            gas: 6721975,
            gasPrice: 20000000000,
        },
        sepolia: {
            rpc: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
            network_id: 11155111,
            gas: 4000000,
            gasPrice: 10000000000,
        },
        mainnet: {
            rpc: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
            network_id: 1,
            gas: 4000000,
            gasPrice: 20000000000,
        }
    },
    
    // Contract addresses
    contracts: {
        medicalRecords: process.env.MEDICAL_RECORDS_CONTRACT_ADDRESS || null
    },
    
    // Wallet configuration
    wallet: {
        mnemonic: process.env.MNEMONIC,
        privateKey: process.env.PRIVATE_KEY
    },
    
    // API URLs (legacy support)
    BLOCKCHAIN_API_URL: process.env.BLOCKCHAIN_API_URL,
    
    // Gas settings
    gas: {
        limit: 4000000,
        price: '10000000000' // 10 Gwei
    },
    
    // Transaction settings
    transaction: {
        confirmations: 2,
        timeout: 60000 // 1 minute
    }
};

module.exports = blockchainConfig;

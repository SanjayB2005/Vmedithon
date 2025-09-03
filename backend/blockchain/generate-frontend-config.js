// Generate Frontend Configuration after Deployment
const fs = require('fs');
const path = require('path');

function generateFrontendConfig(network, contractAddress, deployerAddress) {
    console.log('🔧 Generating Frontend Configuration...');
    
    // Load contract ABI
    const contractJSON = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'build', 'contracts', 'MedicalRecords.json'), 'utf8'
    ));
    
    // Network configurations
    const networkConfigs = {
        sepolia: {
            name: 'Sepolia Testnet',
            chainId: '0x' + (11155111).toString(16), // 11155111 in hex
            rpcUrl: 'https://sepolia.infura.io/v3/e2b75194499c43e3ad3964c11e10f437',
            blockExplorer: 'https://sepolia.etherscan.io',
            currency: {
                name: 'Sepolia ETH',
                symbol: 'ETH',
                decimals: 18
            }
        },
        mumbai: {
            name: 'Polygon Mumbai',
            chainId: '0x' + (80001).toString(16), // 80001 in hex
            rpcUrl: 'https://rpc-mumbai.maticvigil.com',
            blockExplorer: 'https://mumbai.polygonscan.com',
            currency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18
            }
        },
        local: {
            name: 'Ganache Local',
            chainId: '0x' + (1337).toString(16), // 1337 in hex
            rpcUrl: 'http://localhost:7545',
            blockExplorer: null,
            currency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
            }
        }
    };
    
    const networkConfig = networkConfigs[network];
    
    // Frontend configuration object
    const frontendConfig = {
        // Contract Information
        contract: {
            address: contractAddress,
            abi: contractJSON.abi
        },
        
        // Network Configuration
        network: networkConfig,
        
        // MetaMask Configuration
        metamask: {
            chainId: networkConfig.chainId,
            chainName: networkConfig.name,
            nativeCurrency: networkConfig.currency,
            rpcUrls: [networkConfig.rpcUrl],
            blockExplorerUrls: networkConfig.blockExplorer ? [networkConfig.blockExplorer] : []
        },
        
        // Deployment Information
        deployment: {
            network: network,
            contractAddress: contractAddress,
            deployer: deployerAddress,
            deployedAt: new Date().toISOString(),
            blockExplorer: networkConfig.blockExplorer ? 
                `${networkConfig.blockExplorer}/address/${contractAddress}` : null
        },
        
        // Usage Examples
        usage: {
            web3Connection: `const web3 = new Web3('${networkConfig.rpcUrl}');`,
            contractInstance: `const contract = new web3.eth.Contract(config.contract.abi, config.contract.address);`,
            metamaskNetwork: `await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [config.metamask] });`
        }
    };
    
    // Save different formats for different use cases
    
    // 1. Complete configuration (JSON)
    fs.writeFileSync(
        path.join(__dirname, 'frontend-config', `${network}-config.json`),
        JSON.stringify(frontendConfig, null, 2)
    );
    
    // 2. JavaScript module
    const jsConfig = `// Vmedithon Blockchain Configuration - ${network.toUpperCase()}
// Generated automatically on ${new Date().toISOString()}

export const blockchainConfig = ${JSON.stringify(frontendConfig, null, 2)};

// Quick access constants
export const CONTRACT_ADDRESS = '${contractAddress}';
export const CONTRACT_ABI = ${JSON.stringify(contractJSON.abi, null, 2)};
export const NETWORK_CONFIG = ${JSON.stringify(networkConfig, null, 2)};

// Usage Examples:
// import { blockchainConfig, CONTRACT_ADDRESS, CONTRACT_ABI } from './blockchain-config.js';
// const web3 = new Web3('${networkConfig.rpcUrl}');
// const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

export default blockchainConfig;
`;
    
    fs.writeFileSync(
        path.join(__dirname, 'frontend-config', `${network}-config.js`),
        jsConfig
    );
    
    // 3. React/Next.js environment variables
    const envVars = `# Vmedithon Blockchain Environment Variables - ${network.toUpperCase()}
# Add these to your frontend .env file

NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}
NEXT_PUBLIC_NETWORK=${network}
NEXT_PUBLIC_CHAIN_ID=${networkConfig.chainId}
NEXT_PUBLIC_RPC_URL=${networkConfig.rpcUrl}
NEXT_PUBLIC_BLOCK_EXPLORER=${networkConfig.blockExplorer || ''}
NEXT_PUBLIC_NETWORK_NAME=${networkConfig.name}

# For React apps (without NEXT_PUBLIC prefix)
REACT_APP_CONTRACT_ADDRESS=${contractAddress}
REACT_APP_NETWORK=${network}
REACT_APP_CHAIN_ID=${networkConfig.chainId}
REACT_APP_RPC_URL=${networkConfig.rpcUrl}
`;
    
    fs.writeFileSync(
        path.join(__dirname, 'frontend-config', `${network}.env`),
        envVars
    );
    
    // 4. Simple key-value file
    const simpleConfig = `CONTRACT_ADDRESS=${contractAddress}
NETWORK=${network}
CHAIN_ID=${networkConfig.chainId}
RPC_URL=${networkConfig.rpcUrl}
BLOCK_EXPLORER=${networkConfig.blockExplorer || ''}
DEPLOYER=${deployerAddress}
DEPLOYED_AT=${new Date().toISOString()}
`;
    
    fs.writeFileSync(
        path.join(__dirname, 'frontend-config', `${network}-keys.txt`),
        simpleConfig
    );
    
    // 5. Ready-to-use HTML file
    let htmlTemplate = fs.readFileSync(
        path.join(__dirname, 'frontend-config', 'index.html'), 'utf8'
    );
    
    // Replace placeholders in HTML
    htmlTemplate = htmlTemplate
        .replace('YOUR_CONTRACT_ADDRESS_HERE', contractAddress)
        .replace('YOUR_RPC_URL_HERE', networkConfig.rpcUrl)
        .replace('YOUR_CHAIN_ID_HERE', networkConfig.chainId)
        .replace('YOUR_NETWORK_NAME_HERE', networkConfig.name)
        .replace('YOUR_BLOCK_EXPLORER_HERE', networkConfig.blockExplorer || '')
        .replace('const CONTRACT_ABI = [];', `const CONTRACT_ABI = ${JSON.stringify(contractJSON.abi, null, 8)};`);
    
    fs.writeFileSync(
        path.join(__dirname, 'frontend-config', `${network}-ready.html`),
        htmlTemplate
    );
    
    console.log('✅ Frontend configuration generated!');
    console.log(`📁 Files created in frontend-config/:`);
    console.log(`   📄 ${network}-config.json - Complete configuration`);
    console.log(`   📄 ${network}-config.js - JavaScript module`);
    console.log(`   📄 ${network}.env - Environment variables`);
    console.log(`   📄 ${network}-keys.txt - Simple key-value pairs`);
    console.log(`   🌐 ${network}-ready.html - Ready-to-use HTML interface`);
    console.log(`\n🎯 Quick Start:`);
    console.log(`   • Open ${network}-ready.html in browser to test immediately`);
    console.log(`   • Copy ${network}-config.js to your React/Next.js project`);
    console.log(`   • Add ${network}.env variables to your frontend .env file`);
    
    return frontendConfig;
}

module.exports = { generateFrontendConfig };

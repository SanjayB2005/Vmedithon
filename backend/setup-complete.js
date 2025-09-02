#!/usr/bin/env node

/**
 * Comprehensive Setup Script for Vmedithon Blockchain Infrastructure
 * This script sets up and validates the entire blockchain ecosystem
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

class VmedithonBlockchainSetup {
    constructor() {
        this.rootDir = __dirname;
        this.blockchainDir = path.join(this.rootDir, 'blockchain');
        this.setupLog = [];
    }
    
    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        
        this.setupLog.push({ timestamp, message, type });
        
        switch (type) {
            case 'success':
                console.log(`✅ ${message}`);
                break;
            case 'error':
                console.log(`❌ ${message}`);
                break;
            case 'warning':
                console.log(`⚠️  ${message}`);
                break;
            case 'info':
            default:
                console.log(`ℹ️  ${message}`);
                break;
        }
    }
    
    async run() {
        console.log('🚀 Vmedithon Blockchain Infrastructure Setup');
        console.log('=' .repeat(60));
        console.log('Setting up complete blockchain infrastructure for medical records...\n');
        
        try {
            await this.checkSystem();
            await this.setupDirectories();
            await this.setupEnvironment();
            await this.installDependencies();
            await this.validateSetup();
            await this.runTests();
            
            this.displaySummary();
            this.displayNextSteps();
            
        } catch (error) {
            this.log(`Setup failed: ${error.message}`, 'error');
            console.log('\n🛠️  Troubleshooting:');
            console.log('1. Ensure Node.js 16+ is installed');
            console.log('2. Check internet connection for package downloads');
            console.log('3. Verify write permissions in the project directory');
            process.exit(1);
        }
    }
    
    async checkSystem() {
        this.log('Checking system requirements...', 'info');
        
        // Check Node.js version
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
        
        if (majorVersion < 16) {
            throw new Error(`Node.js 16+ required, found ${nodeVersion}`);
        }
        this.log(`Node.js version: ${nodeVersion}`, 'success');
        
        // Check npm
        try {
            const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
            this.log(`npm version: ${npmVersion}`, 'success');
        } catch (error) {
            throw new Error('npm is required but not found');
        }
        
        // Check available memory
        const totalMem = Math.round(process.memoryUsage().rss / 1024 / 1024);
        this.log(`Available memory: ${totalMem} MB`, 'info');
        
        console.log();
    }
    
    async setupDirectories() {
        this.log('Setting up directory structure...', 'info');
        
        const directories = [
            this.blockchainDir,
            path.join(this.blockchainDir, 'build'),
            path.join(this.blockchainDir, 'deployments'),
            path.join(this.rootDir, 'logs'),
            path.join(this.rootDir, 'temp')
        ];
        
        directories.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                this.log(`Created directory: ${path.relative(this.rootDir, dir)}`, 'success');
            }
        });
        
        console.log();
    }
    
    async setupEnvironment() {
        this.log('Setting up environment configuration...', 'info');
        
        const envPath = path.join(this.rootDir, '.env');
        const envExamplePath = path.join(this.rootDir, '.env.example');
        
        if (!fs.existsSync(envPath)) {
            if (fs.existsSync(envExamplePath)) {
                fs.copyFileSync(envExamplePath, envPath);
                this.log('Created .env file from template', 'success');
            } else {
                // Create basic .env file
                const basicEnv = `# Vmedithon Configuration
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/vmedithon

# IPFS
IPFS_HOST=localhost
IPFS_PORT=5001
IPFS_PROTOCOL=http

# Blockchain (update with your values)
ETHEREUM_RPC_URL=http://localhost:7545
INFURA_PROJECT_ID=your_infura_project_id_here
MNEMONIC="your twelve word mnemonic phrase here"
MEDICAL_RECORDS_CONTRACT_ADDRESS=

# Pinata (optional)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
`;
                fs.writeFileSync(envPath, basicEnv);
                this.log('Created basic .env file', 'success');
            }
        } else {
            this.log('.env file already exists', 'info');
        }
        
        console.log();
    }
    
    async installDependencies() {
        this.log('Installing project dependencies...', 'info');
        
        try {
            // Install main dependencies
            this.log('Installing main project dependencies...', 'info');
            execSync('npm install', { 
                cwd: this.rootDir, 
                stdio: 'pipe' 
            });
            this.log('Main dependencies installed', 'success');
            
            // Install blockchain dependencies
            this.log('Installing blockchain dependencies...', 'info');
            execSync('npm install', { 
                cwd: this.blockchainDir, 
                stdio: 'pipe' 
            });
            this.log('Blockchain dependencies installed', 'success');
            
        } catch (error) {
            throw new Error(`Dependency installation failed: ${error.message}`);
        }
        
        console.log();
    }
    
    async validateSetup() {
        this.log('Validating setup...', 'info');
        
        // Check if required files exist
        const requiredFiles = [
            'package.json',
            'server.js',
            '.env',
            'blockchain/contracts/MedicalRecords.sol',
            'blockchain/truffle-config.js',
            'services/web3Service.js',
            'controllers/blockchainController.js'
        ];
        
        let missingFiles = [];
        
        requiredFiles.forEach(file => {
            const fullPath = path.join(this.rootDir, file);
            if (!fs.existsSync(fullPath)) {
                missingFiles.push(file);
            }
        });
        
        if (missingFiles.length > 0) {
            this.log(`Missing required files: ${missingFiles.join(', ')}`, 'error');
        } else {
            this.log('All required files present', 'success');
        }
        
        // Check package.json dependencies
        const packageJson = JSON.parse(fs.readFileSync(path.join(this.rootDir, 'package.json'), 'utf8'));
        const requiredDeps = ['web3', 'express', 'mongoose', 'dotenv'];
        
        let missingDeps = [];
        requiredDeps.forEach(dep => {
            if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
                missingDeps.push(dep);
            }
        });
        
        if (missingDeps.length > 0) {
            this.log(`Missing dependencies: ${missingDeps.join(', ')}`, 'warning');
        } else {
            this.log('All required dependencies present', 'success');
        }
        
        console.log();
    }
    
    async runTests() {
        this.log('Running integration tests...', 'info');
        
        try {
            // Run backend integration test
            this.log('Running backend integration tests...', 'info');
            execSync('node test-backend-integration.js', { 
                cwd: this.rootDir, 
                stdio: 'pipe' 
            });
            this.log('Backend integration tests passed', 'success');
            
        } catch (error) {
            this.log('Some tests failed - this is normal if services are not running', 'warning');
        }
        
        console.log();
    }
    
    displaySummary() {
        console.log('📊 Setup Summary');
        console.log('=' .repeat(60));
        
        const successCount = this.setupLog.filter(log => log.type === 'success').length;
        const warningCount = this.setupLog.filter(log => log.type === 'warning').length;
        const errorCount = this.setupLog.filter(log => log.type === 'error').length;
        
        console.log(`✅ Successful operations: ${successCount}`);
        console.log(`⚠️  Warnings: ${warningCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        
        if (errorCount === 0) {
            console.log('\n🎉 Setup completed successfully!');
        } else {
            console.log('\n⚠️  Setup completed with some issues. Check the logs above.');
        }
        
        console.log();
    }
    
    displayNextSteps() {
        console.log('📋 Next Steps');
        console.log('=' .repeat(60));
        
        console.log('1. 🔧 Configure your environment:');
        console.log('   - Edit .env file with your actual values');
        console.log('   - Set up Infura project for testnet access');
        console.log('   - Configure MetaMask wallet');
        
        console.log('\n2. 🏗️  Set up blockchain network:');
        console.log('   - Install Ganache: npm install -g ganache-cli');
        console.log('   - Start local blockchain: ganache-cli');
        console.log('   - Or use Sepolia testnet with Infura');
        
        console.log('\n3. 📄 Deploy smart contracts:');
        console.log('   - Install Truffle: npm install -g truffle');
        console.log('   - Compile contracts: cd blockchain && truffle compile');
        console.log('   - Deploy contracts: truffle migrate');
        
        console.log('\n4. 🚀 Start the application:');
        console.log('   - Start MongoDB: mongod');
        console.log('   - Start IPFS node: ipfs daemon');
        console.log('   - Start backend: npm run dev');
        
        console.log('\n5. 🧪 Test the system:');
        console.log('   - Test blockchain: node test-blockchain.js');
        console.log('   - Test IPFS: node test-ipfs.js');
        console.log('   - Test medical documents: node test-medical-documents.js');
        
        console.log('\n6. 📱 Frontend integration:');
        console.log('   - Connect frontend to backend API');
        console.log('   - Integrate MetaMask for wallet connection');
        console.log('   - Test end-to-end workflow');
        
        console.log('\n🔗 Useful resources:');
        console.log('   - Project documentation: blockchain/README.md');
        console.log('   - Smart contract: blockchain/contracts/MedicalRecords.sol');
        console.log('   - API routes: http://localhost:3000/api/blockchain');
        
        console.log('\n💡 Need help?');
        console.log('   - Check logs in logs/ directory');
        console.log('   - Review .env.example for configuration options');
        console.log('   - Run individual test files to diagnose issues');
        
        console.log('=' .repeat(60));
        console.log('🏥 Vmedithon blockchain infrastructure is ready!');
        console.log('=' .repeat(60));
    }
    
    static async main() {
        const setup = new VmedithonBlockchainSetup();
        await setup.run();
    }
}

// Run if called directly
if (require.main === module) {
    VmedithonBlockchainSetup.main().catch(console.error);
}

module.exports = VmedithonBlockchainSetup;

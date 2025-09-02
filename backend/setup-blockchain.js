#!/usr/bin/env node

/**
 * Vmedithon Blockchain Setup and Testing Script
 * This script helps setup and test the entire blockchain infrastructure
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

class BlockchainSetup {
    constructor() {
        this.rootDir = __dirname;
        this.blockchainDir = path.join(this.rootDir, 'blockchain');
    }
    
    async run() {
        console.log('🚀 Starting Vmedithon Blockchain Setup...\n');
        
        try {
            await this.checkPrerequisites();
            await this.setupEnvironment();
            await this.installDependencies();
            await this.compileContracts();
            await this.runTests();
            
            console.log('✅ Blockchain setup completed successfully!');
            console.log('\n📋 Next Steps:');
            console.log('1. Copy .env.example to .env and fill in your configuration');
            console.log('2. Start Ganache or connect to your Ethereum network');
            console.log('3. Deploy contracts using: npm run blockchain:deploy');
            console.log('4. Start the server using: npm run dev');
            
        } catch (error) {
            console.error('❌ Setup failed:', error.message);
            process.exit(1);
        }
    }
    
    async checkPrerequisites() {
        console.log('🔍 Checking prerequisites...');
        
        // Check Node.js version
        const nodeVersion = process.version;
        console.log(`✓ Node.js version: ${nodeVersion}`);
        
        if (!nodeVersion.startsWith('v18') && !nodeVersion.startsWith('v20')) {
            console.warn('⚠️  Warning: Node.js 18+ recommended for Web3 compatibility');
        }
        
        // Check npm
        try {
            execSync('npm --version', { stdio: 'ignore' });
            console.log('✓ npm is available');
        } catch (error) {
            throw new Error('npm is required but not found');
        }
        
        console.log('');
    }
    
    async setupEnvironment() {
        console.log('🛠️  Setting up environment...');
        
        const envExamplePath = path.join(this.rootDir, '.env.example');
        const envPath = path.join(this.rootDir, '.env');
        
        // Create .env if it doesn't exist
        if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
            fs.copyFileSync(envExamplePath, envPath);
            console.log('✓ Created .env file from template');
        } else {
            console.log('✓ Environment file already exists');
        }
        
        // Create blockchain directories if they don't exist
        const dirs = [
            path.join(this.blockchainDir, 'build'),
            path.join(this.blockchainDir, 'deployments')
        ];
        
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`✓ Created directory: ${dir}`);
            }
        });
        
        console.log('');
    }
    
    async installDependencies() {
        console.log('📦 Installing dependencies...');
        
        // Install main project dependencies
        console.log('Installing main project dependencies...');
        await this.runCommand('npm', ['install'], this.rootDir);
        
        // Install blockchain dependencies
        console.log('Installing blockchain dependencies...');
        await this.runCommand('npm', ['install'], this.blockchainDir);
        
        console.log('✓ Dependencies installed\n');
    }
    
    async compileContracts() {
        console.log('🔨 Compiling smart contracts...');
        
        try {
            await this.runCommand('npm', ['run', 'compile'], this.blockchainDir);
            console.log('✓ Smart contracts compiled successfully\n');
        } catch (error) {
            console.error('⚠️  Contract compilation failed. This is normal if Truffle is not set up yet.');
            console.log('You can compile later using: npm run blockchain:compile\n');
        }
    }
    
    async runTests() {
        console.log('🧪 Running tests...');
        
        // Test IPFS connection
        try {
            console.log('Testing IPFS connection...');
            await this.runCommand('node', ['test-ipfs.js'], this.rootDir);
            console.log('✓ IPFS test passed');
        } catch (error) {
            console.log('⚠️  IPFS test failed - ensure IPFS is running');
        }
        
        // Test MongoDB connection
        try {
            console.log('Testing MongoDB connection...');
            await this.runCommand('node', ['test-medical-documents.js'], this.rootDir);
            console.log('✓ MongoDB test passed');
        } catch (error) {
            console.log('⚠️  MongoDB test failed - ensure MongoDB is running');
        }
        
        // Test Pinata connection
        try {
            console.log('Testing Pinata connection...');
            await this.runCommand('node', ['test-pinata.js'], this.rootDir);
            console.log('✓ Pinata test passed');
        } catch (error) {
            console.log('⚠️  Pinata test failed - check API keys in .env');
        }
        
        console.log('');
    }
    
    runCommand(command, args, cwd) {
        return new Promise((resolve, reject) => {
            const process = spawn(command, args, { 
                cwd: cwd || this.rootDir,
                stdio: ['inherit', 'pipe', 'pipe'],
                shell: true
            });
            
            let stdout = '';
            let stderr = '';
            
            process.stdout.on('data', (data) => {
                stdout += data;
                // Show important output
                const output = data.toString();
                if (output.includes('✓') || output.includes('compiled') || output.includes('test')) {
                    process.stdout.write(data);
                }
            });
            
            process.stderr.on('data', (data) => {
                stderr += data;
            });
            
            process.on('close', (code) => {
                if (code === 0) {
                    resolve({ stdout, stderr });
                } else {
                    reject(new Error(`Command failed with exit code ${code}\n${stderr}`));
                }
            });
        });
    }
    
    static async main() {
        const setup = new BlockchainSetup();
        await setup.run();
    }
}

// Run if called directly
if (require.main === module) {
    BlockchainSetup.main().catch(console.error);
}

module.exports = BlockchainSetup;

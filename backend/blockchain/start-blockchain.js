#!/usr/bin/env node

/**
 * Vmedithon Blockchain Startup Script
 * Helps you start the blockchain network for development or production
 */

const { spawn } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🏥 Vmedithon Blockchain Startup');
console.log('================================');
console.log('');
console.log('Choose your blockchain network:');
console.log('1. 🧪 Local Development (Ganache) - Recommended for testing');
console.log('2. 🌐 Sepolia Testnet - For public testing');
console.log('3. 🚀 Deploy Only - Deploy to existing network');
console.log('4. ℹ️  Help - Show setup instructions');
console.log('');

rl.question('Enter your choice (1-4): ', (answer) => {
    switch (answer.trim()) {
        case '1':
            startGanache();
            break;
        case '2':
            deploySepolia();
            break;
        case '3':
            deployOnly();
            break;
        case '4':
            showHelp();
            break;
        default:
            console.log('❌ Invalid choice. Please run the script again.');
            rl.close();
            break;
    }
});

function startGanache() {
    console.log('🧪 Starting local Ganache blockchain...');
    console.log('');
    console.log('📋 Network Details:');
    console.log('   • RPC URL: http://localhost:8545');
    console.log('   • Chain ID: 1337');
    console.log('   • Accounts: 10 (each with 100 ETH)');
    console.log('   • Gas Limit: Unlimited');
    console.log('');
    console.log('🔄 Starting Ganache...');
    
    const ganache = spawn('npx', ['ganache-cli', '-a', '10', '-e', '100', '-p', '8545', '--deterministic'], {
        stdio: 'inherit',
        shell: true
    });
    
    ganache.on('close', (code) => {
        console.log(`Ganache exited with code ${code}`);
        rl.close();
    });
    
    ganache.on('error', (error) => {
        console.log('❌ Failed to start Ganache. Install it first:');
        console.log('   npm install -g ganache-cli');
        console.log('');
        console.log('Or install dependencies:');
        console.log('   npm install');
        rl.close();
    });
    
    // Give Ganache time to start, then show next steps
    setTimeout(() => {
        console.log('');
        console.log('✅ Ganache should now be running!');
        console.log('');
        console.log('🔄 Next Steps:');
        console.log('   1. Open a new terminal');
        console.log('   2. Run: npm run migrate');
        console.log('   3. Configure MetaMask with local network');
        console.log('   4. Run your tests: npm run test:workflow');
        console.log('');
        console.log('Press Ctrl+C to stop Ganache');
    }, 3000);
}

function deploySepolia() {
    console.log('🌐 Deploying to Sepolia Testnet...');
    console.log('');
    
    // Check for required environment variables
    require('dotenv').config();
    
    if (!process.env.MNEMONIC || !process.env.INFURA_PROJECT_ID) {
        console.log('❌ Missing environment variables!');
        console.log('');
        console.log('Please create a .env file with:');
        console.log('   MNEMONIC="your twelve word mnemonic"');
        console.log('   INFURA_PROJECT_ID="your_infura_project_id"');
        console.log('');
        console.log('💡 Get Infura Project ID: https://infura.io');
        console.log('💡 Get test ETH: https://sepoliafaucet.com');
        rl.close();
        return;
    }
    
    console.log('🔄 Deploying to Sepolia...');
    const deploy = spawn('npm', ['run', 'deploy'], {
        stdio: 'inherit',
        shell: true
    });
    
    deploy.on('close', (code) => {
        if (code === 0) {
            console.log('✅ Deployment successful!');
        } else {
            console.log('❌ Deployment failed. Check the logs above.');
        }
        rl.close();
    });
}

function deployOnly() {
    console.log('🚀 Deploying contracts...');
    console.log('');
    
    rl.question('Deploy to (1) Local or (2) Testnet? ', (choice) => {
        if (choice === '1') {
            console.log('🔄 Deploying to local network...');
            const deploy = spawn('npm', ['run', 'deploy:local'], {
                stdio: 'inherit',
                shell: true
            });
            
            deploy.on('close', (code) => {
                console.log(code === 0 ? '✅ Local deployment complete!' : '❌ Deployment failed');
                rl.close();
            });
        } else if (choice === '2') {
            deploySepolia();
        } else {
            console.log('❌ Invalid choice');
            rl.close();
        }
    });
}

function showHelp() {
    console.log('ℹ️  Blockchain Setup Help');
    console.log('==========================');
    console.log('');
    console.log('🧪 Local Development Setup:');
    console.log('   1. Install dependencies: npm install');
    console.log('   2. Start Ganache: npm run ganache');
    console.log('   3. Deploy contracts: npm run migrate');
    console.log('   4. Run tests: npm run test:workflow');
    console.log('');
    console.log('🌐 Testnet Setup:');
    console.log('   1. Create .env file with MNEMONIC and INFURA_PROJECT_ID');
    console.log('   2. Get test ETH from https://sepoliafaucet.com');
    console.log('   3. Deploy: npm run deploy:testnet');
    console.log('');
    console.log('📱 MetaMask Configuration:');
    console.log('   • Local: RPC http://localhost:8545, Chain ID 1337');
    console.log('   • Sepolia: Built-in testnet in MetaMask');
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   • Port 8545 busy: Change port in truffle-config.js');
    console.log('   • Compilation errors: npm install -g truffle');
    console.log('   • Gas errors: Increase gas limit in migrations');
    console.log('');
    rl.close();
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
    console.log('\n👋 Goodbye!');
    rl.close();
    process.exit(0);
});

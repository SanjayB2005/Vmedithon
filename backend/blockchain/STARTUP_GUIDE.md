# 🚀 Vmedithon Blockchain Startup Guide

## Quick Start Options

### Option 1: Local Development with Ganache (Recommended for Testing)

#### Step 1: Install Ganache
```bash
# Install Ganache CLI globally
npm install -g ganache-cli

# OR install Ganache GUI
# Download from: https://trufflesuite.com/ganache/
```

#### Step 2: Start Local Blockchain
```bash
# Start Ganache with 10 accounts, each with 100 ETH
ganache-cli -a 10 -e 100

# OR with custom settings
ganache-cli -p 8545 -a 10 -e 100 --deterministic
```

#### Step 3: Deploy Contracts Locally
```bash
cd blockchain
npm run compile
npm run migrate
```

### Option 2: Testnet Deployment (Sepolia)

#### Step 1: Set up Environment Variables
Create `.env` file in blockchain folder:
```env
MNEMONIC="your twelve word mnemonic phrase here"
INFURA_PROJECT_ID="your_infura_project_id"
PRIVATE_KEY="your_private_key_without_0x"
```

#### Step 2: Get Test ETH
- Visit: https://sepoliafaucet.com/
- Enter your wallet address
- Get free Sepolia ETH for testing

#### Step 3: Deploy to Testnet
```bash
cd blockchain
npm run deploy
```

### Option 3: Mainnet Deployment (Production Only)

⚠️ **WARNING**: Only use for production with real ETH!

```bash
# Ensure you have real ETH in your wallet
cd blockchain
npm run deploy:mainnet
```

## 🔧 Troubleshooting Common Issues

### Issue 1: "Cannot find module" errors
```bash
cd blockchain
npm install
```

### Issue 2: Compilation errors
```bash
# Install Truffle globally
npm install -g truffle

# Compile contracts
truffle compile
```

### Issue 3: Gas estimation failed
```bash
# Increase gas limit in truffle-config.js
# Or use Ganache with unlimited gas
ganache-cli -l 0xfffffffffff
```

### Issue 4: Network connection issues
```bash
# Check if Ganache is running on correct port
netstat -an | findstr 8545

# Check Infura connection
curl https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

## 🎯 Next Steps After Blockchain Starts

1. **Verify Deployment**: Check contract addresses in console output
2. **Update Backend**: Copy contract addresses to your backend config
3. **Test Integration**: Run your workflow tests
4. **Frontend Setup**: Connect MetaMask to your blockchain network

## 📱 MetaMask Configuration

### For Local Development (Ganache)
- Network Name: Ganache Local
- RPC URL: http://localhost:8545
- Chain ID: 1337
- Currency: ETH

### For Sepolia Testnet
- Network Name: Sepolia
- RPC URL: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
- Chain ID: 11155111
- Currency: ETH

## 🏥 Ready for Testing!

Once blockchain is running, you can:
- Run your workflow tests: `npm run test:workflow`
- Deploy frontend applications
- Connect with MetaMask wallet
- Process real medical document transactions

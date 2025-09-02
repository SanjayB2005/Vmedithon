# Vmedithon Blockchain Infrastructure

This directory contains the complete blockchain infrastructure for the Vmedithon medical records management system, built on Ethereum with Solidity smart contracts.

## 🏗️ Architecture Overview

```
backend/blockchain/
├── contracts/           # Solidity smart contracts
│   ├── MedicalRecords.sol    # Main medical records contract
│   └── Migrations.sol        # Truffle migrations contract
├── migrations/          # Deployment scripts
├── test/               # Smart contract tests
├── scripts/            # Utility scripts
├── build/              # Compiled contracts (auto-generated)
└── deployments/        # Deployment information
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install main project dependencies
npm install

# Install blockchain-specific dependencies
cd blockchain
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration:
# - INFURA_PROJECT_ID: Your Infura project ID
# - MNEMONIC: Your wallet mnemonic phrase
# - MEDICAL_RECORDS_CONTRACT_ADDRESS: Contract address after deployment
```

### 3. Development Setup

```bash
# Start Ganache (local blockchain)
ganache-cli --deterministic --accounts 10 --host 0.0.0.0 --port 7545

# Compile contracts
npm run blockchain:compile

# Run tests
npm run blockchain:test

# Deploy to local network
npm run blockchain:migrate
```

### 4. Testnet Deployment

```bash
# Deploy to Sepolia testnet
npm run blockchain:migrate:sepolia

# Verify contract on Etherscan
npm run verify
```

## 📋 Smart Contract Features

### MedicalRecords.sol

The main smart contract provides:

- **User Management**: Register patients and doctors with verification
- **Document Storage**: Store IPFS hashes of medical documents
- **Access Control**: Granular permission system for document access
- **Data Integrity**: Immutable record of all medical documents
- **Privacy Protection**: Encrypted off-chain storage with on-chain verification

### Key Functions

```solidity
// User Registration
function registerPatient(string memory _name, string memory _email, uint256 _dateOfBirth)
function registerDoctor(string memory _name, string memory _license, string memory _specialization)

// Document Management
function uploadDocument(string memory _ipfsHash, address _patientAddress, string memory _documentType, string memory _metadata)
function getDocument(string memory _ipfsHash) returns (MedicalDocument memory)
function deactivateDocument(string memory _ipfsHash)

// Permission Management
function grantPermission(address _grantee)
function revokePermission(address _revokee)

// Data Retrieval
function getPatientDocuments(address _patientAddress) returns (string[] memory)
function getDoctorDocuments(address _doctorAddress) returns (string[] memory)
```

## 🔧 API Integration

### Backend Services

The blockchain is integrated with the backend through:

- **Web3Service**: Direct smart contract interaction
- **BlockchainService**: High-level business logic
- **BlockchainController**: REST API endpoints
- **BlockchainRoutes**: HTTP route definitions

### Available Endpoints

```
POST /api/blockchain/register-patient     # Register new patient
POST /api/blockchain/register-doctor      # Register new doctor
POST /api/blockchain/write-hash          # Upload document hash
GET  /api/blockchain/document/:hash      # Get document details
GET  /api/blockchain/patient/:addr/documents  # Get patient documents
GET  /api/blockchain/stats               # Get blockchain statistics
```

## 🧪 Testing

### Smart Contract Tests

```bash
# Run all tests
npm run blockchain:test

# Run specific test file
truffle test test/MedicalRecords.test.js
```

### Integration Tests

```bash
# Test API endpoints
npm run test:blockchain

# Test individual components
npm run test:medical
npm run test:ipfs
npm run test:pinata
```

### Test Coverage

The test suite covers:
- ✅ Contract deployment and initialization
- ✅ Patient and doctor registration
- ✅ Document upload and retrieval
- ✅ Access control and permissions
- ✅ Error handling and edge cases
- ✅ Gas usage optimization
- ✅ Event emission verification

## 🔒 Security Features

### Smart Contract Security

- **Access Control**: Role-based permissions (patients, doctors, owner)
- **Input Validation**: Comprehensive parameter checking
- **Reentrancy Protection**: Safe external calls
- **Integer Overflow Protection**: Using Solidity 0.8.x built-in checks
- **Emergency Controls**: Contract pause functionality

### Data Privacy

- **Off-chain Storage**: Sensitive data stored in IPFS
- **On-chain Verification**: Only hashes stored on blockchain
- **Encryption**: Document encryption before IPFS storage
- **Permission System**: Granular access control

## 🌐 Network Configuration

### Supported Networks

- **Development**: Local Ganache (network ID: *)
- **Sepolia Testnet**: Ethereum testnet (network ID: 11155111)
- **Mainnet**: Ethereum mainnet (network ID: 1)

### Gas Optimization

- Optimized for minimal gas usage
- Batch operations where possible
- Efficient data structures
- Gas estimation for transactions

## 📊 Monitoring and Analytics

### Contract Statistics

Track important metrics:
- Total documents uploaded
- Number of registered patients/doctors
- Transaction volume and gas usage
- Permission grants/revokes

### Event Logging

All important actions emit events for:
- User registration
- Document uploads
- Permission changes
- Contract interactions

## 🛠️ Development Workflow

### Local Development

1. **Setup**: Run `node setup-blockchain.js`
2. **Develop**: Modify contracts and tests
3. **Test**: Run comprehensive test suite
4. **Deploy**: Deploy to local network
5. **Integrate**: Test with backend API

### Production Deployment

1. **Security Audit**: Review code and run security checks
2. **Testnet Deploy**: Deploy and test on Sepolia
3. **Mainnet Deploy**: Deploy to production
4. **Verify Contract**: Verify on Etherscan
5. **Monitor**: Set up monitoring and alerts

## 🔍 Troubleshooting

### Common Issues

**Contract Compilation Errors**
```bash
# Clean and recompile
rm -rf build/
npm run blockchain:compile
```

**Network Connection Issues**
```bash
# Check network configuration
truffle console --network sepolia
```

**Gas Estimation Failures**
```bash
# Check account balance and gas price
web3.eth.getBalance(accounts[0])
```

### Debug Commands

```bash
# Debug transaction
truffle debug <transaction_hash>

# Console interaction
truffle console --network development

# Contract information
truffle networks --clean
```

## 📚 Resources

- [Truffle Documentation](https://trufflesuite.com/docs/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

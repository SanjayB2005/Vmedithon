const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');

// List available blockchain endpoints
router.get('/', (req, res) => {
	res.send(`
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Blockchain API Routes</title>
			<style>
				body { font-family: Arial, sans-serif; background: #f4f6f8; color: #222; margin: 0; padding: 0; }
				.container { max-width: 800px; margin: 40px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); padding: 32px; }
				h1 { color: #1565c0; margin-bottom: 16px; }
				h2 { color: #1976d2; margin-top: 24px; margin-bottom: 12px; }
				ul { list-style: none; padding: 0; }
				li { margin: 8px 0; padding: 8px; background: #f8f9fa; border-radius: 4px; }
				.method { font-weight: bold; color: #2e7d32; }
				.post { color: #d32f2f; }
				.put { color: #ed6c02; }
				.delete { color: #c2185b; }
				a { color: #1976d2; text-decoration: none; }
				.endpoint { font-family: monospace; }
			</style>
		</head>
		<body>
			<div class="container">
				<h1>Blockchain API Routes - Medical Records Smart Contract</h1>
				
				<h2>Document Management</h2>
				<ul>
					<li><span class="method post">POST</span> <span class="endpoint">/api/blockchain/write-hash</span> - Upload document hash to blockchain</li>
					<li><span class="method">GET</span> <span class="endpoint">/api/blockchain/document/:ipfsHash</span> - Get document by IPFS hash</li>
					<li><span class="method put">PUT</span> <span class="endpoint">/api/blockchain/deactivate-document</span> - Deactivate a document</li>
				</ul>
				
				<h2>User Registration</h2>
				<ul>
					<li><span class="method post">POST</span> <span class="endpoint">/api/blockchain/register-patient</span> - Register patient on blockchain</li>
					<li><span class="method post">POST</span> <span class="endpoint">/api/blockchain/register-doctor</span> - Register doctor on blockchain</li>
				</ul>
				
				<h2>User Information</h2>
				<ul>
					<li><span class="method">GET</span> <span class="endpoint">/api/blockchain/patient/:patientAddress</span> - Get patient information</li>
					<li><span class="method">GET</span> <span class="endpoint">/api/blockchain/doctor/:doctorAddress</span> - Get doctor information</li>
				</ul>
				
				<h2>Document Lists</h2>
				<ul>
					<li><span class="method">GET</span> <span class="endpoint">/api/blockchain/patient/:patientAddress/documents</span> - Get patient documents</li>
					<li><span class="method">GET</span> <span class="endpoint">/api/blockchain/doctor/:doctorAddress/documents</span> - Get doctor documents</li>
				</ul>
				
				<h2>Permissions</h2>
				<ul>
					<li><span class="method post">POST</span> <span class="endpoint">/api/blockchain/grant-permission</span> - Grant access permission</li>
					<li><span class="method post">POST</span> <span class="endpoint">/api/blockchain/revoke-permission</span> - Revoke access permission</li>
				</ul>
				
				<h2>Utility</h2>
				<ul>
					<li><span class="method">GET</span> <span class="endpoint">/api/blockchain/stats</span> - Get blockchain statistics</li>
					<li><span class="method">GET</span> <span class="endpoint">/api/blockchain/balance/:address</span> - Get wallet balance</li>
					<li><span class="method">GET</span> <span class="endpoint">/api/blockchain/validate/:address</span> - Validate Ethereum address</li>
				</ul>
			</div>
		</body>
		</html>
	`);
});

// Document Management Routes
router.post('/write-hash', blockchainController.writeHash);
router.get('/document/:ipfsHash', blockchainController.getDocument);
router.put('/deactivate-document', blockchainController.deactivateDocument);

// User Registration Routes
router.post('/register-patient', blockchainController.registerPatient);
router.post('/register-doctor', blockchainController.registerDoctor);

// User Information Routes
router.get('/patient/:patientAddress', blockchainController.getPatientInfo);
router.get('/doctor/:doctorAddress', blockchainController.getDoctorInfo);

// Document List Routes
router.get('/patient/:patientAddress/documents', blockchainController.getPatientDocuments);
router.get('/doctor/:doctorAddress/documents', blockchainController.getDoctorDocuments);

// Permission Management Routes
router.post('/grant-permission', blockchainController.grantPermission);
router.post('/revoke-permission', blockchainController.revokePermission);

// Utility Routes
router.get('/stats', blockchainController.getStats);
router.get('/balance/:address', blockchainController.getBalance);
router.get('/validate/:address', blockchainController.validateAddress);

module.exports = router;

// Example: How to use the generated blockchain configuration in React/Next.js

import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { blockchainConfig, CONTRACT_ADDRESS, CONTRACT_ABI } from './blockchain-config.js';

const VmedithonBlockchain = () => {
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState('');
    const [isPatient, setIsPatient] = useState(false);
    const [isDoctor, setIsDoctor] = useState(false);

    // Initialize Web3 and Contract
    useEffect(() => {
        initWeb3();
    }, []);

    const initWeb3 = async () => {
        try {
            // Check if MetaMask is installed
            if (window.ethereum) {
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);

                // Create contract instance
                const contractInstance = new web3Instance.eth.Contract(
                    CONTRACT_ABI,
                    CONTRACT_ADDRESS
                );
                setContract(contractInstance);

                console.log('✅ Web3 initialized');
                console.log('📍 Contract Address:', CONTRACT_ADDRESS);
                console.log('🌐 Network:', blockchainConfig.network.name);

            } else {
                alert('Please install MetaMask!');
            }
        } catch (error) {
            console.error('Error initializing Web3:', error);
        }
    };

    const connectWallet = async () => {
        try {
            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (accounts.length > 0) {
                setAccount(accounts[0]);
                
                // Check if correct network
                await checkNetwork();
                
                // Check user type
                await checkUserType(accounts[0]);
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
        }
    };

    const checkNetwork = async () => {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        if (chainId !== blockchainConfig.metamask.chainId) {
            try {
                // Switch to correct network
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: blockchainConfig.metamask.chainId }],
                });
            } catch (switchError) {
                // Add network if it doesn't exist
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [blockchainConfig.metamask]
                    });
                }
            }
        }
    };

    const checkUserType = async (userAccount) => {
        try {
            // Check if patient
            const patientInfo = await contract.methods.getPatientInfo(userAccount).call({ from: userAccount });
            setIsPatient(true);
            console.log('User is a patient:', patientInfo.name);
        } catch (error) {
            // Not a patient
        }

        try {
            // Check if doctor
            const doctorInfo = await contract.methods.getDoctorInfo(userAccount).call();
            setIsDoctor(true);
            console.log('User is a doctor:', doctorInfo.name);
        } catch (error) {
            // Not a doctor
        }
    };

    const registerAsPatient = async () => {
        if (!account || !contract) return;

        try {
            await contract.methods.registerPatient(
                'John Doe',
                'john@example.com',
                Math.floor(Date.now() / 1000) - 86400 // Yesterday
            ).send({ from: account });

            alert('Registered as patient successfully!');
            await checkUserType(account);
        } catch (error) {
            console.error('Error registering as patient:', error);
            alert('Error registering as patient: ' + error.message);
        }
    };

    const registerAsDoctor = async () => {
        if (!account || !contract) return;

        try {
            await contract.methods.registerDoctor(
                'Dr. Smith',
                'MD12345',
                'General Medicine'
            ).send({ from: account });

            alert('Registered as doctor successfully!');
            await checkUserType(account);
        } catch (error) {
            console.error('Error registering as doctor:', error);
            alert('Error registering as doctor: ' + error.message);
        }
    };

    const requestPatientAccess = async (patientAddress) => {
        if (!account || !contract || !isDoctor) return;

        try {
            await contract.methods.requestPatientAccess(
                patientAddress,
                'Medical examination and consultation'
            ).send({ from: account });

            alert('Access request sent successfully!');
        } catch (error) {
            console.error('Error requesting access:', error);
            alert('Error requesting access: ' + error.message);
        }
    };

    return (
        <div className="vmedithon-app">
            <h1>🏥 Vmedithon - Blockchain Medical Records</h1>
            
            <div className="network-info">
                <p><strong>Network:</strong> {blockchainConfig.network.name}</p>
                <p><strong>Contract:</strong> {CONTRACT_ADDRESS}</p>
                {blockchainConfig.deployment.blockExplorer && (
                    <p>
                        <a href={blockchainConfig.deployment.blockExplorer} target="_blank" rel="noopener noreferrer">
                            View on Block Explorer
                        </a>
                    </p>
                )}
            </div>

            {!account ? (
                <button onClick={connectWallet}>Connect MetaMask</button>
            ) : (
                <div>
                    <p><strong>Connected Account:</strong> {account}</p>
                    
                    {!isPatient && !isDoctor && (
                        <div>
                            <h3>Register as:</h3>
                            <button onClick={registerAsPatient}>Patient</button>
                            <button onClick={registerAsDoctor}>Doctor</button>
                        </div>
                    )}

                    {isPatient && <p>✅ Registered as Patient</p>}
                    {isDoctor && <p>✅ Registered as Doctor</p>}

                    {isDoctor && (
                        <div>
                            <h3>Doctor Actions:</h3>
                            <input
                                type="text"
                                placeholder="Patient Address"
                                onChange={(e) => setPatientAddress(e.target.value)}
                            />
                            <button onClick={() => requestPatientAccess(patientAddress)}>
                                Request Patient Access
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VmedithonBlockchain;

/* 
Usage Instructions:

1. Copy the generated config files to your frontend project:
   - blockchain-config.js (main configuration)
   - Or use the .env variables

2. Install dependencies:
   npm install web3

3. Import and use:
   import VmedithonBlockchain from './VmedithonBlockchain';

4. Environment variables (for Next.js):
   Add to your .env.local:
   NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
   NEXT_PUBLIC_RPC_URL=your_rpc_url
   NEXT_PUBLIC_CHAIN_ID=your_chain_id

5. For production, update the network config based on your deployment
*/

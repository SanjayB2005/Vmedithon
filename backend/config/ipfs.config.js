// IPFS Configuration for different providers
require('dotenv').config();

const ipfsConfigs = {
  infura: {
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    auth: process.env.IPFS_AUTH, // Format: "project_id:project_secret"
    gateway: 'https://ipfs.io/ipfs'
  },
  pinata: {
    host: 'api.pinata.cloud',
    port: 443,
    protocol: 'https',
    auth: process.env.PINATA_JWT, // Use the JWT token
    gateway: process.env.GATEWAY_URL ? `https://${process.env.GATEWAY_URL}/ipfs` : 'https://gateway.pinata.cloud/ipfs'
  },
  local: {
    host: 'localhost',
    port: 5001,
    protocol: 'http',
    auth: null,
    gateway: 'http://localhost:5173/ipfs'
  },
  web3storage: {
    host: 'api.web3.storage',
    port: 443,
    protocol: 'https',
    auth: process.env.IPFS_AUTH, // Format: "Bearer your_api_token"
    gateway: 'https://w3s.link/ipfs'
  }
};

function getIPFSConfig() {
  const provider = process.env.IPFS_PROVIDER || 'infura';
  const config = ipfsConfigs[provider];
  if (!config) {
    throw new Error(`Unknown IPFS provider: ${provider}`);
  }
  return {
    ...config,
    host: process.env.IPFS_HOST || config.host,
    port: process.env.IPFS_PORT || config.port,
    protocol: process.env.IPFS_PROTOCOL || config.protocol,
    auth: process.env.IPFS_AUTH || config.auth,
    gateway: process.env.IPFS_GATEWAY || config.gateway
  };
}

module.exports = { ipfsConfigs, getIPFSConfig };

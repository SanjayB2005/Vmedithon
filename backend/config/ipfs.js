const { getIPFSConfig } = require('./ipfs.config');

/**
 * Initialize IPFS configuration
 * This function sets up the IPFS client configuration based on environment variables
 */
async function initializeIPFS() {
  try {
    const config = getIPFSConfig();
    console.log('✅ IPFS Configuration initialized');
    console.log(`📡 Provider: ${process.env.IPFS_PROVIDER || 'pinata'}`);
    console.log(`🌐 Gateway: ${config.gateway}`);
    return config;
  } catch (error) {
    console.error('❌ Failed to initialize IPFS configuration:', error.message);
    throw error;
  }
}

/**
 * Get IPFS client instance (if needed for direct IPFS operations)
 */
function getIPFSClient() {
  const config = getIPFSConfig();
  // For now, we're using direct API calls via axios instead of IPFS client
  // This function can be extended later if needed
  return config;
}

module.exports = {
  initializeIPFS,
  getIPFSClient,
  getIPFSConfig
};

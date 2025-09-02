const axios = require('axios');
require('dotenv').config();

const uploadToPinata = async (data) => {
  try {
    console.log('🔑 Using Pinata JWT (first 20 chars):', process.env.PINATA_JWT?.substring(0, 20) + '...');
    console.log('📤 Uploading data to Pinata:', JSON.stringify(data, null, 2));
    
    const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', data, {
      headers: {
        'Authorization': `Bearer ${process.env.PINATA_JWT}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Pinata upload successful:', response.data);
    console.log('📍 IPFS Hash:', response.data.IpfsHash);
    return response.data.IpfsHash;
  } catch (error) {
    console.error('❌ Pinata upload error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw new Error(`Pinata upload failed: ${error.response?.data?.error || error.message}`);
  }
};

const fetchFromPinata = async (hash) => {
  // Try multiple gateways in order of preference
  const gateways = [
    process.env.GATEWAY_URL ? `https://${process.env.GATEWAY_URL}` : null,
    'https://gateway.pinata.cloud',
    'https://ipfs.io'
  ].filter(Boolean);
  
  console.log('🔍 Attempting to fetch from gateways:', gateways);
  
  for (const gateway of gateways) {
    try {
      const url = `${gateway}/ipfs/${hash}`;
      console.log('🌐 Trying gateway:', url);
      const response = await axios.get(url, { timeout: 10000 });
      console.log('✅ Successfully fetched from:', url);
      return response.data;
    } catch (error) {
      console.log(`❌ Failed to fetch from ${gateway}:`, error.response?.status || error.message);
      continue; // Try next gateway
    }
  }
  
  throw new Error(`Failed to fetch data from all available gateways for hash: ${hash}`);
};

module.exports = { uploadToPinata, fetchFromPinata };
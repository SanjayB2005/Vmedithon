const FormData = require('form-data');
const https = require('https');
const { getIPFSConfig } = require('../config/ipfs.config');
const { initializeIPFS, getIPFSClient } = require('../config/ipfs');

// Helper function to make HTTP requests
function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ ok: res.statusCode < 400, status: res.statusCode, json: () => Promise.resolve(json), text: () => Promise.resolve(data) });
        } catch (e) {
          resolve({ ok: res.statusCode < 400, status: res.statusCode, text: () => Promise.resolve(data) });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      if (typeof options.body === 'string') {
        req.write(options.body);
      } else {
        options.body.pipe(req);
      }
    }
    req.end();
  });
}

class IPFSService {
  constructor() {
    this.config = getIPFSConfig();
    this.provider = process.env.IPFS_PROVIDER || 'infura';
    this.gateway = this.config.gateway;
    this.pinataJWT = process.env.PINATA_JWT;
    this.initialized = false;
  }

  async ensureInitialized() {
    if (!this.initialized) {
      try {
        await initializeIPFS();
        this.initialized = true;
        console.log(`IPFS Service initialized with provider: ${this.provider}`);
      } catch (error) {
        console.error('IPFS initialization failed:', error.message);
        if (this.provider === 'pinata') {
          // For Pinata, we can still work without the IPFS client
          this.initialized = true;
          console.log('Continuing with Pinata-only mode');
        } else {
          throw new Error('IPFS service not available');
        }
      }
    }
  }

  async uploadBase64Image(base64String, filename = 'image.jpg') {
    await this.ensureInitialized();
    const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    if (this.provider === 'pinata') {
      return await this.uploadToPinata(imageBuffer, filename);
    } else {
      return await this.uploadToIPFS(imageBuffer, filename);
    }
  }

  async uploadToPinata(imageBuffer, filename = 'image.jpg') {
    try {
      console.log('🔑 Using Pinata JWT (first 20 chars):', this.pinataJWT?.substring(0, 20) + '...');
      console.log('📸 Uploading image to Pinata:', filename, 'Size:', imageBuffer.length, 'bytes');
      
      const formData = new FormData();
      formData.append('file', imageBuffer, { filename, contentType: 'image/jpeg' });
      formData.append('pinataMetadata', JSON.stringify({ 
        name: filename, 
        keyvalues: { 
          app: 'VMedithon', 
          timestamp: new Date().toISOString(), 
          type: 'medical-image' 
        } 
      }));

      const response = await makeRequest('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${this.pinataJWT}`,
          ...formData.getHeaders()
        },
        body: formData
      });

      console.log('📡 Pinata response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Pinata upload failed:', response.status, errorText);
        throw new Error(`Pinata upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      const hash = result.IpfsHash;
      
      // Provide multiple gateway URLs
      const urls = {
        custom: process.env.GATEWAY_URL ? `https://${process.env.GATEWAY_URL}/ipfs/${hash}` : null,
        public: `https://gateway.pinata.cloud/ipfs/${hash}`,
        ipfs: `https://ipfs.io/ipfs/${hash}`
      };
      
      console.log('✅ Image uploaded to Pinata IPFS:', hash);
      console.log('🌐 Available URLs:', urls);
      console.log('📋 Full result:', result);
      
      return { 
        hash, 
        url: urls.public, // Use public gateway as default
        cid: hash, 
        urls: urls // Provide all available URLs
      };
    } catch (error) {
      console.error('❌ Pinata upload error:', error);
      throw new Error(`Failed to upload to Pinata: ${error.message}`);
    }
  }

  async uploadToIPFS(imageBuffer, filename = 'image.jpg') {
    try {
      const ipfs = getIPFSClient();
      if (!ipfs) {
        throw new Error('IPFS client not available');
      }

      const result = await ipfs.add(imageBuffer, {
        path: filename,
        pin: true
      });

      const hash = result.cid.toString();
      const url = this.getGatewayUrl(hash);
      console.log('Image uploaded to IPFS:', hash);
      return { hash, url, cid: hash };
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error(`Failed to upload to IPFS: ${error.message}`);
    }
  }

  getGatewayUrl(hash) {
    return `${this.gateway}/${hash}`;
  }
}

module.exports = IPFSService;

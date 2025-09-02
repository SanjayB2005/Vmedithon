const FormData = require('form-data');
const https = require('https');
const axios = require('axios');
const MedicalDocument = require('../models/medicalDocument');
require('dotenv').config();

class MedicalDocumentService {
  constructor() {
    this.pinataJWT = process.env.PINATA_JWT;
    this.publicGateways = [
      'https://ipfs.io',
      'https://gateway.ipfs.io', 
      'https://cloudflare-ipfs.com',
      'https://dweb.link'
    ];
  }

  // Upload medical document (JSON data)
  async uploadMedicalRecord(documentData, patientId, uploadedBy) {
    try {
      console.log('📄 Uploading medical record to IPFS...');
      
      // Structure the medical data
      const medicalRecord = {
        documentType: documentData.documentType,
        title: documentData.title,
        description: documentData.description,
        content: documentData.content,
        medicalInfo: {
          doctorId: documentData.doctorId,
          hospitalName: documentData.hospitalName,
          department: documentData.department,
          testDate: documentData.testDate,
          reportDate: documentData.reportDate,
          urgency: documentData.urgency || 'medium',
          tags: documentData.tags || []
        },
        timestamp: new Date().toISOString(),
        patient: patientId
      };

      // Upload to IPFS via Pinata
      const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', medicalRecord, {
        headers: {
          'Authorization': `Bearer ${this.pinataJWT}`,
          'Content-Type': 'application/json'
        }
      });

      const ipfsHash = response.data.IpfsHash;
      console.log('✅ Medical record uploaded to IPFS:', ipfsHash);

      // Save to MongoDB
      const document = await MedicalDocument.create({
        patient: patientId,
        documentType: documentData.documentType,
        title: documentData.title,
        description: documentData.description,
        ipfsHash: ipfsHash,
        fileInfo: {
          format: 'json',
          mimeType: 'application/json'
        },
        medicalInfo: medicalRecord.medicalInfo,
        metadata: {
          uploadedBy: uploadedBy,
          uploadDate: new Date()
        }
      });

      return {
        success: true,
        documentId: document._id,
        ipfsHash: ipfsHash,
        urls: this.generateGatewayUrls(ipfsHash),
        document: document
      };

    } catch (error) {
      console.error('❌ Medical record upload failed:', error);
      throw new Error(`Failed to upload medical record: ${error.message}`);
    }
  }

  // Upload medical files (images, PDFs, etc.)
  async uploadMedicalFile(fileBuffer, documentData, patientId, uploadedBy) {
    try {
      console.log('📁 Uploading medical file to IPFS...');
      
      const formData = new FormData();
      formData.append('file', fileBuffer, { 
        filename: documentData.filename,
        contentType: documentData.mimeType 
      });
      
      formData.append('pinataMetadata', JSON.stringify({
        name: documentData.title,
        keyvalues: {
          documentType: documentData.documentType,
          patientId: patientId.toString(),
          hospitalName: documentData.hospitalName || 'VMedithon',
          department: documentData.department || 'General',
          uploadDate: new Date().toISOString()
        }
      }));

      const response = await this.makeRequest('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.pinataJWT}`,
          ...formData.getHeaders()
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      const ipfsHash = result.IpfsHash;
      console.log('✅ Medical file uploaded to IPFS:', ipfsHash);

      // Save to MongoDB
      const document = await MedicalDocument.create({
        patient: patientId,
        documentType: documentData.documentType,
        title: documentData.title,
        description: documentData.description,
        ipfsHash: ipfsHash,
        fileInfo: {
          originalName: documentData.filename,
          mimeType: documentData.mimeType,
          size: fileBuffer.length,
          format: documentData.format || 'file'
        },
        medicalInfo: {
          doctorId: documentData.doctorId,
          hospitalName: documentData.hospitalName,
          department: documentData.department,
          testDate: documentData.testDate,
          reportDate: documentData.reportDate,
          urgency: documentData.urgency || 'medium',
          tags: documentData.tags || []
        },
        metadata: {
          uploadedBy: uploadedBy,
          uploadDate: new Date()
        }
      });

      return {
        success: true,
        documentId: document._id,
        ipfsHash: ipfsHash,
        urls: this.generateGatewayUrls(ipfsHash),
        document: document
      };

    } catch (error) {
      console.error('❌ Medical file upload failed:', error);
      throw new Error(`Failed to upload medical file: ${error.message}`);
    }
  }

  // Retrieve medical document
  async retrieveMedicalDocument(ipfsHash) {
    try {
      console.log('🔍 Retrieving medical document from IPFS...');
      
      for (const gateway of this.publicGateways) {
        try {
          const url = `${gateway}/ipfs/${ipfsHash}`;
          console.log('🌐 Trying gateway:', url);
          
          const response = await axios.get(url, { 
            timeout: 15000,
            responseType: 'json'
          });
          
          console.log('✅ Successfully retrieved from:', url);
          return {
            success: true,
            data: response.data,
            retrievedFrom: url
          };
        } catch (error) {
          console.log(`❌ Failed to retrieve from ${gateway}:`, error.message);
          continue;
        }
      }
      
      throw new Error('Failed to retrieve from all gateways');
    } catch (error) {
      console.error('❌ Document retrieval failed:', error);
      throw new Error(`Failed to retrieve document: ${error.message}`);
    }
  }

  // Get patient's medical documents
  async getPatientDocuments(patientId, documentType = null) {
    try {
      const query = { 
        patient: patientId, 
        'metadata.isActive': true 
      };
      
      if (documentType) {
        query.documentType = documentType;
      }

      const documents = await MedicalDocument.find(query)
        .populate('patient', 'name walletAddress')
        .populate('medicalInfo.doctorId', 'name')
        .populate('metadata.uploadedBy', 'name')
        .sort({ 'metadata.uploadDate': -1 });

      return {
        success: true,
        documents: documents.map(doc => ({
          ...doc.toObject(),
          urls: this.generateGatewayUrls(doc.ipfsHash)
        }))
      };
    } catch (error) {
      console.error('❌ Failed to get patient documents:', error);
      throw new Error(`Failed to retrieve patient documents: ${error.message}`);
    }
  }

  // Helper methods
  generateGatewayUrls(ipfsHash) {
    return {
      ipfs: `https://ipfs.io/ipfs/${ipfsHash}`,
      gateway: `https://gateway.ipfs.io/ipfs/${ipfsHash}`,
      cloudflare: `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
      dweb: `https://dweb.link/ipfs/${ipfsHash}`
    };
  }

  makeRequest(url, options) {
    return new Promise((resolve, reject) => {
      const req = https.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({ 
              ok: res.statusCode < 400, 
              status: res.statusCode, 
              json: () => Promise.resolve(json)
            });
          } catch (e) {
            resolve({ 
              ok: res.statusCode < 400, 
              status: res.statusCode, 
              text: () => Promise.resolve(data) 
            });
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
}

module.exports = MedicalDocumentService;

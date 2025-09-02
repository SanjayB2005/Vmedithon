const express = require('express');
const router = express.Router();
const MedicalDocumentService = require('../services/medicalDocumentService');
const medicalDocService = new MedicalDocumentService();

// Upload medical record (JSON data)
router.post('/record', async (req, res) => {
  try {
    const { documentData, patientId, uploadedBy } = req.body;
    
    if (!documentData || !patientId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: documentData and patientId' 
      });
    }

    const result = await medicalDocService.uploadMedicalRecord(documentData, patientId, uploadedBy);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload medical file (image, PDF, etc.)
router.post('/file', async (req, res) => {
  try {
    const { fileBase64, documentData, patientId, uploadedBy } = req.body;
    
    if (!fileBase64 || !documentData || !patientId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: fileBase64, documentData, and patientId' 
      });
    }

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(fileBase64.replace(/^data:.*,/, ''), 'base64');
    
    const result = await medicalDocService.uploadMedicalFile(fileBuffer, documentData, patientId, uploadedBy);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Retrieve medical document by IPFS hash
router.get('/retrieve/:ipfsHash', async (req, res) => {
  try {
    const { ipfsHash } = req.params;
    const result = await medicalDocService.retrieveMedicalDocument(ipfsHash);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all medical documents for a patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { documentType } = req.query;
    
    const result = await medicalDocService.getPatientDocuments(patientId, documentType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get medical document info by MongoDB ID
router.get('/info/:documentId', async (req, res) => {
  try {
    const MedicalDocument = require('../models/medicalDocument');
    const document = await MedicalDocument.findById(req.params.documentId)
      .populate('patient', 'name walletAddress')
      .populate('medicalInfo.doctorId', 'name')
      .populate('metadata.uploadedBy', 'name');
    
    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    res.json({
      success: true,
      document: {
        ...document.toObject(),
        urls: medicalDocService.generateGatewayUrls(document.ipfsHash)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

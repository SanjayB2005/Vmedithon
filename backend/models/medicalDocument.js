const mongoose = require('mongoose');

const medicalDocumentSchema = new mongoose.Schema({
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  documentType: { 
    type: String, 
    enum: [
      'blood_test', 
      'scan_report', 
      'doctor_remarks', 
      'prescription', 
      'medical_history', 
      'lab_report',
      'x_ray',
      'mri_scan',
      'ct_scan',
      'ultrasound',
      'diagnosis',
      'treatment_plan',
      'discharge_summary',
      'vaccination_record',
      'other'
    ], 
    required: true 
  },
  title: { type: String, required: true },
  description: String,
  ipfsHash: { type: String, required: true },
  fileInfo: {
    originalName: String,
    mimeType: String,
    size: Number,
    format: String // 'json', 'image', 'pdf', 'text'
  },
  medicalInfo: {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    hospitalName: String,
    department: String,
    testDate: Date,
    reportDate: Date,
    urgency: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    tags: [String]
  },
  metadata: {
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadDate: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now },
    version: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true }
  }
});

module.exports = mongoose.model('MedicalDocument', medicalDocumentSchema);

const mongoose = require('mongoose');


const patientRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ipfsHash: { type: String, required: true },
  source: { type: String, enum: ['bridge', 'doctor', 'management', 'watch'], required: true },
  metadata: {
    timestamp: { type: Date, default: Date.now },
    notes: String,
    bp: String,
    waterIntake: String,
    otherVitals: Object,
    managementData: Object,
    doctorNotes: String,
    // Add more fields as needed
  },
});

module.exports = mongoose.model('PatientRecord', patientRecordSchema);

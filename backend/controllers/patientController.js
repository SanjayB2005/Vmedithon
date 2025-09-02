// Handles patient record CRUD and IPFS logic
const PatientRecord = require('../models/patientRecord');
const { uploadToIPFS, fetchFromIPFS } = require('../services/ipfsService');

exports.getAllRecords = async (req, res) => {
  try {
    const records = await PatientRecord.find().populate('patient', 'walletAddress name role');
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createRecord = async (req, res) => {
  try {
    const { patientId, data, notes } = req.body;
    const ipfsHash = await uploadToIPFS(data);
    const record = await PatientRecord.create({
      patient: patientId,
      ipfsHash,
      metadata: { notes },
    });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecord = async (req, res) => {
  try {
    const record = await PatientRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Not found' });
    const data = await fetchFromIPFS(record.ipfsHash);
    res.json({ ...record.toObject(), data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.updateRecord = async (req, res) => {
  try {
    const record = await PatientRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    const record = await PatientRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

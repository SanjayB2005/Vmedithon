const express = require('express');
const router = express.Router();
const { uploadToPinata, fetchFromPinata } = require('../services/pinataService');

// Upload data to Pinata
router.post('/upload', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'Missing data' });
    const hash = await uploadToPinata(data);
    res.json({ ipfsHash: hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch data from Pinata by hash
router.get('/fetch/:hash', async (req, res) => {
  try {
    const data = await fetchFromPinata(req.params.hash);
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

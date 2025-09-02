const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  name: String,
  role: { type: String, enum: ['patient', 'doctor', 'management', 'bridge'], required: true },
  email: String,
  phone: String,
  profile: {
    age: Number,
    gender: String,
    medicalHistory: String,
    // Add more fields as needed
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);

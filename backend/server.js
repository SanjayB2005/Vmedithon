require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const { initializeIPFS } = require('./config/ipfs');
const patientRoutes = require('./routes/patientRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');
const healthRoutes = require('./routes/healthRoutes');
const userRoutes = require('./routes/userRoutes');
const ipfsRoutes = require('./routes/ipfsRoutes');
const pinataRoutes = require('./routes/pinataRoutes');
const medicalDocumentRoutes = require('./routes/medicalDocumentRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize services
async function startServer() {
  try {
    // Connect to database
    await connectDB();

    // Initialize IPFS
    await initializeIPFS();
    console.log('All services initialized successfully');

    // Set up routes
    app.use('/api/patients', patientRoutes);
    app.use('/api/blockchain', blockchainRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/ipfs', ipfsRoutes);
    app.use('/api/pinata', pinataRoutes);
    app.use('/api/medical-documents', medicalDocumentRoutes);
    app.use('/api/health', healthRoutes);

    app.use(errorHandler);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

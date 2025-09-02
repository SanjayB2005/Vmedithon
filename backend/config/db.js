// MongoDB connection setup
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection URI:', mongoURI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    
    await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database name:', mongoose.connection.name);
    
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    
    // Provide helpful error messages based on error type
    if (err.message.includes('ECONNREFUSED')) {
      console.error('💡 Suggestion: Make sure MongoDB is running locally or check your Atlas connection string');
    } else if (err.message.includes('authentication failed')) {
      console.error('💡 Suggestion: Check your MongoDB username and password');
    } else if (err.message.includes('getaddrinfo ENOTFOUND')) {
      console.error('💡 Suggestion: Check your MongoDB Atlas cluster URL');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;

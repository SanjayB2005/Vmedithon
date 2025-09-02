// Test script for IPFS API with Pinata
const fs = require('fs');
const path = require('path');

// Sample base64 image data (a small 1x1 pixel PNG)
const sampleBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

// Sample JSON data for medical record
const sampleMedicalData = {
  patientId: 'PAT-001',
  recordType: 'X-Ray',
  date: new Date().toISOString(),
  diagnosis: 'Sample chest X-ray report',
  doctor: 'Dr. Smith',
  hospital: 'VMedithon Hospital'
};

async function testIPFSUpload() {
  try {
    console.log('🧪 Testing IPFS Image Upload...');
    
    // Test image upload
    const imageResponse = await fetch('http://localhost:5000/api/ipfs/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: sampleBase64Image,
        filename: 'test-xray.png'
      })
    });

    const imageResult = await imageResponse.json();
    console.log('📸 Image Upload Result:', imageResult);

    if (imageResult.success) {
      console.log('✅ Image uploaded successfully!');
      console.log('🔗 IPFS Hash:', imageResult.hash);
      console.log('🌐 Gateway URL:', imageResult.url);
      
      // Test retrieval
      console.log('\n🔍 Testing IPFS Retrieval...');
      const retrieveResponse = await fetch(`http://localhost:5000/api/ipfs/${imageResult.hash}`);
      const retrieveResult = await retrieveResponse.json();
      console.log('📥 Retrieval Result:', retrieveResult);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testWithCurl() {
  console.log('\n📋 cURL Commands for Manual Testing:');
  console.log('\n1. Upload Image:');
  console.log(`curl -X POST http://localhost:5000/api/ipfs/upload \\
  -H "Content-Type: application/json" \\
  -d '{
    "imageBase64": "${sampleBase64Image}",
    "filename": "test-image.png"
  }'`);
  
  console.log('\n2. Retrieve by Hash (replace HASH with actual hash):');
  console.log('curl http://localhost:5000/api/ipfs/YOUR_HASH_HERE');
}

// Run tests
console.log('🚀 Starting IPFS API Tests with Pinata...\n');

setTimeout(async () => {
  await testIPFSUpload();
  await testWithCurl();
}, 1000);

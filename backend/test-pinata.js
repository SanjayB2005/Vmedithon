// Simple test script for Pinata uploads
require('dotenv').config();

async function testPinataUpload() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('🚀 Starting Pinata Upload Tests...\n');
  
  // Test 1: JSON Upload
  console.log('📄 Test 1: Uploading JSON data...');
  try {
    const response = await fetch(`${baseUrl}/api/pinata/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          test: 'Hello Pinata',
          timestamp: new Date().toISOString(),
          patient: 'Test Patient'
        }
      })
    });
    
    const result = await response.json();
    console.log('✅ JSON Upload Result:', result);
    
    if (result.ipfsHash) {
      console.log('🔗 Gateway URL:', `https://coral-hollow-amphibian-910.mypinata.cloud/ipfs/${result.ipfsHash}`);
    }
  } catch (error) {
    console.error('❌ JSON Upload Failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Image Upload
  console.log('🖼️ Test 2: Uploading base64 image...');
  try {
    const response = await fetch(`${baseUrl}/api/ipfs/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        filename: 'test-upload.png'
      })
    });
    
    const result = await response.json();
    console.log('✅ Image Upload Result:', result);
    
    if (result.url) {
      console.log('🌐 Image URL:', result.url);
    }
  } catch (error) {
    console.error('❌ Image Upload Failed:', error.message);
  }
}

// Wait a bit and run tests
setTimeout(() => {
  testPinataUpload().catch(console.error);
}, 2000);

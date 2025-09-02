// Comprehensive test for Medical Documents IPFS system
require('dotenv').config();

const sampleMedicalRecords = {
  bloodTest: {
    documentType: 'blood_test',
    title: 'Complete Blood Count (CBC)',
    description: 'Routine blood work for annual check-up',
    content: {
      testResults: {
        hemoglobin: '14.2 g/dL',
        whiteBloodCells: '7,200/μL',
        redBloodCells: '4.8 million/μL',
        platelets: '285,000/μL',
        hematocrit: '42%'
      },
      normalRanges: {
        hemoglobin: '12.0-16.0 g/dL',
        whiteBloodCells: '4,000-11,000/μL',
        redBloodCells: '4.2-5.4 million/μL',
        platelets: '150,000-400,000/μL',
        hematocrit: '36-46%'
      },
      interpretation: 'All values within normal range',
      recommendations: 'Continue regular check-ups'
    },
    hospitalName: 'VMedithon General Hospital',
    department: 'Laboratory',
    testDate: '2025-09-01',
    reportDate: '2025-09-02',
    urgency: 'low',
    tags: ['routine', 'annual-checkup', 'normal']
  },

  doctorRemarks: {
    documentType: 'doctor_remarks',
    title: 'Consultation Notes - Diabetes Follow-up',
    description: 'Follow-up consultation for Type 2 Diabetes management',
    content: {
      symptoms: ['Increased thirst', 'Frequent urination'],
      examination: {
        bloodPressure: '130/80 mmHg',
        weight: '75 kg',
        height: '170 cm',
        bmi: '26.0'
      },
      assessment: 'Type 2 Diabetes - well controlled',
      plan: [
        'Continue current medication regimen',
        'Monitor blood glucose levels daily',
        'Schedule follow-up in 3 months'
      ],
      medications: [
        { name: 'Metformin', dosage: '500mg', frequency: 'twice daily' },
        { name: 'Glipizide', dosage: '5mg', frequency: 'once daily' }
      ]
    },
    hospitalName: 'VMedithon Medical Center',
    department: 'Endocrinology',
    testDate: '2025-09-02',
    reportDate: '2025-09-02',
    urgency: 'medium',
    tags: ['diabetes', 'follow-up', 'controlled']
  },

  prescription: {
    documentType: 'prescription',
    title: 'Post-Surgery Medication',
    description: 'Prescription following appendectomy procedure',
    content: {
      medications: [
        {
          name: 'Amoxicillin',
          dosage: '500mg',
          frequency: 'three times daily',
          duration: '7 days',
          instructions: 'Take with food'
        },
        {
          name: 'Ibuprofen',
          dosage: '400mg',
          frequency: 'as needed for pain',
          duration: '5 days',
          instructions: 'Maximum 3 times daily'
        }
      ],
      instructions: [
        'Complete the full course of antibiotics',
        'Take pain medication as needed',
        'Return if symptoms worsen'
      ],
      nextAppointment: '2025-09-10'
    },
    hospitalName: 'VMedithon Surgical Center',
    department: 'Surgery',
    testDate: '2025-09-02',
    reportDate: '2025-09-02',
    urgency: 'high',
    tags: ['post-surgery', 'antibiotics', 'pain-management']
  }
};

const sampleBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

async function testMedicalDocuments() {
  const baseUrl = 'http://localhost:5000';
  console.log('🏥 Starting Medical Documents IPFS Tests...\n');

  // Test 1: Upload Blood Test Record
  console.log('🩸 Test 1: Uploading Blood Test Record...');
  try {
    const response = await fetch(`${baseUrl}/api/medical-documents/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentData: sampleMedicalRecords.bloodTest,
        patientId: '66d123456789012345678901', // Replace with actual patient ObjectId
        uploadedBy: '66d123456789012345678902'  // Replace with actual user ObjectId
      })
    });

    const result = await response.json();
    console.log('✅ Blood Test Upload Result:', result);
    
    if (result.success) {
      console.log('📋 Document ID:', result.documentId);
      console.log('🔗 IPFS Hash:', result.ipfsHash);
      console.log('🌐 Gateway URLs:', result.urls);
    }
  } catch (error) {
    console.error('❌ Blood Test Upload Failed:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Upload Doctor Remarks
  console.log('👨‍⚕️ Test 2: Uploading Doctor Remarks...');
  try {
    const response = await fetch(`${baseUrl}/api/medical-documents/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentData: sampleMedicalRecords.doctorRemarks,
        patientId: '66d123456789012345678901',
        uploadedBy: '66d123456789012345678903'
      })
    });

    const result = await response.json();
    console.log('✅ Doctor Remarks Upload Result:', result);
  } catch (error) {
    console.error('❌ Doctor Remarks Upload Failed:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 3: Upload Medical File (X-Ray Image)
  console.log('📸 Test 3: Uploading Medical File (X-Ray)...');
  try {
    const response = await fetch(`${baseUrl}/api/medical-documents/file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileBase64: sampleBase64Image,
        documentData: {
          documentType: 'x_ray',
          title: 'Chest X-Ray',
          description: 'Chest X-ray for respiratory symptoms',
          filename: 'chest-xray-20250902.png',
          mimeType: 'image/png',
          format: 'image',
          hospitalName: 'VMedithon Radiology Center',
          department: 'Radiology',
          testDate: '2025-09-02',
          reportDate: '2025-09-02',
          urgency: 'medium',
          tags: ['chest', 'respiratory', 'routine']
        },
        patientId: '66d123456789012345678901',
        uploadedBy: '66d123456789012345678904'
      })
    });

    const result = await response.json();
    console.log('✅ Medical File Upload Result:', result);
    
    if (result.success) {
      console.log('📁 File Document ID:', result.documentId);
      console.log('🔗 File IPFS Hash:', result.ipfsHash);
      console.log('🌐 File Gateway URLs:', result.urls);
    }
  } catch (error) {
    console.error('❌ Medical File Upload Failed:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 4: Upload Prescription
  console.log('💊 Test 4: Uploading Prescription...');
  try {
    const response = await fetch(`${baseUrl}/api/medical-documents/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentData: sampleMedicalRecords.prescription,
        patientId: '66d123456789012345678901',
        uploadedBy: '66d123456789012345678905'
      })
    });

    const result = await response.json();
    console.log('✅ Prescription Upload Result:', result);
  } catch (error) {
    console.error('❌ Prescription Upload Failed:', error.message);
  }

  console.log('\n' + '🏁 Testing completed! Check your IPFS gateways to verify uploads.');
  console.log('\n📋 API Endpoints for Manual Testing:');
  console.log('POST /api/medical-documents/record - Upload medical record (JSON)');
  console.log('POST /api/medical-documents/file - Upload medical file');
  console.log('GET  /api/medical-documents/patient/:patientId - Get patient documents');
  console.log('GET  /api/medical-documents/retrieve/:ipfsHash - Retrieve document');
  console.log('GET  /api/medical-documents/info/:documentId - Get document info');
}

// Wait and run tests
setTimeout(() => {
  testMedicalDocuments().catch(console.error);
}, 2000);

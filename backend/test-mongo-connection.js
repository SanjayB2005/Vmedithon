require('dotenv').config();

// Test MongoDB Atlas connection with detailed debugging
const mongoose = require('mongoose');

async function testConnection() {
    console.log('🔍 MongoDB Atlas Connection Test');
    console.log('================================');
    
    const mongoURI = process.env.MONGO_URI;
    console.log('URI (masked):', mongoURI.replace(/\/\/.*@/, '//***:***@'));
    
    // Extract components for validation
    const uriMatch = mongoURI.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)/);
    
    if (uriMatch) {
        const [, username, password, cluster, dbAndParams] = uriMatch;
        console.log('\n📋 Connection Details:');
        console.log('Username:', username);
        console.log('Password length:', password.length);
        console.log('Cluster:', cluster);
        console.log('Database:', dbAndParams.split('?')[0]);
        
        // Check for special characters that need encoding
        const specialChars = /[!@#$%^&*()+=\[\]{}|\\:";'<>?,./]/;
        if (specialChars.test(password)) {
            console.log('\n⚠️  WARNING: Password contains special characters');
            console.log('   Original password:', password);
            console.log('   URL encoded password:', encodeURIComponent(password));
            console.log('   Try using the encoded version in your connection string');
        }
    }
    
    console.log('\n🔄 Testing connection...');
    
    try {
        await mongoose.connect(mongoURI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4,
        });
        
        console.log('✅ Connection successful!');
        console.log('📊 Connected to database:', mongoose.connection.name);
        console.log('🏠 Host:', mongoose.connection.host);
        console.log('📡 Ready state:', mongoose.connection.readyState);
        
        // Test a simple operation
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📁 Collections found:', collections.length);
        
        await mongoose.disconnect();
        console.log('✅ Test completed successfully');
        
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        
        // Provide specific troubleshooting tips
        if (error.message.includes('bad auth')) {
            console.log('\n💡 Authentication Failed - Try these fixes:');
            console.log('   1. Check username and password in MongoDB Atlas');
            console.log('   2. Ensure database user has proper permissions');
            console.log('   3. URL-encode special characters in password');
            console.log('   4. Verify the database name exists');
        } else if (error.message.includes('ENOTFOUND')) {
            console.log('\n💡 DNS/Network Issue - Try these fixes:');
            console.log('   1. Check cluster URL is correct');
            console.log('   2. Ensure network access is configured (IP whitelist)');
            console.log('   3. Try connecting from MongoDB Compass first');
        } else if (error.message.includes('timeout')) {
            console.log('\n💡 Connection Timeout - Try these fixes:');
            console.log('   1. Check your internet connection');
            console.log('   2. Verify firewall settings');
            console.log('   3. Try increasing serverSelectionTimeoutMS');
        }
        
        process.exit(1);
    }
}

testConnection();

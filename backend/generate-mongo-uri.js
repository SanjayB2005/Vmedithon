// MongoDB Atlas Connection String Generator
console.log('🔧 MongoDB Atlas Connection String Helper');
console.log('========================================\n');

// Function to URL encode password
function generateConnectionString(username, password, cluster, database) {
    const encodedPassword = encodeURIComponent(password);
    const connectionString = `mongodb+srv://${username}:${encodedPassword}@${cluster}/${database}?retryWrites=true&w=majority`;
    return connectionString;
}

// Current details from your .env
const currentUsername = 'Sanjay';
const currentPassword = 'Sanjay2020';
const currentCluster = 'mernstack.bad8g.mongodb.net';
const currentDatabase = 'vmedithon';

console.log('📋 Current Configuration:');
console.log('Username:', currentUsername);
console.log('Password:', currentPassword);
console.log('Cluster:', currentCluster);
console.log('Database:', currentDatabase);

console.log('\n🔗 Generated Connection String:');
const connectionString = generateConnectionString(currentUsername, currentPassword, currentCluster, currentDatabase);
console.log(connectionString);

console.log('\n✅ Steps to fix authentication:');
console.log('1. Go to MongoDB Atlas → Database Access');
console.log('2. Create/verify user with these credentials:');
console.log(`   Username: ${currentUsername}`);
console.log(`   Password: ${currentPassword}`);
console.log('3. Set permissions to: "Atlas admin" or "Read and write to any database"');
console.log('4. Go to Network Access → Add IP Address: 0.0.0.0/0 (for testing)');
console.log('5. Replace MONGO_URI in .env with the connection string above');

console.log('\n🔧 Alternative - Generate new secure credentials:');
const newUsername = 'vmedithon_user';
const newPassword = 'VMed' + Math.random().toString(36).substring(2, 15) + '2024';
console.log('New Username:', newUsername);
console.log('New Password:', newPassword);
console.log('New Connection String:');
console.log(generateConnectionString(newUsername, newPassword, currentCluster, currentDatabase));

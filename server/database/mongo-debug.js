/**
 * MongoDB Connection Debug Script
 * 
 * This script attempts to connect to MongoDB using different connection strings
 * to help diagnose connection issues in different environments.
 * 
 * Usage: node mongo-debug.js [MONGODB_URI]
 */

const mongoose = require('mongoose');

// Get MongoDB URI from command line or environment variable
let providedURI = process.argv[2] || process.env.MONGODB_URI;

// Array of URIs to test
const urisToTest = [
  providedURI,
  "mongodb://mongo:27017/purchasePortalDB",
  "mongodb://localhost:27017/purchasePortalDB",
  "mongodb://127.0.0.1:27017/purchasePortalDB",
];

// Filter out undefined/null URIs
const testURIs = urisToTest.filter(uri => uri);

// Connection options
const options = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  useNewUrlParser: true,
  useUnifiedTopology: true
};

// Function to test a connection URI
async function testConnection(uri) {
  console.log(`Testing connection to: ${uri.replace(/mongodb(\+srv)?:\/\/[^:]+:[^@]+@/, 'mongodb$1://***:***@')}`);
  
  try {
    const startTime = Date.now();
    await mongoose.connect(uri, options);
    const endTime = Date.now();
    
    console.log(`✅ SUCCESS: Connected to MongoDB (${endTime - startTime}ms)`);
    console.log(`  - Connection state: ${mongoose.connection.readyState}`);
    console.log(`  - Database name: ${mongoose.connection.name}`);
    
    // Get server info
    const admin = mongoose.connection.db.admin();
    try {
      const serverInfo = await admin.serverInfo();
      console.log(`  - MongoDB version: ${serverInfo.version}`);
    } catch (e) {
      console.log(`  - Could not get server info: ${e.message}`);
    }
    
    // Try to execute a simple command
    try {
      const stats = await mongoose.connection.db.stats();
      console.log(`  - Database stats: ${stats.ok === 1 ? 'available' : 'unavailable'}`);
    } catch (e) {
      console.log(`  - Database commands not working: ${e.message}`);
    }
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log(`❌ FAILED: ${error.name}: ${error.message}`);
    if (error.name === 'MongoServerSelectionError') {
      console.log(`  - Server selection timed out. Check if MongoDB is running and accessible.`);
    }
    if (mongoose.connection) {
      await mongoose.disconnect().catch(() => {});
    }
    return false;
  }
}

// Main function to test all URIs
async function main() {
  console.log('MongoDB Connection Diagnostic Tool');
  console.log('=================================');
  
  if (testURIs.length === 0) {
    console.log('No MongoDB URIs provided. Please set MONGODB_URI environment variable or pass as argument.');
    return;
  }
  
  console.log(`Testing ${testURIs.length} MongoDB connection strings...`);
  
  let successCount = 0;
  
  for (const uri of testURIs) {
    console.log('\n---------------------------------------');
    const success = await testConnection(uri);
    if (success) successCount++;
  }
  
  console.log('\n=================================');
  console.log(`Results: ${successCount}/${testURIs.length} connections successful`);
  
  if (successCount === 0) {
    console.log('\nTroubleshooting tips:');
    console.log('1. Ensure MongoDB is running and accessible from this container/environment');
    console.log('2. Check if the MongoDB URI is correct (including username/password)');
    console.log('3. Verify network connectivity (especially in containerized environments)');
    console.log('4. Check if MongoDB requires TLS/SSL connections');
    console.log('5. Verify firewall rules allow connections to MongoDB port');
  }
}

main().catch(console.error);

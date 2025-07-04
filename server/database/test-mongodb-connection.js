/**
 * MongoDB Connection Test Script
 * 
 * This script provides a direct test of the MongoDB connection without Mongoose.
 * It can be useful to diagnose connection issues before attempting to use Mongoose.
 */

const { MongoClient } = require('mongodb');

// Get MongoDB URI from environment variable
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/purchasePortalDB";

// Log a sanitized version of the URI (hiding credentials)
console.log("Testing connection to:", uri.replace(/mongodb(\+srv)?:\/\/[^:]+:[^@]+@/, 'mongodb$1://***:***@'));

// Connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000
};

// Add additional options for Atlas connections
if (uri.includes('mongodb+srv')) {
  options.retryWrites = true;
  options.w = 'majority';
  
  // If not already specified in URI
  if (!uri.includes('authSource=')) {
    console.log("Note: Consider adding 'authSource=admin' to your connection string");
  }
}

async function testConnection() {
  const client = new MongoClient(uri, options);
  
  try {
    console.log("Connecting to MongoDB...");
    const startTime = Date.now();
    await client.connect();
    const connectionTime = Date.now() - startTime;
    console.log(`Connected successfully in ${connectionTime}ms`);
    
    // Test basic operations
    try {
      // Get server info
      const serverInfo = await client.db().admin().serverInfo();
      console.log("MongoDB version:", serverInfo.version);
      
      // List databases
      const dbListResult = await client.db().admin().listDatabases();
      console.log("Available databases:", dbListResult.databases.map(db => db.name).join(', '));
      
      // Test database access
      const dbName = uri.split('/').pop().split('?')[0];
      console.log(`Testing access to database: ${dbName}`);
      
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      
      if (collections.length === 0) {
        console.log(`No collections found in ${dbName}`);
      } else {
        console.log(`Available collections in ${dbName}:`, collections.map(c => c.name).join(', '));
        
        // Test accessing the reviews collection
        if (collections.some(c => c.name === 'reviews')) {
          const reviewCount = await db.collection('reviews').countDocuments();
          console.log(`Found ${reviewCount} documents in the reviews collection`);
        }
      }
    } catch (opError) {
      console.error("Error performing database operations:", opError.message);
    }
    
    console.log("Test completed successfully!");
    return true;
  } catch (err) {
    console.error("MongoDB connection error:", err.name);
    console.error("Error message:", err.message);
    
    // Additional diagnostics for common errors
    if (err.name === 'MongoServerSelectionError') {
      console.log("\nThis error typically occurs when:");
      console.log("1. The MongoDB server is not running");
      console.log("2. Your IP address is not whitelisted in MongoDB Atlas");
      console.log("3. There are network connectivity issues");
      console.log("4. The connection URI is incorrect");
      
      if (uri.includes('mongodb+srv')) {
        console.log("\nFor MongoDB Atlas connections on Render:");
        console.log("- Make sure to whitelist '0.0.0.0/0' in Atlas Network Access");
        console.log("- Or add Render's specific IP ranges");
        console.log("- Check that your database user has the correct privileges");
        console.log("- Verify your Atlas cluster is running (not paused)");
      }
    }
    
    return false;
  } finally {
    await client.close();
    console.log("Connection closed");
  }
}

// Run the test
testConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(() => {
    process.exit(1);
  });

/**
 * MongoDB Authentication Test Script
 * 
 * This script is specifically designed to diagnose MongoDB authentication issues
 * by performing detailed credential validation and providing actionable fixes.
 */

const { MongoClient } = require('mongodb');
const readline = require('readline');

// Get MongoDB URI from environment variable or prompt for it
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.log('No MONGODB_URI environment variable found.');
  console.log('You need to provide a MongoDB connection string to test.');
  process.exit(1);
}

// Parse the URI to extract authentication information
function parseUri(uri) {
  try {
    // Extract basic components
    const isAtlas = uri.includes('mongodb+srv');
    let username, password, host, dbName, options = {};
    
    // Extract username and password
    const authPart = uri.split('@')[0].replace(/mongodb(\+srv)?:\/\//, '');
    if (authPart.includes(':')) {
      [username, password] = authPart.split(':');
    }
    
    // Extract host
    const hostPart = uri.split('@')[1]?.split('/')[0];
    
    // Extract database name
    const dbPart = uri.split('/').slice(-1)[0];
    dbName = dbPart.split('?')[0];
    
    // Extract query parameters
    const queryString = uri.split('?')[1];
    if (queryString) {
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=');
        options[key] = value;
      });
    }
    
    return {
      isAtlas,
      username,
      password: password ? '********' : undefined, // Mask for security
      host,
      dbName,
      options,
      hasAuthSource: options.hasOwnProperty('authSource')
    };
  } catch (err) {
    return { error: 'Failed to parse URI: ' + err.message };
  }
}

// Analyze the connection URI
const uriInfo = parseUri(uri);
console.log('\n====== MongoDB Connection Analysis ======');

if (uriInfo.error) {
  console.error(uriInfo.error);
  process.exit(1);
}

console.log(`Connection Type: ${uriInfo.isAtlas ? 'MongoDB Atlas (SRV)' : 'Standard MongoDB'}`);
console.log(`Username: ${uriInfo.username || 'Not provided'}`);
console.log(`Password: ${uriInfo.password ? 'Provided (hidden)' : 'Not provided'}`);
console.log(`Host: ${uriInfo.host || 'Unknown'}`);
console.log(`Database: ${uriInfo.dbName || 'Not specified'}`);
console.log(`Auth Source Specified: ${uriInfo.hasAuthSource ? 'Yes' : 'No'}`);

// Connection options with extended timeouts for cloud environments
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000
};

async function testConnection() {
  const client = new MongoClient(uri, options);
  
  try {
    console.log("\n====== Testing Authentication ======");
    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connection successful!");
    
    // Test database access
    const dbName = uriInfo.dbName || 'admin';
    console.log(`\nTesting database access to: ${dbName}`);
    
    try {
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      
      console.log(`✅ Successfully accessed database '${dbName}'`);
      console.log(`Found ${collections.length} collections`);
      
      if (collections.length > 0) {
        console.log("Collections:", collections.map(c => c.name).join(', '));
      }
      
      return true;
    } catch (dbError) {
      console.error(`❌ Database access error: ${dbError.message}`);
      
      if (dbError.message.includes('not authorized')) {
        console.log("\n🔑 PERMISSION ISSUE DETECTED");
        console.log("Your MongoDB user has valid credentials but lacks permissions on this database.");
        console.log("\nPossible solutions:");
        console.log("1. Check which database the user is authorized to access");
        console.log("2. Grant the user appropriate roles for this database");
        console.log("3. Try specifying authSource in your connection string");
      }
      
      return false;
    }
  } catch (err) {
    console.error(`❌ Connection error: ${err.name}`);
    console.error(`Error message: ${err.message}`);
    
    if (err.message.includes('bad auth') || err.message.includes('authentication failed')) {
      console.log("\n🔑 AUTHENTICATION ISSUE DETECTED");
      console.log("The MongoDB server rejected your credentials.");
      
      console.log("\nPossible issues:");
      console.log("1. Username or password is incorrect");
      console.log("2. User doesn't exist in the specified auth database");
      console.log("3. Auth database isn't correctly specified");
      
      console.log("\nRecommended fixes:");
      if (!uriInfo.hasAuthSource) {
        console.log("- Add '?authSource=admin' to your connection string");
      }
      console.log("- Verify your username and password in MongoDB Atlas");
      console.log("- Check that the user exists and has appropriate roles");
      console.log("- Try creating a new database user with the same credentials");
    } else if (err.name === 'MongoServerSelectionError') {
      console.log("\n🔒 CONNECTION ISSUE DETECTED");
      console.log("\nPossible issues:");
      console.log("1. Your IP is not whitelisted in MongoDB Atlas");
      console.log("2. MongoDB Atlas cluster is paused or unavailable");
      console.log("3. Network connectivity problems");
      
      console.log("\nRecommended fixes:");
      console.log("- Whitelist IP address 0.0.0.0/0 in MongoDB Atlas Network Access");
      console.log("- Check if your MongoDB Atlas cluster is active");
      console.log("- Verify your network can reach MongoDB Atlas");
    }
    
    return false;
  } finally {
    await client.close();
    console.log("\nConnection closed");
  }
}

// Run the test
testConnection()
  .then(success => {
    if (success) {
      console.log("\n✅ AUTHENTICATION TEST PASSED");
      console.log("Your MongoDB connection and authentication are working correctly.");
    } else {
      console.log("\n❌ AUTHENTICATION TEST FAILED");
      console.log("Please review the issues and recommended fixes above.");
    }
    process.exit(success ? 0 : 1);
  })
  .catch(() => {
    process.exit(1);
  });

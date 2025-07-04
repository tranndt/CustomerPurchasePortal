/**
 * MongoDB connection module with enhanced authentication
 * 
 * This version adds additional authentication and connection diagnostics
 * for troubleshooting MongoDB Atlas connection issues on Render.com
 */

const mongoose = require('mongoose');
const fs = require('fs');

/**
 * Parse and validate MongoDB URI components
 * @param {string} uri - MongoDB connection string
 * @returns {object} Parsed URI components
 */
function parseMongoURI(uri) {
  try {
    // Check if the URI is missing completely
    if (!uri) {
      return { 
        valid: false, 
        error: 'No MongoDB URI provided' 
      };
    }
    
    // Extract authentication parts
    const isAtlas = uri.includes('mongodb+srv');
    const hasAuth = uri.includes('@');
    let username, password, host, dbName;
    
    if (hasAuth) {
      const authPart = uri.split('@')[0].replace(/mongodb(\+srv)?:\/\//, '');
      if (authPart.includes(':')) {
        [username, password] = authPart.split(':');
      } else {
        username = authPart;
      }
    }
    
    // Extract host
    const hostPart = hasAuth ? uri.split('@')[1]?.split('/')[0] : uri.split('//')[1]?.split('/')[0];
    host = hostPart;
    
    // Extract database name
    const dbPart = uri.split('/').slice(-1)[0];
    dbName = dbPart.split('?')[0];
    
    // Extract and parse query parameters
    const queryString = uri.split('?')[1];
    const options = {};
    if (queryString) {
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=');
        options[key] = value;
      });
    }
    
    // Check for required authentication parameters
    const hasAuthSource = options.hasOwnProperty('authSource');
    const hasUsername = !!username;
    const hasPassword = !!password;
    const hasDbName = !!dbName && dbName !== '';
    
    // Check for minimal required components
    const valid = !!host && (isAtlas ? (hasUsername && hasPassword) : true);
    
    return {
      valid,
      isAtlas,
      username,
      hasPassword,
      host,
      dbName,
      hasDbName,
      hasAuthSource,
      options,
      error: valid ? null : 'Invalid MongoDB connection string format'
    };
  } catch (err) {
    return { valid: false, error: `Failed to parse URI: ${err.message}` };
  }
}

/**
 * Connect to MongoDB with enhanced authentication and diagnostics
 * @param {Object} options - Configuration options
 * @returns {Promise} Resolves with Mongoose connection
 */
async function connectToMongoDB(options = {}) {
  // Get MongoDB URI from environment or options
  let mongoURI = options.uri || process.env.MONGODB_URI;
  const isRender = process.env.RENDER === 'true';
  
  // Parse and validate the URI
  const parsedURI = parseMongoURI(mongoURI);
  
  if (!parsedURI.valid) {
    console.error(`MongoDB URI validation error: ${parsedURI.error}`);
    
    // Fall back to local MongoDB if URI is invalid
    const fallbackURIs = [
      "mongodb://mongo:27017/purchasePortalDB",
      "mongodb://localhost:27017/purchasePortalDB",
      "mongodb://127.0.0.1:27017/purchasePortalDB"
    ];
    
    console.log("No valid MongoDB URI provided, using fallback:", fallbackURIs[0]);
    mongoURI = fallbackURIs[0];
  } else {
    console.log("MongoDB URI validation passed.");
    
    // Check and add database name if missing
    if (!parsedURI.hasDbName) {
      mongoURI = `${mongoURI}${mongoURI.endsWith('/') ? '' : '/'}purchasePortalDB`;
      console.log("Added database name to MongoDB URI");
    }
    
    // For MongoDB Atlas connections, ensure we have the right authentication options
    if (parsedURI.isAtlas) {
      console.log("Detected MongoDB Atlas connection.");
      
      // Add authSource if missing (required for Atlas)
      if (!parsedURI.hasAuthSource) {
        mongoURI += (mongoURI.includes('?') ? '&' : '?') + 'authSource=admin';
        console.log("Added authSource=admin parameter (required for Atlas)");
      }
      
      // Add other recommended Atlas parameters
      if (!mongoURI.includes('retryWrites=')) {
        mongoURI += (mongoURI.includes('?') ? '&' : '?') + 'retryWrites=true';
      }
      
      if (!mongoURI.includes('w=')) {
        mongoURI += (mongoURI.includes('?') ? '&' : '?') + 'w=majority';
      }
      
      if (isRender) {
        console.log("Enhanced MongoDB Atlas URI for Render deployment");
      }
    }
  }
  
  // Mask credentials for logging
  const maskedURI = mongoURI.replace(/mongodb(\+srv)?:\/\/[^:]+:[^@]+@/, 'mongodb$1://***:***@');
  console.log("Connecting to MongoDB at:", maskedURI);
  
  // Set up MongoDB connection options
  const mongooseOptions = { 
    serverSelectionTimeoutMS: 60000,  // Increase timeout for cloud environments
    socketTimeoutMS: 90000,
    connectTimeoutMS: 60000,
    retryWrites: true,
    maxPoolSize: 10,
    useNewUrlParser: true,
    useUnifiedTopology: true
  };
  
  // Add connection monitoring
  mongoose.connection.on('connecting', () => {
    console.log('MongoDB: Establishing connection...');
  });
  
  mongoose.connection.on('connected', () => {
    console.log('MongoDB: Connection established!');
  });
  
  mongoose.connection.on('disconnecting', () => {
    console.log('MongoDB: Disconnecting...');
  });
  
  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB: Disconnected');
  });
  
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.name, err.message);
    
    if (err.name === 'MongoServerError' && err.message.includes('bad auth')) {
      console.log('\n🔑 AUTHENTICATION ERROR: MongoDB Atlas rejected your credentials.');
      console.log('Check that your username and password are correct.');
      console.log('Ensure your MongoDB Atlas user has appropriate access rights.');
      console.log('For help resolving this, see MONGODB_AUTHENTICATION_FIX.md');
    }
    
    if (err.name === 'MongoServerSelectionError') {
      console.log('\n🔒 CONNECTION ERROR: Could not reach MongoDB server.');
      console.log('If using MongoDB Atlas, check that your IP is whitelisted.');
      console.log('For Render deployments, whitelist 0.0.0.0/0 in Atlas Network Access.');
      console.log('For more information, see MONGODB_ATLAS_WHITELIST_FIX.md');
    }
  });

  // Connect with retry logic
  const maxRetries = 3;
  const retryDelay = 5000;
  const fallbackURIs = [
    "mongodb://mongo:27017/purchasePortalDB",
    "mongodb://localhost:27017/purchasePortalDB",
    "mongodb://127.0.0.1:27017/purchasePortalDB"
  ];
  
  // Function to attempt connection with a URI
  const tryConnect = async (uri, retries = maxRetries) => {
    try {
      await mongoose.connect(uri, mongooseOptions);
      console.log('MongoDB connected successfully!');
      return true;
    } catch (err) {
      console.error(`MongoDB connection error (attempt ${maxRetries-retries+1}/${maxRetries}):`, err.name);
      console.error(`Error details: ${err.message}`);
      
      if (retries <= 1) {
        return false;
      }
      
      console.log(`Retrying in ${retryDelay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return tryConnect(uri, retries - 1);
    }
  };
  
  // Try the main connection first
  let connected = await tryConnect(mongoURI);
  
  // If main connection failed, try fallbacks
  if (!connected) {
    for (const fallbackURI of fallbackURIs) {
      if (fallbackURI !== mongoURI) {
        console.log(`Trying fallback MongoDB URI: ${fallbackURI}`);
        connected = await tryConnect(fallbackURI, 1); // Only try once for fallbacks
        if (connected) break;
      }
    }
  }
  
  // Return connection status
  return {
    connected,
    connection: mongoose.connection,
    uri: maskedURI
  };
}

module.exports = connectToMongoDB;

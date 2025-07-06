const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors')
const app = express()
const port = 3000;  // Fixed port to avoid conflicts with Render's main PORT

app.use(cors())
app.use(require('body-parser').urlencoded({ extended: false }));

// Load product reviews data
const reviews_data = JSON.parse(fs.readFileSync("data/reviews.json", 'utf8'));

// Use environment variable for MongoDB connection if available, fallback to local MongoDB
let mongoURI = process.env.MONGODB_URI;

// Check if the URI includes the database name
if (mongoURI && !mongoURI.split('/').slice(-1)[0]) {
  // If no database name is provided, add purchasePortalDB
  mongoURI = `${mongoURI}${mongoURI.endsWith('/') ? '' : '/'}purchasePortalDB`;
  console.log("Added database name to MongoDB URI");
}

// Local fallback - try different options based on environment
const fallbackURIs = [
  "mongodb://mongo:27017/purchasePortalDB",  // Docker service name
  "mongodb://localhost:27017/purchasePortalDB", // Local development
  "mongodb://127.0.0.1:27017/purchasePortalDB"  // Explicit localhost IP
];

// Check if we're running on Render (Render sets this environment variable)
const isRender = process.env.RENDER === 'true';

if (!mongoURI) {
  mongoURI = fallbackURIs[0];
  console.log("No MongoDB URI provided, using fallback:", mongoURI);
}

// For MongoDB Atlas connections on Render, ensure we have the right options
if (mongoURI && mongoURI.includes('mongodb+srv') && isRender) {
  // Add the following params if they don't exist already:
  // - authSource=admin (specifies the authentication database)
  // - retryWrites=true (enables retryable writes)
  // - w=majority (writes to the majority of the replica set)
  
  if (!mongoURI.includes('authSource=')) {
    mongoURI += (mongoURI.includes('?') ? '&' : '?') + 'authSource=admin';
  }
  
  if (!mongoURI.includes('retryWrites=')) {
    mongoURI += (mongoURI.includes('?') ? '&' : '?') + 'retryWrites=true';
  }
  
  if (!mongoURI.includes('w=')) {
    mongoURI += (mongoURI.includes('?') ? '&' : '?') + 'w=majority';
  }
  
  console.log("Enhanced MongoDB Atlas URI for Render deployment");
}

console.log("Connecting to MongoDB at:", mongoURI ? mongoURI.replace(/mongodb(\+srv)?:\/\/[^:]+:[^@]+@/, 'mongodb$1://***:***@') : "undefined");

// Set up MongoDB connection options with better error handling and higher timeouts
const mongooseOptions = { 
  serverSelectionTimeoutMS: 60000, // Increase timeout to 60 seconds
  socketTimeoutMS: 90000,         // How long the MongoDB driver will wait for a socket connection
  connectTimeoutMS: 60000,        // How long the MongoDB driver will wait to establish a connection
  retryWrites: true,
  maxPoolSize: 10,                // Maximum number of connections in the connection pool
  useNewUrlParser: true,
  useUnifiedTopology: true
};

// Connect function with retry logic
const connectWithRetry = async (uri, options, retries = 3, delay = 5000) => {
  try {
    await mongoose.connect(uri, options);
    console.log('MongoDB connected successfully to:', uri.replace(/mongodb(\+srv)?:\/\/[^:]+:[^@]+@/, 'mongodb$1://***:***@'));
    return true;
  } catch (err) {
    console.error(`MongoDB connection error (attempt ${4-retries}/3):`, err.name, err.message);
    
    if (retries <= 1) {
      // If we're out of retries with the main URI, try fallbacks
      for (const fallbackURI of fallbackURIs) {
        if (fallbackURI !== uri) {
          console.log(`Trying fallback MongoDB URI: ${fallbackURI.replace(/mongodb(\+srv)?:\/\/[^:]+:[^@]+@/, 'mongodb$1://***:***@')}`);
          try {
            await mongoose.connect(fallbackURI, options);
            console.log('MongoDB connected successfully using fallback');
            return true;
          } catch (fallbackErr) {
            console.error('Fallback connection error:', fallbackErr.name, fallbackErr.message);
          }
        }
      }
      return false;
    }
    
    console.log(`Retrying in ${delay/1000} seconds...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return connectWithRetry(uri, options, retries - 1, delay);
  }
};

// Connect to MongoDB with retry logic
connectWithRetry(mongoURI, mongooseOptions)
  .then(success => {
    if (success) {
      // Store db connection for use in routes
      app.locals.db = mongoose.connection;
      console.log('MongoDB connection established and ready');
    } else {
      console.error('All MongoDB connection attempts failed');
    }
  });

const Reviews = require('./review');
const productsRoutes = require('./products');

// Use products routes
app.use(productsRoutes);

// Function to load reviews with better error handling
const loadReviews = async () => {
  try {
    // First check if we're connected
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, waiting before loading reviews...');
      setTimeout(loadReviews, 5000); // Try again in 5 seconds
      return;
    }
    
    console.log('Checking for existing reviews...');
    const existingCount = await Reviews.countDocuments();
    
    if (existingCount > 0) {
      console.log(`${existingCount} reviews already exist, skipping data load`);
      return;
    }
    
    console.log('Loading reviews data...');
    await Reviews.deleteMany({});
    const result = await Reviews.insertMany(reviews_data['reviews']);
    console.log(`Successfully loaded ${result.length} reviews`);
  } catch (error) {
    console.error('Error loading reviews data:', error);
    console.log('Will retry loading reviews in 10 seconds...');
    setTimeout(loadReviews, 10000); // Retry after 10 seconds
  }
};

// Wait for MongoDB connection before trying to load reviews
mongoose.connection.once('connected', () => {
  console.log('MongoDB connected event fired, loading reviews...');
  setTimeout(loadReviews, 2000); // Give a little time after connection
});

// Express route to home
app.get('/', async (req, res) => {
    res.send("Welcome to the Purchase Portal API")
});

// Express route to fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch reviews by a particular product
app.get('/fetchReviews/product/:id', async (req, res) => {
  try {
    const documents = await Reviews.find({product_id: req.params.id});
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to insert review
app.post('/insert_review', express.raw({ type: '*/*' }), async (req, res) => {
  data = JSON.parse(req.body);
  const documents = await Reviews.find().sort( { id: -1 } )
  let new_id = documents.length > 0 ? documents[0]['id'] + 1 : 1;

  const review = new Reviews({
		"id": new_id,
		"name": data['name'],
		"product_id": data['product_id'] || 1,
		"product_name": data['product_name'] || "Unknown Product",
		"review": data['review'],
		"rating": data['rating'] || 5,
		"purchase": data['purchase'] || false,
		"purchase_date": data['purchase_date'],
		"sentiment": data['sentiment'] || "neutral"
	});

  try {
    const savedReview = await review.save();
    res.json(savedReview);
  } catch (error) {
		console.log(error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://127.0.0.1:${port}`);
});
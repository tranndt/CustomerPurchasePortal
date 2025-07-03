const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors')
const app = express()
const port = 3030;

app.use(cors())
app.use(require('body-parser').urlencoded({ extended: false }));

// Load product reviews data
const reviews_data = JSON.parse(fs.readFileSync("data/reviews.json", 'utf8'));

mongoose.connect("mongodb://mongo:27017/",{'dbName':'purchasePortalDB'})
  .then(() => {
    // Store db connection for use in routes
    app.locals.db = mongoose.connection;
    console.log('MongoDB connected successfully');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

const Reviews = require('./review');
const productsRoutes = require('./products');

// Use products routes
app.use(productsRoutes);

try {
  Reviews.deleteMany({}).then(()=>{
    Reviews.insertMany(reviews_data['reviews']);
  });
} catch (error) {
  console.log('Error loading data:', error);
}

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
  console.log(`Server is running on http://localhost:${port}`);
});
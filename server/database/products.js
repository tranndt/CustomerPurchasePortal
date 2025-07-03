// Script to create an Express endpoint to test products data
const express = require('express');
const router = express.Router();

// Add route to get all products
router.get('/fetchProducts', async (req, res) => {
  try {
    const products = await req.app.locals.db.collection('products').find().toArray();
    res.json({
      count: products.length,
      products: products.slice(0, 10) // Return just the first 10 for preview
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching products' });
  }
});

module.exports = router;

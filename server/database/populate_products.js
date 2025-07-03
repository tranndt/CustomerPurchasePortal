// Script to populate the products collection from Products.csv, removing all previous data
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const csv = require('csv-parser');

const MONGO_URL = 'mongodb://mongo:27017/';
const DB_NAME = 'purchasePortalDB';
const COLLECTION_NAME = 'products';

// Define a schema for products (mocking missing fields as needed)
const productSchema = new mongoose.Schema({
  category: String,
  brand: String,
  subcategory: String,
  subcategory2: String,
  name: String,
  price: Number,
  imageUrl: String,
  description: { type: String, default: 'No description available.' },
  stock: { type: Number, default: 100 },
  rating: { type: Number, default: 5 },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema, COLLECTION_NAME);

async function main() {
  await mongoose.connect(MONGO_URL, { dbName: DB_NAME });
  // Remove all previous products
  await Product.deleteMany({});

  const products = [];
  const csvPath = path.join(__dirname, 'data', 'Products.csv');

  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // Parse price (remove CA$ and commas)
        let price = 0;
        if (row['Price']) {
          price = parseFloat(row['Price'].replace(/CA\$|\$/g, '').replace(/,/g, '').trim());
        }
        products.push({
          category: row['Category'] || '',
          brand: row['Brand'] || '',
          subcategory: row['Subcategory'] || '',
          subcategory2: row['Subcategory2'] || '',
          name: row['Product name'] || '',
          price: price || 0,
          imageUrl: row['Image Url'] || '',
          // Mocked fields
          description: `High quality ${row['Brand'] || ''} ${row['Product name'] || ''}.`,
          stock: Math.floor(Math.random() * 100) + 1,
          rating: Math.floor(Math.random() * 2) + 4 // 4 or 5
        });
      })
      .on('end', resolve)
      .on('error', reject);
  });

  await Product.insertMany(products);
  console.log(`Inserted ${products.length} products.`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error populating products:', err);
  process.exit(1);
});

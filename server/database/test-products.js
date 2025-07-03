// Script to test if products data is populated in the database
const mongoose = require('mongoose');

const MONGO_URL = 'mongodb://mongo:27017/';
const DB_NAME = 'purchasePortalDB';
const COLLECTION_NAME = 'products';

async function main() {
  await mongoose.connect(MONGO_URL, { dbName: DB_NAME });
  
  // Query products collection
  const products = await mongoose.connection.db.collection(COLLECTION_NAME).find({}).limit(10).toArray();
  
  console.log('--- Product Data Check ---');
  if (products.length === 0) {
    console.log('No products found in the database. The CSV data has not been populated.');
  } else {
    console.log(`Found ${products.length} products. Sample products:`);
    products.forEach((product, index) => {
      console.log(`\n[${index + 1}]:`);
      console.log(`  Name: ${product.name}`);
      console.log(`  Category: ${product.category}`);
      console.log(`  Brand: ${product.brand}`);
      console.log(`  Price: ${product.price}`);
    });
    console.log('\nThe CSV data appears to be successfully loaded.');
  }
  
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error testing products:', err);
  process.exit(1);
});

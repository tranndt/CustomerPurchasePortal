// Simple script to test if products exist in the database
const mongoose = require('mongoose');

async function main() {
  try {
    await mongoose.connect('mongodb://mongo:27017/purchasePortalDB');
    
    // Check products collection
    const products = await mongoose.connection.db.collection('products').countDocuments();
    
    console.log(`Total products in database: ${products}`);
    
    if (products > 0) {
      // Sample some products
      const sampleProducts = await mongoose.connection.db.collection('products')
        .find().limit(5).toArray();
      
      console.log('\nSample products:');
      sampleProducts.forEach((product, i) => {
        console.log(`\n[${i+1}] ${product.name || 'Unnamed Product'}`);
        console.log(`   Category: ${product.category || 'N/A'}`);
        console.log(`   Brand: ${product.brand || 'N/A'}`);
        console.log(`   Price: ${product.price || 'N/A'}`);
      });
      
      console.log('\nThe CSV data has been successfully loaded into the database.');
    } else {
      console.log('\nNo products found. The CSV data has NOT been loaded into the database.');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error checking products:', error);
  }
}

main();

#!/usr/bin/env node

// Explicitly set port to 3000 to avoid conflicts with Render's main PORT
process.env.PORT = '3000';

// Log the port for debugging
console.log('Express starting on port:', process.env.PORT);

// Import and run the Express app
require('/app/express/app.js');

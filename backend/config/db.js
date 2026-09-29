const mongoose = require('mongoose');

/**
 * Connects the Express application to MongoDB using Mongoose.
 */
const connectDB = async () => {
  try {
    // Attempt to connect to the database using the connection string from .env
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    // If the connection fails, log the error and stop the server
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // 1 means exit with failure
  }
};

module.exports = connectDB;

/**
 * Database Configuration
 * MongoDB connection setup with Mongoose
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 * @param {string} mongoUri - MongoDB connection string
 * @returns {Promise<void>}
 */
async function connectDatabase(mongoUri) {
  try {
    if (!mongoUri) {
      throw new Error('MONGO_URI is required in environment variables');
    }

    const options = {
      // Connection pool options
      maxPoolSize: 10,
      minPoolSize: 2,
      // Connection timeout
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      // Retry logic
      retryWrites: true,
    };

    await mongoose.connect(mongoUri, options);

    console.log('✅ MongoDB connected successfully');

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
async function disconnectDatabase() {
  try {
    await mongoose.connection.close();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error.message);
    throw error;
  }
}

module.exports = {
  connectDatabase,
  disconnectDatabase
};


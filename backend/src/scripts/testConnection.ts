import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { logger } from '../config/logger';

// Load environment variables
dotenv.config();

const testConnection = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      logger.error('MONGODB_URI is not defined in environment variables');
      process.exit(1);
    }

    logger.info('Attempting to connect to MongoDB...');
    logger.info(`URI: ${mongoUri.replace(/:([^@]+)@/, ':****@')}`);

    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4, // Force IPv4
    };

    await mongoose.connect(mongoUri, options);
    
    logger.info('✅ MongoDB connection successful!');
    logger.info(`Database: ${mongoose.connection.name}`);
    
    await mongoose.connection.close();
    logger.info('Connection closed');
    process.exit(0);
  } catch (error: any) {
    logger.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Run the test
testConnection();

import express, { Application, Request, Response} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import 'express-async-errors';

// Import configurations
import { connectDatabase, closeDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { logger } from './config/logger'; 

// Import routes
import authRoutes from './routes/auth.routes';
import companyRoutes from './routes/company.routes.js';
import departmentRoutes from './routes/department.routes.js';
import userRoutes from './routes/user.routes.js';
import grievanceRoutes from './routes/grievance.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import whatsappRoutes from './routes/whatsapp.routes.js';
import importRoutes from './routes/import.routes.js';
import auditRoutes from './routes/audit.routes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ================================
// Middleware
// ================================

// Security
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ================================
// Routes
// ================================

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Dashboard API Server is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      companies: '/api/companies',
      departments: '/api/departments',
      users: '/api/users',
      grievances: '/api/grievances',
      appointments: '/api/appointments',
      analytics: '/api/analytics',
      webhook: '/api/webhook/whatsapp',
      import: '/api/import',
      audit: '/api/audit'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/webhook/whatsapp', whatsappRoutes);
app.use('/api/import', importRoutes);
app.use('/api/audit', auditRoutes);

// ================================
// Error Handling
// ================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ================================
// Server Initialization
// ================================

const startServer = async () => {
  let mongoConnected = false;
  let redisConnected = false;

  // Try to connect to MongoDB (non-blocking)
  try {
    await connectDatabase();
    mongoConnected = true;
    logger.info('✅ MongoDB connected successfully');
  } catch (error: any) {
    logger.error('❌ MongoDB connection failed:', error.message);
    logger.warn('⚠️  Server will start WITHOUT MongoDB connection');
    logger.warn('⚠️  Database operations will fail until connection is established');
    logger.warn('');
    logger.warn('💡 To fix this:');
    logger.warn('   1. Check your internet connection');
    logger.warn('   2. Verify MONGODB_URI in .env file');
    logger.warn('   3. See NETWORK_TROUBLESHOOTING.md for detailed help');
    logger.warn('');
  }

  // Try to connect to Redis (optional, non-blocking)
  try {
    const redis = await connectRedis();
    if (redis) {
      redisConnected = true;
      logger.info('✅ Redis connected successfully');
    } else {
      logger.warn('⚠️  Running without Redis (caching disabled)');
    }
  } catch (error: any) {
    logger.warn('⚠️  Redis connection failed:', error.message);
    logger.warn('⚠️  Running without Redis (caching disabled)');
  }

  // Start server regardless of database connections
  try {
    app.listen(PORT, () => {
      logger.info('');
      logger.info('='.repeat(60));
      logger.info('🚀 SERVER STARTED SUCCESSFULLY');
      logger.info('='.repeat(60));
      logger.info(`📍 Port: ${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 API URL: http://localhost:${PORT}`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
      logger.info('');
      logger.info('📊 Connection Status:');
      logger.info(`   MongoDB: ${mongoConnected ? '✅ Connected' : '❌ Disconnected'}`);
      logger.info(`   Redis:   ${redisConnected ? '✅ Connected' : '❌ Disconnected'}`);
      logger.info('='.repeat(60));
      
      if (!mongoConnected) {
        logger.warn('');
        logger.warn('⚠️  WARNING: Server is running without MongoDB!');
        logger.warn('⚠️  Most API endpoints will not work until MongoDB connects.');
        logger.warn('⚠️  Please fix the connection issue. See NETWORK_TROUBLESHOOTING.md');
        logger.warn('');
      }
    });
  } catch (error) {
    logger.error('❌ Failed to start HTTP server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  logger.error('⚠️  Unhandled Promise Rejection:', reason);
  logger.error('⚠️  The application will continue running, but this should be investigated');
  // Don't exit - let the app continue running
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('⚠️  Uncaught Exception:', error);
  logger.error('⚠️  The application will continue running, but this should be investigated');
  // Don't exit - let the app continue running
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await closeDatabase();
  await disconnectRedis();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await closeDatabase();
  await disconnectRedis();
  process.exit(0);
});



// Start the server
startServer();

export default app;

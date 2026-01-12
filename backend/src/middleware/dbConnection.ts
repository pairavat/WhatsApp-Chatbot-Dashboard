import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

/**
 * Middleware to check if database is connected before processing requests
 */
export const requireDatabaseConnection = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check if mongoose is connected
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      success: false,
      message: 'Database connection not available. Please check server logs.',
      error: 'Database not connected',
      connectionState: mongoose.connection.readyState,
      states: {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      }
    });
    return;
  }

  next();
};

/**
 * Check database connection status
 */
export const isDatabaseConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

/**
 * Get database connection status info
 */
export const getDatabaseStatus = () => {
  const stateMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };
  
  return {
    connected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    state: stateMap[mongoose.connection.readyState] || 'unknown',
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name
  };
};

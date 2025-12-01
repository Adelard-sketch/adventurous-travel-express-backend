// Vercel Serverless Function Handler
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'https://adventurous-travel-express-frontend.vercel.app',
  'https://adventurous-travel-express.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.includes('.vercel.app')) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection with caching for serverless
let cachedDb = null;
let isConnecting = false;

async function connectToDatabase() {
  // Return cached connection if available
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return connectToDatabase();
  }

  isConnecting = true;

  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set. Please configure it in Vercel dashboard.');
    }

    // Close existing connection if any
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    cachedDb = mongoose.connection;
    console.log('✅ MongoDB Connected');
    return cachedDb;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    cachedDb = null;
    throw error;
  } finally {
    isConnecting = false;
  }
}

// Middleware to ensure database connection
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Database connection failed',
      message: 'Please ensure MONGODB_URI is configured in Vercel environment variables'
    });
  }
});

// API Routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/tours', require('../routes/tours'));
app.use('/api/flights', require('../routes/flights'));
app.use('/api/taxis', require('../routes/taxis'));
app.use('/api/parks', require('../routes/parks'));
app.use('/api/bookings', require('../routes/bookings'));
app.use('/api/payments', require('../routes/payments'));
app.use('/api/users', require('../routes/users'));
app.use('/api/hotels', require('../routes/hotels'));
app.use('/api/locations', require('../routes/locations'));
app.use('/api/admin', require('../routes/admin'));

// Root endpoint
app.get('/', (req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState];
  res.json({ 
    message: 'Adventurous Travel Express API',
    version: '1.0.0',
    status: 'running',
    database: dbState,
    environment: process.env.NODE_ENV || 'development',
    mongoConfigured: !!process.env.MONGODB_URI
  });
});

// Health check
app.get('/api/health', (req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState];
  const isHealthy = mongoose.connection.readyState === 1;
  
  res.status(isHealthy ? 200 : 503).json({ 
    status: isHealthy ? 'ok' : 'degraded',
    message: isHealthy ? 'Server is running' : 'Database connection issue',
    database: dbState,
    mongoConfigured: !!process.env.MONGODB_URI,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

module.exports = app;

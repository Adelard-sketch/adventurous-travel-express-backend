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
async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/adventurous-travel';
  
  await mongoose.connect(mongoUri, {
  });

  cachedDb = mongoose.connection;
  console.log('✅ MongoDB Connected');
  return cachedDb;
}

// Initialize DB connection
connectToDatabase().catch(err => console.error('DB Error:', err));

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
  res.json({ 
    message: 'Adventurous Travel Express API',
    version: '1.0.0',
    status: 'running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
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

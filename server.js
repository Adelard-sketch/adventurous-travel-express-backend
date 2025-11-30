const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const path = require('path');

dotenv.config();

const app = express();

// Connect to database (only once)
let isConnected = false;
const ensureDbConnection = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

// Initialize DB connection for serverless
if (process.env.NODE_ENV === 'production') {
  ensureDbConnection().catch(console.error);
} else {
  connectDB();
}

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
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all Vercel preview deployments
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

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tours', require('./routes/tours'));
app.use('/api/flights', require('./routes/flights'));
app.use('/api/taxis', require('./routes/taxis'));
app.use('/api/parks', require('./routes/parks'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/users', require('./routes/users'));
app.use('/api/hotels', require('./routes/hotels'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/admin', require('./routes/admin'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Adventurous Travel Express API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      tours: '/api/tours',
      flights: '/api/flights',
      taxis: '/api/taxis',
      parks: '/api/parks',
      bookings: '/api/bookings',
      payments: '/api/payments'
    }
  });
});

// Health check (before error handler)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Export for Vercel serverless
module.exports = app;

// Local development server
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
# Adventurous Travel Express Backend

Backend API for the Adventurous Travel booking platform.

## Vercel Deployment Instructions

### 1. Environment Variables Setup

In your Vercel dashboard for the backend project, add these environment variables:

```
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-secure-random-jwt-secret-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
NODE_ENV=production
```

### 2. MongoDB Atlas Connection String

Your MongoDB connection string should be in this format:
```
mongodb+srv://username:password@cluster.mongodb.net/adventurous-travel?retryWrites=true&w=majority
```

**Important:** Make sure to:
- Whitelist all IPs (0.0.0.0/0) in MongoDB Atlas Network Access
- Use the correct database user credentials
- Enable retryWrites and set w=majority

### 3. Vercel Configuration

The `vercel.json` is already configured for serverless deployment:
- Entry point: `api/index.js`
- Node version: 24.x
- All routes go through the serverless function

### 4. Deploy to Vercel

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

Or push to GitHub and let Vercel auto-deploy.

### 5. Test the Deployment

After deployment, test these endpoints:

```bash
# Health check
curl https://your-backend.vercel.app/api/health

# Root endpoint
curl https://your-backend.vercel.app/
```

## Common Issues & Solutions

### Issue: "Cannot read property 'readyState' of undefined"
**Solution:** MongoDB connection not established. Check:
- MONGODB_URI is set in Vercel environment variables
- MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Database credentials are correct

### Issue: "Module not found"
**Solution:** Make sure all dependencies are in `package.json` and committed to git

### Issue: "Function timeout"
**Solution:** MongoDB connection is slow. Use connection pooling and caching (already implemented)

### Issue: CORS errors
**Solution:** The API already allows all `.vercel.app` origins. Check that frontend URL is correct.

## Local Development

```bash
# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your local MongoDB URI

# Start server
npm start

# Or with nodemon for development
npm run dev
```

## API Endpoints

- `GET /` - Root endpoint with API info
- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/flights` - Get flights
- `GET /api/tours` - Get tours
- `GET /api/taxis` - Get taxis
- `GET /api/parks` - Get parks
- `GET /api/hotels` - Get hotels
- `POST /api/bookings` - Create booking
- `POST /api/payments` - Process payment

See route files for complete API documentation.

## Tech Stack

- Node.js 24.x
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Stripe Payment Processing
- Vercel Serverless Functions

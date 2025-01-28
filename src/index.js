import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import { v2 as cloudinary } from 'cloudinary';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import connectDB from './utils/db.js';
import { ErrorMiddleware } from './middlewares/error.js';
import userRouter from './routes/userRoutes.js';
// Uncomment and import other routes as needed
// import orderRouter from './routes/orderRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Enable trust proxy for rate limiting and proxies
app.set('trust proxy', 1);

// Middleware for rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: 'draft-7', // Send rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// Apply rate limiter middleware
app.use(limiter);

// Enable CORS for cross-origin requests
app.use(cors());

// Body parser for handling JSON payloads
app.use(express.json({ limit: '50mb' }));

// Cookie parser for reading cookies
app.use(cookieParser());

// Routes
app.use('/api', userRouter);
// Uncomment when needed
// app.use('/api/orders', orderRouter);

// Root route for testing
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is working fine',
  });
});

// Middleware for handling unknown routes
app.all('*', (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

// Error handling middleware
app.use(ErrorMiddleware);

// Create the HTTP server
const server = http.createServer(app);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});

// Start the server and connect to the database
server.listen(PORT, async () => {
  try {
    console.log(`Server running on port ${PORT}`);
    await connectDB();
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Failed to connect to the database:', err);
    process.exit(1); // Exit the process if DB connection fails
  }
});

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


dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// body parser
app.use(express.json({ limit: '50mb' }));

// cookie parser
app.use(cookieParser());

// cors => cross origin resource sharing
app.use(cors());

// api requests limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// middleware calls
app.use(limiter);
app.use(ErrorMiddleware);

// routes
app.use(
  '/api',
  userRouter,
//   orderRouter,
//   courseRouter,
//   notificationRouter,
//   analyticsRouter,
//   layoutRouter
);

// testing api
app.get('/test', (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'API is working fine',
  });
});

// unknown route
app.all('*', (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

const server = http.createServer(app);

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});

// initSocketServer(server);

// create server
server.listen(PORT, () => {
  console.log(`Server is connected with port ${PORT}`);
  connectDB();
});
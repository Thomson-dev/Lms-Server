import jwt from 'jsonwebtoken';
import { redis } from '../utils/redis.js';
// import { updateAccessToken } from '../controllers/userController.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import { CatchAsyncError } from './catchAsyncErrors.js';
import { updateAccessToken } from '../controllers/userController.js';

// authenticated user
export const isAuthenticated = CatchAsyncError(async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ErrorHandler('Please login to access this resource', 400));
  }
  const access_token = authHeader.split(' ')[1];
  const decoded = jwt.decode(access_token);
  if (!decoded) {
    return next(new ErrorHandler('Access token is not valid', 400));
  }

  // check if the access token is expired
  if (decoded.exp && decoded.exp <= Date.now() / 1000) {
    try {
      await updateAccessToken(req, res, next);
    } catch (error) {
      return next(error);
    }
  } else {
    const user = await redis.get(decoded.id);

    if (!user) {
      return next(new ErrorHandler('Please login to access this resource', 400));
    }

    req.user = JSON.parse(user);

    next();
  }
});

// validate user role
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role || '')) {
      return next(
        new ErrorHandler(`Role: ${req.user?.role} is not allowed to access this resource`, 403)
      );
    }
    next();
  };
};
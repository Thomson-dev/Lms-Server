import jwt from 'jsonwebtoken';
import ErrorHandler from '../utils/ErrorHandler.js';
import { CatchAsyncError } from './catchAsyncErrors.js';
import userModel from '../models/userModel.js';

// authenticated user
// authenticated user
export const isAuthenticated = CatchAsyncError(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }

  const access_token = authHeader.split(" ")[1];

  try {
    // Verify access token
    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN);

    // Fetch user from DB using decoded id
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    req.user = user;
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new ErrorHandler("Access token expired, please login again", 401));
    }
    return next(new ErrorHandler("Invalid access token", 401));
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
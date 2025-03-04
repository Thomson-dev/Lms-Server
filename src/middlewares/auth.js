import jwt from 'jsonwebtoken';
import { redis } from '../utils/redis.js';
// import { updateAccessToken } from '../controllers/userController.js';
import ErrorHandler from '../utils/ErrorHandler.js';
import { CatchAsyncError } from './catchAsyncErrors.js';
import { updateAccessToken } from '../controllers/userController.js';

// authenticated user
export const isAuthenticated = CatchAsyncError(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }

  let access_token = authHeader.split(" ")[1];

  try {
    // Verify access token
    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN);
    const user = await redis.get(decoded.id);

    if (!user) {
      return next(new ErrorHandler("Please login to access this resource", 401));
    }

    req.user = JSON.parse(user);
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      try {
        // Call API to refresh token
        const response = await fetch("https://lms-server-oqfi.onrender.com/api/refresh-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "refresh-token": req.headers["refresh-token"],
          },
        });

        const data = await response.json();
        if (!data.success) {
          return next(new ErrorHandler("Failed to refresh token", 401));
        }

        // Update authorization header with new token
        req.headers["authorization"] = `Bearer ${data.accessToken}`;

        // Verify the new token
        const newDecoded = jwt.verify(data.accessToken, process.env.ACCESS_TOKEN);
        const newUser = await redis.get(newDecoded.id);

        if (!newUser) {
          return next(new ErrorHandler("Please login to access this resource", 401));
        }

        req.user = JSON.parse(newUser);
        return next();
      } catch (error) {
        return next(new ErrorHandler("Failed to refresh token", 401));
      }
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
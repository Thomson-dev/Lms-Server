import dotenv from "dotenv";

import { redis } from "./redis.js";

dotenv.config();

export const sendToken = (user, statusCode, res) => {
  const accessToken = user.SignAccessToken();
  const refreshToken = user.SignRefreshToken();
  // upload session to redis
  redis.set(user._id, JSON.stringify(user));

  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
    refreshToken,
  });
};
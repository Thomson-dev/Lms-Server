import jwt from "jsonwebtoken";
import path from "path";
import ejs from "ejs";
import { fileURLToPath } from "url";
import userModel from "../models/userModel.js"; // Adjust the path as necessary
import sendMail from "../utils/sendMail.js"; // Adjust the path as necessary
import ErrorHandler from "../utils/ErrorHandler.js";
import { CatchAsyncError } from "../middlewares/catchAsyncErrors.js";
import { sendToken } from "../utils/jwt.js";
import { redis } from "../utils/redis.js";
import { getUserById } from "../services/userService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const registrationUser = CatchAsyncError(async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const isEmailExist = await userModel.findOne({ email });
    if (isEmailExist) {
      return next(new ErrorHandler("Email already exist", 400));
    }

    const user = {
      name,
      email,
      password,
    };

    const activationToken = createActivationToken(user);

    const activationCode = activationToken.activationCode;

    const data = { user: { name: user.name }, activationCode };
    const templatePath = path.join(__dirname, "../mails/activation-mail.ejs");
    const html = await ejs.renderFile(templatePath, data);

    try {
      await sendMail({
        email: user.email,
        subject: "Activate your account",
        template: "activation-mail.ejs",
        data,
      });

      res.status(201).json({
        success: true,
        message: `Please check your email: ${user.email} to activate your account!`,
        activationToken: activationToken.token,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

const createActivationToken = (user) => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.ACTIVATION_SECRET,
    {
      expiresIn: "5m",
    }
  );

  return { token, activationCode };
};

export const activateUser = CatchAsyncError(async (req, res, next) => {
  try {
    const { activation_token, activation_code } = req.body;

    const newUser = jwt.verify(activation_token, process.env.ACTIVATION_TOKEN);

    if (newUser.activationCode !== activation_code) {
      return next(new ErrorHandler("Invalid activation code", 400));
    }

    const { name, email, password } = newUser.user;

    const existUser = await userModel.findOne({ email });

    if (existUser) {
      return next(new ErrorHandler("Email already exist", 400));
    }
    const user = await userModel.create({
      name,
      email,
      password,
    });

    res.status(201).json({
      success: true,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});





export const loginUser = CatchAsyncError(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler("Please enter email and password", 400));
    }

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 400));
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return next(new ErrorHandler("Invalid email or password", 400));
    }
    sendToken(user, 200, res);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});








export const logoutUser = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user?._id || "";
    redis.del(userId);
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});






export const updateAccessToken = async (req, res, next) => {
  try {
    const refresh_token = req.headers["refresh-token"];
    if (!refresh_token) {
      return next(new ErrorHandler("Refresh token is required!", 401));
    }

    // Verify the refresh token
    const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN);

    // Check if session exists
    const session = await redis.get(decoded.id);
    if (!session) {
      return next(new ErrorHandler("Session expired, please log in again!", 403));
    }

    const user = JSON.parse(session);

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN,
      { expiresIn: "15m" }
    );

    // Refresh session expiration
    await redis.set(user._id, JSON.stringify(user), "EX", 604800); // 7 days

    // Send the new access token as a response
    res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    return next(new ErrorHandler("Invalid or expired refresh token", 401));
  }
};


export const getUserInfo = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user?._id; // Extract the user ID from the authenticated user
    getUserById(userId, res); // Fetch user information and send the response
  } catch (error) {
    return next(new ErrorHandler(error.message, 400)); // Handle any errors
  }
});

export const updateUserInfo = CatchAsyncError(async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const userId = req.user?._id;
    if (!userId) {
      return next(new ErrorHandler("User ID not found", 400));
    }

    console.log("User ID:", userId);

    const user = await userModel.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    if (email) {
      user.email = email;
    } else {
      console.log("No email provided to update");
    }

    if (name) {
      user.name = name;
    } else {
      console.log("No name provided to update");
    }

    await user.save();

    await redis.set(userId, JSON.stringify(user));

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

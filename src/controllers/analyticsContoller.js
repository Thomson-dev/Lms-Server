

import { CatchAsyncError } from "../middlewares/catchAsyncErrors";
import userModel from "../models/userModel";
import { generateLast12MothsData } from "../utils/analyticsGenerator";
import ErrorHandler from "../utils/ErrorHandler";
import CourseModel from "../models/courseModel.js";
import OrderModel from "../models/OrderModal.js";

// get users analytics --- only for admin
export const getUsersAnalytics = CatchAsyncError(
  async (req, res, next) => {
    try {
      const users = await generateLast12MothsData(userModel);

      res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get courses analytics --- only for admin
export const getCoursesAnalytics = CatchAsyncError(
  async (req, res, next) => {
    try {
      const courses = await generateLast12MothsData(CourseModel);

      res.status(200).json({
        success: true,
        courses,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// get order analytics --- only for admin
export const getOrderAnalytics = CatchAsyncError(
  async (req, res, next) => {
    try {
      const orders = await generateLast12MothsData(OrderModel);

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
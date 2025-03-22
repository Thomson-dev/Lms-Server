import { CatchAsyncError } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import userModel from "../models/userModel.js";
import CourseModel from "../models/courseModel.js";
import NotificationModel from "../models/NotificationModal.js";
import { newOrder } from "../services/orderService.js";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { redis } from "../utils/redis.js";
import sendMail from "../utils/sendMail.js";

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

// Define __dirname correctly for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// New payment
export const newPayment = CatchAsyncError(async (req, res, next) => {
  try {
    const myPayment = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "GBP",
      metadata: {
        company: "E-Learning",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(201).json({
      success: true,
      client_secret: myPayment.client_secret,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Create order for mobile

export const createMobileOrder = CatchAsyncError(async (req, res, next) => {
  try {
    const { courseId, payment_info } = req.body;
    const user = await userModel.findById(req.user?._id);

    const courseExistInUser = user?.courses.some(
      (course) => course._id.toString() === courseId
    );

    if (courseExistInUser) {
      return next(
        new ErrorHandler("You have already purchased this course", 400)
      );
    }

    const course = await CourseModel.findById(courseId);

    if (!course) {
      return next(new ErrorHandler("Course not found", 404));
    }

    const data = {
      courseId: course._id,
      userId: user?._id,
      payment_info,
    };

    const mailData = {
      order: {
        _id: course._id.toString().slice(0, 6),
        name: course.name,
        price: course.price,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      },
    };

    const html = await ejs.renderFile(
      path.join(__dirname, "../mails/order-confirmation.ejs"),
      { order: mailData }
    );

    try {
      if (user) {
        await sendMail({
          email: user.email,
          subject: "Order Confirmation",
          template: "order-confirmation.ejs",
          data: mailData,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }

    user?.courses.push(course?._id);

    await redis.set(req.user?._id, JSON.stringify(user));

    await user?.save();

    course.purchased = course.purchased + 1;

    await course.save();

    newOrder(data, res, next);
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});
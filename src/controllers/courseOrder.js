import { CatchAsyncError } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config(); 

const app = express();
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// new payment
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
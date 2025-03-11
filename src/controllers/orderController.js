import { CatchAsyncError } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import stripe from "stripe"; // Ensure you have initialized Stripe with your secret key

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
import express from "express";
import { createMobileOrder, newPayment } from "../controllers/courseOrder.js";
import { isAuthenticated } from "../middlewares/auth.js";

const orderRouter = express.Router();

orderRouter.post("/payment", isAuthenticated, newPayment);
orderRouter.post("/create-mobile-order", isAuthenticated  , createMobileOrder);

export default orderRouter;

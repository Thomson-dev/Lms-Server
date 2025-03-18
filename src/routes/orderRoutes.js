import express from "express";
import { newPayment } from "../controllers/courseOrder.js";
import { isAuthenticated } from "../middlewares/auth.js";

const orderRouter = express.Router();

orderRouter.post("/payment", isAuthenticated, newPayment);

export default orderRouter;

import express from "express";

import { newPayment } from "../controllers/OrderController";
import { isAuthenticated } from "../middlewares/auth";

const orderRouter = express.Router();



orderRouter.post("/payment", isAuthenticated, newPayment);

export default orderRouter;

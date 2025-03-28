import express from "express";
import {
  getAllQuizzes,
  createQuiz,
  deleteQuiz,
} from "../controllers/quizController.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

// Get all quizzes
router.get("/quizzes", isAuthenticated, getAllQuizzes);

// Create a new quiz (admin only)
router.post("/quiz", isAuthenticated, authorizeRoles("admin"), createQuiz);

// Delete a quiz (admin only)
router.delete("/quiz/:quizId", isAuthenticated, authorizeRoles("admin"), deleteQuiz);

export default router;
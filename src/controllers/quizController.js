import QuizModel from "../models/quizModel.js";
import { CatchAsyncError } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";

// Get all quizzes
export const getAllQuizzes = CatchAsyncError(async (req, res, next) => {
  const quizzes = await QuizModel.find();

  res.status(200).json({
    success: true,
    quizzes,
  });
});

// Create a new quiz
export const createQuiz = CatchAsyncError(async (req, res, next) => {
  const { question, options } = req.body;

  if (!question || !options || options.length < 2) {
    return next(new ErrorHandler("Invalid quiz data provided", 400));
  }

  const newQuiz = await QuizModel.create({
    question,
    options,
  });

  res.status(201).json({
    success: true,
    quiz: newQuiz,
  });
});

// Delete a quiz
export const deleteQuiz = CatchAsyncError(async (req, res, next) => {
  const { quizId } = req.params;

  const quiz = await QuizModel.findById(quizId);

  if (!quiz) {
    return next(new ErrorHandler("Quiz not found", 404));
  }

  await quiz.remove();

  res.status(200).json({
    success: true,
    message: "Quiz deleted successfully",
  });
});
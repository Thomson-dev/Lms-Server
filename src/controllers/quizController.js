import QuizModel from "../models/quizModel.js";
import { CatchAsyncError } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";











export const getAllQuizzes = CatchAsyncError(async (req, res, next) => {
  const quizzes = await QuizModel.find().lean(); // Convert Mongoose documents to plain JSON

  console.log("Fetched Quizzes:", JSON.stringify(quizzes, null, 2)); // Log the full data

  res.status(200).json({
    success: true,
    quizzes,
  });
});






export const createQuiz = CatchAsyncError(async (req, res, next) => {
  const { question, options, answer } = req.body;

  // Validate that options is an array of objects with `option` and `isCorrect`
  if (
    !question ||
    !Array.isArray(options) ||
    options.length < 2 ||
    !options.every(
      (opt) => typeof opt.option === "string" && typeof opt.isCorrect === "boolean"
    ) ||
    !answer
  ) {
    return next(new ErrorHandler("Invalid quiz data provided", 400));
  }

  // Sanitize options to ensure they are stored correctly
  const sanitizedOptions = options.map((opt) => ({
    option: opt.option.toString(),
    isCorrect: Boolean(opt.isCorrect),
  }));

  const newQuiz = await QuizModel.create({
    question,
    options: sanitizedOptions,
    answer,
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
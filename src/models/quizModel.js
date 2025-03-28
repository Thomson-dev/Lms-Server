import mongoose from "mongoose";

const { Schema, model } = mongoose;

const quizSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: [
      {
        option: String,
        isCorrect: Boolean,
      },
    ],
  },
  { timestamps: true }
);

const QuizModel = model("Quiz", quizSchema);

export default QuizModel;
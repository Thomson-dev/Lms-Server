import { CatchAsyncError } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { v2 as cloudinary } from "cloudinary";
import { createCourse } from "../services/courseService.js";
import CourseModel from "../models/courseModel.js";
import axios from "axios";

export const uploadCourse = CatchAsyncError(async (req, res, next) => {
  try {
    const data = req.body;
    const thumbnail = data.thumbnail;

    if (!thumbnail) {
      return next(new ErrorHandler("Thumbnail is missing", 400));
    }

    console.log("Received Thumbnail Base64:", thumbnail.slice(0, 30)); // Log only first 30 chars for debugging

    // Ensure we don't add the prefix if it already exists
    const base64Image = thumbnail.startsWith("data:image")
      ? thumbnail
      : `data:image/png;base64,${thumbnail}`;

    // Upload to Cloudinary
    const myCloud = await cloudinary.uploader.upload(base64Image, {
      folder: "courses",
    });

    data.thumbnail = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };

    console.log("Uploaded Thumbnail:", data.thumbnail);

    // Call function to create the course
    createCourse(data, res, next);
  } catch (error) {
    console.error("Error uploading thumbnail:", error);
    return next(new ErrorHandler(error.message, 500));
  }
});



// get all courses --- without purchasing
export const getAllCourses = CatchAsyncError(async (req, res, next) => {
  try {
    const courses = await CourseModel.find().select(
      "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links -quizzes"
    );

    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});


export const generateVideoUrl = CatchAsyncError(
  async (req, res, next) => {
    try {
      const { videoId } = req.body;
      const response = await axios.post(
        `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
        { ttl: 300 },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
          },
        }
      );
      res.json(response.data);
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);




// Add a quiz to a course
export const addQuizToCourse = CatchAsyncError(async (req, res, next) => {
  const { courseId, quiz } = req.body;

  if (!courseId || !quiz) {
    return next(new ErrorHandler("Course ID and quiz data are required", 400));
  }

  const course = await CourseModel.findById(courseId);

  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  course.quizzes.push(quiz);
  await course.save();

  res.status(201).json({
    success: true,
    course,
  });
});


// Get quizzes for a course
export const getQuizzesForCourse = CatchAsyncError(async (req, res, next) => {
  const { courseId } = req.params;

  const course = await CourseModel.findById(courseId).select("quizzes");

  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  res.status(200).json({
    success: true,
    quizzes: course.quizzes,
  });
});


// Submit a quiz and evaluate answers
export const submitQuiz = CatchAsyncError(async (req, res, next) => {
  const { courseId, quizId, answers } = req.body;

  if (!courseId || !quizId || !answers) {
    return next(new ErrorHandler("Course ID, quiz ID, and answers are required", 400));
  }

  const course = await CourseModel.findById(courseId);

  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  const quiz = course.quizzes.id(quizId);

  if (!quiz) {
    return next(new ErrorHandler("Quiz not found", 404));
  }

  let score = 0;
  quiz.options.forEach((option, index) => {
    if (option.isCorrect && answers.includes(index)) {
      score += 1;
    }
  });

  res.status(200).json({
    success: true,
    score,
  });
});




export const addCommentToCourse = CatchAsyncError(async (req, res, next) => {
  const { courseId, courseDataId, user, question } = req.body;

  const course = await CourseModel.findById(courseId);

  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  const courseData = course.courseData.id(courseDataId);

  if (!courseData) {
    return next(new ErrorHandler("Course data not found", 404));
  }

  const newComment = {
    user,
    question,
    questionReplies: [],
  };

  courseData.questions.push(newComment);

  await course.save();

  res.status(201).json({
    success: true,
    course,
  });
});


export const getCourseByUser = CatchAsyncError(async (req, res, next) => {
  try {
    const userCourseList = req.user?.courses;
    const courseId = req.params.id;

    const courseExists = userCourseList?.find(
      (course) => course._id.toString() === courseId
    );

    if (!courseExists) {
      return next(
        new ErrorHandler("You are not eligible to access this course", 404)
      );
    }

    const course = await CourseModel.findById(courseId);

    const content = course?.courseData;

    res.status(200).json({
      success: true,
      content,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});
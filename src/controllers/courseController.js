import { CatchAsyncError } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { v2 as cloudinary } from "cloudinary";
import { createCourse } from "../services/courseService.js";
import CourseModel from "../models/courseModel.js";
import axios from "axios";

export const uploadCourse = CatchAsyncError(async (req, res, next) => {
  try {
    const data = req.body; // Extract course data from the request body
    const thumbnail = data.thumbnail; // Extract the thumbnail object from the course data
    if (thumbnail && thumbnail.url) {
      const myCloud = await cloudinary.uploader.upload(thumbnail.url, {
        folder: "courses", // Upload the thumbnail to the "courses" folder in Cloudinary
      });

      data.thumbnail = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }
    createCourse(data, res, next); // Create the course in the database and send the response
  } catch (error) {
    return next(new ErrorHandler(error.message, 500)); // Handle any errors
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
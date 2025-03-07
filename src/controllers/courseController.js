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
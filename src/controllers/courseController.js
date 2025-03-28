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


export const generateVideoUrl = async (req, res, next) => {
  try {
    const { videoUrl } = req.body;

    // Extract Video ID from YouTube URL
    const extractYouTubeVideoId = (url) => {
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(regex);
      return match ? match[1] : null;
    };

    const videoId = extractYouTubeVideoId(videoUrl);
    if (!videoId) return next(new ErrorHandler("Invalid YouTube URL", 400));

    // Return the embeddable YouTube video URL
    res.json({
      success: true,
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};



// Delete a course (admin only)
export const deleteCourse = CatchAsyncError(async (req, res, next) => {
  const { courseId } = req.params;

  const course = await CourseModel.findById(courseId);

  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  // Optionally, delete associated resources (e.g., Cloudinary assets)
  if (course.thumbnail?.public_id) {
    await cloudinary.uploader.destroy(course.thumbnail.public_id);
  }

  await course.remove();

  res.status(200).json({
    success: true,
    message: "Course deleted successfully",
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


// Get enrolled courses
export const getEnrolledCourses = CatchAsyncError(async (req, res, next) => {
  try {
    const userCourseList = req.user?.courses;

    if (!userCourseList || userCourseList.length === 0) {
      return next(new ErrorHandler("No courses found for this user", 404));
    }

    const courses = await CourseModel.find({
      _id: { $in: userCourseList.map(course => course._id) }
    });

    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});
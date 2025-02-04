;
import CourseModel from "../models/courseModel.js";
import { CatchAsyncError } from "../middlewares/catchAsyncErrors.js";

// create course
export const createCourse = CatchAsyncError(async(data ,res)=>{
    const course = await CourseModel.create(data);
    res.status(201).json({
        success:true,
        course
    });
})

// Get All Courses
export const getAllCoursesService = async (res) => {
    const courses = await CourseModel.find().sort({ createdAt: -1 });
  
    res.status(201).json({
      success: true,
      courses,
    });
  };
  
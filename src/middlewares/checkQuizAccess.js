import ErrorHandler from "../utils/ErrorHandler.js";

export const checkQuizAccess = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userCourses = req.user?.courses;

    // Debug logs
    console.log("User courses:", userCourses);
    console.log("Requested courseId:", courseId);

    // Check if the user has purchased the course
    const hasAccess = userCourses?.some(
      (course) => course._id.toString() === courseId
    );

    if (!hasAccess) {
      return next(
        new ErrorHandler("You are not eligible to access this quiz", 403)
      );
    }

    next();
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};
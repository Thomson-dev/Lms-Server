import express from "express";
import {
  addCommentToCourse,
  deleteCourse,
  generateVideoUrl,
  getAllCourses,
  getCourseByUser,
  uploadCourse,
} from "../controllers/courseController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";

const courseRouter = express.Router();

courseRouter.post(
  "/create-course",
  isAuthenticated,
  authorizeRoles("admin"),
  uploadCourse
);

courseRouter.post("/getVdoCipherOTP", generateVideoUrl);

// Delete a course (admin only)
courseRouter.delete(
  "/course/:courseId",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteCourse
);

courseRouter.post(
  "/course/:courseId/comment",
  isAuthenticated,
  addCommentToCourse
);

courseRouter.get("/get-courses", getAllCourses);
courseRouter.get("/get-course-content/:id", isAuthenticated, getCourseByUser);

export default courseRouter;

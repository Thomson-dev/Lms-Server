import express from "express";
import { addCommentToCourse, addQuizToCourse, generateVideoUrl, getAllCourses, getCourseByUser, getQuizzesForCourse, submitQuiz, uploadCourse } from "../controllers/courseController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";

const courseRouter = express.Router();

courseRouter.post(
  "/create-course",
  isAuthenticated,
  authorizeRoles("admin"),
  uploadCourse
);


courseRouter.post("/getVdoCipherOTP", generateVideoUrl);

courseRouter.post("/course/:courseId/quiz", isAuthenticated, authorizeRoles("admin"), addQuizToCourse);
courseRouter.get("/course/:courseId/quizzes", isAuthenticated, getQuizzesForCourse);
courseRouter.post("/course/:courseId/comment", isAuthenticated, addCommentToCourse);
courseRouter.post("/course/:courseId/quiz/:quizId/submit", isAuthenticated, submitQuiz);
courseRouter.get("/get-courses", getAllCourses);
courseRouter.get("/get-course-content/:id", isAuthenticated, getCourseByUser);

export default courseRouter;

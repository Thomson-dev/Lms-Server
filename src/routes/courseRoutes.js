import express from "express";
import { generateVideoUrl, getAllCourses, uploadCourse } from "../controllers/courseController.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth.js";

const courseRouter = express.Router();

courseRouter.post(
  "/create-course",
  isAuthenticated,
  authorizeRoles("admin"),
  uploadCourse
);


courseRouter.post("/getVdoCipherOTP", generateVideoUrl);


courseRouter.get("/get-courses", getAllCourses);

export default courseRouter;

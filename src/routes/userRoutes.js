import express from "express";
import {
  activateUser,
  getUserInfo,
  loginUser,
  logoutUser,
  registrationUser,
  updateAccessToken,
  updateUserInfo,
} from "../controllers/userController.js";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/registration", registrationUser);

userRouter.post("/activate-user", activateUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout", isAuthenticated, logoutUser);

userRouter.get("/me", isAuthenticated, getUserInfo);
userRouter.put("/update-user-info", isAuthenticated, updateUserInfo);

userRouter.post("/refresh-token",  updateAccessToken);

export default userRouter;

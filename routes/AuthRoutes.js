import { Router } from "express";
import {
  logout,
  signin,
  signup,
  userInfo,
} from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const authRoutes = Router();

authRoutes.post("/signup", signup);
authRoutes.post("/signin", signin);
authRoutes.get("/userinfo", verifyToken, userInfo);
authRoutes.get("/logout", verifyToken, logout);

export default authRoutes;

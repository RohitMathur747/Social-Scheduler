import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  generatePosts,
  getGenerations,
  getPosts,
  scheduledPosts,
} from "../controllers/postController.js";
import upload from "../config/multer.js";

const postRouter = express.Router();

postRouter.get("/", protect, getPosts);
postRouter.get("/generations", protect, getGenerations);
postRouter.post("/", protect, upload.single("media"), scheduledPosts);
postRouter.post("/generate", protect, generatePosts);

export default postRouter;

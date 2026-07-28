import express from "express";
import {
  generateAuthUrl,
  syncaccount,
} from "../controllers/socialAuthController.js";
import { protect } from "../middleware/authMiddleware.js";

const socialAuthRouter = express.Router();

socialAuthRouter.get("/:platform/url", protect, generateAuthUrl);
socialAuthRouter.get("/sync", protect, syncaccount);

export default socialAuthRouter;

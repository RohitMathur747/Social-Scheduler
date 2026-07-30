import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";

//generate post
//post /api/posts/generate
export const generatePosts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {};

//get generations
//post /api/posts/generation
export const getGenerations = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {};

//get generations
//get /api/posts
export const getPosts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {};

//scheduled post
//post /api/posts
export const scheduledPosts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {};

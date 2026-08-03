//get all activities
// GET /api/activity

import { AuthRequest } from "../middleware/authMiddleware.js";
import { Response } from "express";
import { ActivityLog } from "../models/activity.js";

export const getActivity = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const activities = await ActivityLog.find({ user: req.user._id })
      .sort({
        createdAt: -1,
      })
      .limit(10)
      .populate("relatedPost", "content mediaUrl mediaType");
    res.json({ activities });
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || "Server error",
    });
  }
};

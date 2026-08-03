import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", requires: true },
    actionType: { type: String, enum: ["POST_PUBLISHED", "AI REPLY"] },
    description: { type: String, required: true },
    relatedPost: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    platform: { type: String },
    aiGeneratedText: { type: String },
  },
  { timestamps: true },
);

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

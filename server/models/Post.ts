import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", requires: true },
    prompt: { type: String, required: true },
    content: { type: String, required: true },
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ["image", "video"] },
    platform: {
      type: String,
      enum: [
        "twitter",
        "facebook",
        "linkedin",
        "instagram",
        "facebook_page",
        "instagram_business",
      ],
    },
    scheduledFor: { type: Date, required: true },
    status: {
      type: String,
      enum: ["draft", "scheduled", "published", "failed"],
      default: "scheduled",
    },
  },
  { timestamps: true },
);

export const Post = mongoose.model("Post", postSchema);

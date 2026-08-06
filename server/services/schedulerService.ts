import cron from "node-cron";
import { Post } from "../models/Post.js";
import { Account } from "../models/account.js";
import zernio from "../config/zernio.js";
import { ActivityLog } from "../models/activity.js";

export const initScheduler = () => {
  // Schedule a task to run every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const postsToPublish = await Post.find({
        status: "scheduled",
        scheduledFor: { $lte: now },
      });
      for (const post of postsToPublish) {
        try {
          const accounts = await Account.find({
            user: post.user,
            platform: { $in: post.platform },
            status: "connected",
            zernioAccountId: { $exists: true, $ne: null },
          });
          if (accounts.length === 0) {
            console.log(
              `No connected accounts found for user ${post.user} on platform ${post.platform}`,
            );
            continue;
          }

          const zernioplatform = accounts.map((acc) => ({
            tform: acc.platform as any,
            accountId: acc.zernioAccountId!,
          }));

          const payload = {
            content: post.content,
            publishNow: true,
            ...(post.mediaUrl
              ? {
                  mediaItems: [
                    { type: post.mediaType || "image", url: post.mediaUrl },
                  ],
                }
              : {}),
            platforms: zernioplatform,
          };
          console.log(
            `Publishing post ${post._id} to zernio with media ${post.mediaUrl || "none"}`,
          );
          const response = await zernio.posts.createPost({
            body: payload,
          });

          const publishedPost = (response.data as any)?.post || response.data;
          if (!publishedPost) {
            throw new Error("No post returned from zernio");
          }
          console.log(`Post ${post._id} published successfully to zernio with id 
            ${publishedPost.id}`);
          await post.save();

          await ActivityLog.create({
            user: post.user,
            actionType: "post_published",
            description: `published post to ${accounts
              .map((acc) => acc.platform)
              .join(",")}`,
            relatedPost: post._id,
          });
        } catch (err: any) {
          console.error(
            `Failed to publish post ${post._id} to zernio: ${err.message}`,
          );
          post.status = "failed";
          await post.save();
        }
      }
      if (postsToPublish.length > 0) {
        console.log(
          `Published ${postsToPublish.length} posts to zernio at ${now.toISOString()}`,
        );
      }
    } catch (error) {
      console.error("Error in scheduled task:", error);
    }
  });
  console.log("Scheduler initialized and running every minute.");
};

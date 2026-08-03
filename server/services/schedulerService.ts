import cron from "node-cron";
import { Post } from "../models/Post.js";
import { Account } from "../models/Account.js";

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
        } catch (error) {}
      }
    } catch (error) {}
  });
};

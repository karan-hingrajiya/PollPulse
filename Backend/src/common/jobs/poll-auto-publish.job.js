import { getCollection } from "../config/db/connection.js";

const JOB_INTERVAL_MS = 60 * 1000;

export const startPollAutoPublishJob = () => {
  setInterval(async () => {
    try {
      const polls = getCollection("polls");
      const now = new Date();

      const result = await polls.updateMany(
        {
          autoPublishOnExpiry: true,
          isPublished: false,
          expiresAt: { $lte: now },
        },
        {
          $set: {
            isPublished: true,
            publishedAt: now,
          },
        },
      );

      if (result.modifiedCount > 0) {
        console.log(
          `[auto-publish-job] Published ${result.modifiedCount} expired poll(s).`,
        );
      }
    } catch (error) {
      console.error("[auto-publish-job] Failed:", error?.message || error);
    }
  }, JOB_INTERVAL_MS);
};


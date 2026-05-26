import { Router } from "express";
import createPollDto from "./dto/create-poll.dto.js";
import validate from "../../common/middleware/validate.middleware.js";
import { authenticate } from "../auth/auth.middleware.js";
import * as pollController from "./polls.controller.js";

const pollRouter = Router();

pollRouter.post(
  "/",
  authenticate,
  validate(createPollDto),
  pollController.createPoll,
);

pollRouter.get("/", authenticate, pollController.getPolls);
pollRouter.get("/:pollId", authenticate, pollController.getPollById);
pollRouter.post("/share/:pollId", authenticate, pollController.createSharePoll);
pollRouter.get("/public/share/:token", pollController.sharePoll);
pollRouter.get("/public/share/:token/results", pollController.getPublicPublishedResults);
pollRouter.patch(
  "/:pollId/publish",
  authenticate,
  pollController.sharePollResult,
);
pollRouter.patch(
  "/:pollId/auto-publish",
  authenticate,
  pollController.updateAutoPublishOnExpiry,
);
pollRouter.delete("/:pollId", authenticate, pollController.deletePollById);

export default pollRouter;

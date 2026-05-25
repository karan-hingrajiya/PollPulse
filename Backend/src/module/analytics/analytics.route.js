import { Router } from "express";
import { authenticate } from "../auth/auth.middleware.js";
import * as analyticsController from "./analytics.controller.js";

const analyticsRouter = Router();

analyticsRouter.get("/overview", authenticate, analyticsController.getOverviewOfAllPolls);
analyticsRouter.get("/:pollId/overview", authenticate, analyticsController.getOverviewOfPoll);
analyticsRouter.get("/:pollId/questions", authenticate, analyticsController.getQuestionWiseAnalytics);
analyticsRouter.get("/:pollId/trend", authenticate, analyticsController.getParticipationTrend);

export default analyticsRouter;

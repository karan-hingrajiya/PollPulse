import * as analyticsService from "./analytics.service.js";
import ApiResponse from "../../common/utils/api-response.js";

export const getOverviewOfAllPolls = async (req, res) => {
  const result = await analyticsService.getOverviewOfAllPolls(req.user.id);
  return ApiResponse.ok(res, "Dashboard analytics overview fetched", { result });
};

export const getOverviewOfPoll = async (req, res) => {
  const result = await analyticsService.getOverviewOfPoll(
    req.user.id,
    req.params.pollId,
  );
  return ApiResponse.ok(res, "Poll analytics overview fetched", { result });
};

export const getQuestionWiseAnalytics = async (req, res) => {
  const result = await analyticsService.getQuestionWiseAnalytics(
    req.user.id,
    req.params.pollId,
  );
  return ApiResponse.ok(res, "Question-wise analytics fetched", { result });
};

export const getParticipationTrend = async (req, res) => {
  const result = await analyticsService.getParticipationTrend(
    req.user.id,
    req.params.pollId,
    req.query.range,
  );
  return ApiResponse.ok(res, "Participation trend fetched", { result });
};

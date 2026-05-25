import ApiResponse from "../../common/utils/api-response.js";
import * as pollServices from "./polls.service.js";

export const createPoll = async (req, res) => {
  const result = await pollServices.createPoll(req.body, req.user.id);
  return ApiResponse.created(res, "Poll is created", { result });
};

export const getPolls = async (req, res) => {
  const result = await pollServices.getPolls(req.user.id);
  return ApiResponse.ok(res, "Polls fetched successfully!", { result });
};

export const getPollById = async (req, res) => {
  const result = await pollServices.getPollById(req.params.pollId, req.user.id);
  return ApiResponse.ok(res, "Poll fetched successfully!", { result });
};

export const createSharePoll = async (req, res) => {
  const token = await pollServices.createSharePoll(
    req.params.pollId,
    req.user.id,
  );
  return ApiResponse.ok(res, "Share poll token generated successfully!", token);
};

export const sharePoll = async (req, res) => {
  const poll = await pollServices.sharePoll(req.params.token);
  return ApiResponse.ok(res, "Poll fetched successfully!", {
    poll,
  });
};

export const getPublicPublishedResults = async (req, res) => {
  const result = await pollServices.getPublicPublishedResults(req.params.token);
  return ApiResponse.ok(res, "Published poll results fetched successfully!", {
    result,
  });
};

export const sharePollResult = async (req, res) => {
  const result = await pollServices.sharePollResult(
    req.params.pollId,
    req.user.id,
  );
  return ApiResponse.ok(res, "Poll results published successfully!", {
    result,
  });
};

export const deletePollById = async (req, res) => {
  const result = await pollServices.deletePollById(
    req.params.pollId,
    req.user.id,
  );
  if (result.isDeleted) {
    return ApiResponse.ok(res, "Poll deleted successfully!", result);
  }
};

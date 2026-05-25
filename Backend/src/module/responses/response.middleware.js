import ApiError from "../../common/utils/api-error.js";
import { getCollection } from "../../common/config/db/connection.js";
import { checkUserValid } from "../auth/auth.middleware.js";
import { assertPollAcceptingResponses } from "../polls/poll-state.guard.js";

export const checkAnonymousMiddleware = async (req, res, next) => {
  const token = req.params.token;

  if (!token) throw ApiError.badRequest("Token doesn't exist!");

  const polls = getCollection("polls");
  const poll = await polls.findOne(
    { shareToken: token },
    {
      projection: {
        _id: 1,
        shareToken: 1,
        expiresAt: 1,
        isAnonymous: 1,
        isPublished: 1,
        questions: 1,
      },
    },
  );

  if (!poll) throw ApiError.notFound("This poll doesn't exist");

  assertPollAcceptingResponses(poll);

  if (poll.isAnonymous === false) {
    await checkUserValid(req, res);
  }

  req.poll = {
    pollId: poll._id,
    shareToken: poll.shareToken,
    expiresAt: poll.expiresAt,
    isAnonymous: poll.isAnonymous,
    isPublished: poll.isPublished,
    questions: poll.questions,
  };

  next();
};

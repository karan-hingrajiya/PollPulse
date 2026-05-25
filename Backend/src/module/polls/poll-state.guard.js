import ApiError from "../../common/utils/api-error.js";

export const assertPollAcceptingResponses = (poll) => {
  if (!poll) {
    throw ApiError.notFound("This poll doesn't exist");
  }

  if (poll.isPublished) {
    throw ApiError.badRequest(
      "This poll is already published and no longer accepting responses.",
    );
  }

  if (poll.expiresAt && poll.expiresAt < new Date()) {
    throw ApiError.badRequest(
      "This poll has expired and is no longer accepting responses.",
    );
  }
};

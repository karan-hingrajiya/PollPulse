import { ObjectId } from "mongodb";
import { getCollection } from "../../common/config/db/connection.js";
import ApiError from "../../common/utils/api-error.js";
import crypto from "node:crypto";
import { assertPollAcceptingResponses } from "./poll-state.guard.js";

export const createPoll = async (payload, userId) => {
  if (!userId || !ObjectId.isValid(userId)) {
    throw ApiError.unauthorized("Invalid user session. Please login again.");
  }

  if (!payload.title || payload.title.trim().length === 0) {
    throw ApiError.badRequest("Please provide a title for the poll!");
  }

  if (!payload.questions || payload.questions.length === 0) {
    throw ApiError.badRequest(
      "Poll can't be empty. Add at least one question!",
    );
  }
  const polls = getCollection("polls");
  let expiresIn;
  if (!payload.expiresAt) {
    expiresIn = new Date(Date.now() + 24 * 60 * 60 * 1000); // default expiry time: 24 hours from now
  } else {
    expiresIn = new Date(payload.expiresAt);
    if (Number.isNaN(expiresIn.getTime())) {
      throw ApiError.badRequest(
        "Invalid expiry date. Please provide a valid date/time.",
      );
    }
    if (expiresIn <= new Date()) {
      throw ApiError.badRequest(
        "Expiry date must be greater than current date/time.",
      );
    }
  }

  const questionsArr = payload.questions.map((question) => {
    if (!question.text || question.text.trim().length === 0) {
      throw ApiError.badRequest("Please provide the question text!");
    }

    if (!question.options || question.options.length < 2) {
      throw ApiError.badRequest(
        "Each question must have at least two options!",
      );
    }

    const optionsArr = question.options.map((option) => ({
      ...option,
      _id: new ObjectId(), // Unique ID for each option
    }));

    return {
      ...question,
      _id: new ObjectId(), // Unique ID for each question
      options: optionsArr,
      isMandatory: question.isMandatory || false,
    };
  });

  const pollDoc = {
    title: payload.title,
    createdBy: new ObjectId(userId),
    createdAt: new Date(),
    expiresAt: expiresIn,
    isPublished: payload.isPublished || false,
    isAnonymous: payload.isAnonymous || false,
    autoPublishOnExpiry: Boolean(payload.autoPublishOnExpiry),
    questions: questionsArr,
    ...(typeof payload.description === "string" &&
    payload.description.trim().length > 0
      ? { description: payload.description.trim() }
      : {}),
  };

  let result;
  try {
    result = await polls.insertOne(pollDoc);
  } catch (err) {
    // Mongo schema/validation failures should be user-facing 400s, not opaque 500s.
    if (err?.name === "MongoServerError" && err?.code === 121) {
      throw ApiError.badRequest(
        "Poll data is invalid. Please check title, description, expiry, questions, and options.",
      );
    }
    throw err;
  }
  // Emit updated platform stats to landing page listeners
  try {
    const { getIO, emitStatsUpdate } =
      await import("../../common/config/socket.js");
    emitStatsUpdate(getIO());
  } catch {
    // Socket may not be initialized in test environments
  }
  return result;
};

export const getPolls = async (userId) => {
  const polls = getCollection("polls");

  // Use aggregation to include a per-poll totalResponses count
  const result = await polls
    .aggregate([
      { $match: { createdBy: new ObjectId(userId) } },
      {
        $lookup: {
          from: "responses",
          localField: "_id",
          foreignField: "pollId",
          as: "pollResponses",
        },
      },
      {
        $addFields: {
          totalResponses: { $size: { $ifNull: ["$pollResponses", []] } },
        },
      },
      {
        $project: {
          questions: 0,
          shareToken: 0,
          createdBy: 0,
          pollResponses: 0,
        },
      },
    ])
    .toArray();

  return result || [];
};

export const getPollById = async (pollId, userId) => {
  if (!ObjectId.isValid(pollId)) {
    throw ApiError.badRequest("Invalid poll ID format");
  }

  const polls = getCollection("polls");
  const result = await polls.findOne(
    { _id: new ObjectId(pollId), createdBy: new ObjectId(userId) },
    {
      projection: {
        shareToken: 0,
      },
    },
  );

  if (!result) throw ApiError.notFound("This poll doesn't exist");

  return result;
};

export const createSharePoll = async (pollId, userId) => {
  if (!ObjectId.isValid(pollId)) {
    throw ApiError.badRequest("Invalid poll ID format");
  }

  const polls = getCollection("polls");
  const result = await polls.findOne(
    { _id: new ObjectId(pollId), createdBy: new ObjectId(userId) },
    {
      projection: {
        shareToken: 1,
        _id: 1,
      },
    },
  );

  if (!result) throw ApiError.notFound("This poll doesn't exist");

  // If the poll already has a share token, return it instead of overwriting it i get this flow cause if user want to share the link again and click on share btn then link will replace old token and create new one so insted of that return old one if its exist.
  // This ensures previously shared links don't break.
  if (result.shareToken) {
    return result.shareToken;
  }

  const token = crypto.randomBytes(32).toString("hex");

  await polls.updateOne(
    { _id: new ObjectId(pollId), createdBy: new ObjectId(userId) },
    {
      $set: { shareToken: token },
    },
  );

  return token;
};

export const sharePoll = async (token) => {
  if (!token) throw ApiError.badRequest("token doesn't exist");

  const polls = getCollection("polls");
  const poll = await polls.findOne(
    { shareToken: token },
    {
      projection: {
        _id: 1,
        questions: 1,
        title: 1,
        description: 1,
        expiresAt: 1,
        isPublished: 1,
        isAnonymous: 1,
      },
    },
  );

  if (!poll) throw ApiError.notFound("Sorry, requested poll doesn't exist!");
  assertPollAcceptingResponses(poll);
  return poll;
};

export const getPublicPublishedResults = async (token) => {
  if (!token) throw ApiError.badRequest("token doesn't exist");

  const polls = getCollection("polls");
  const poll = await polls.findOne(
    { shareToken: token },
    {
      projection: {
        _id: 1,
        title: 1,
        description: 1,
        isPublished: 1,
        publishedAt: 1,
        questions: 1,
      },
    },
  );

  if (!poll) throw ApiError.notFound("Sorry, requested poll doesn't exist!");
  if (!poll.isPublished) {
    throw ApiError.badRequest("Poll results are not published yet.");
  }

  const responses = getCollection("responses");
  const pollResponses = await responses.find({ pollId: poll._id }).toArray();
  const totalResponses = pollResponses.length;

  const questions = (poll.questions || []).map((question) => {
    const optionCounts = new Map();
    for (const option of question.options || []) {
      optionCounts.set(String(option._id), {
        optionId: option._id,
        text: option.text,
        count: 0,
      });
    }

    let totalAnswered = 0;
    for (const response of pollResponses) {
      const ans = (response.answers || []).find(
        (a) => String(a.questionId) === String(question._id),
      );

      if (!ans || ans.selectedOptionId === null) continue;

      totalAnswered += 1;
      const key = String(ans.selectedOptionId);
      if (optionCounts.has(key)) {
        optionCounts.get(key).count += 1;
      }
    }

    const options = Array.from(optionCounts.values()).map((opt) => ({
      ...opt,
      percentage:
        totalAnswered === 0
          ? 0
          : Number(((opt.count / totalAnswered) * 100).toFixed(2)),
    }));

    return {
      questionId: question._id,
      text: question.text,
      totalAnswered,
      skippedCount: totalResponses - totalAnswered,
      options,
    };
  });

  return {
    pollId: poll._id,
    title: poll.title,
    description: poll.description,
    publishedAt: poll.publishedAt ?? null,
    totalResponses,
    questions,
  };
};

export const sharePollResult = async (pollId, userId) => {
  if (!ObjectId.isValid(pollId)) {
    throw ApiError.badRequest("Invalid poll ID format");
  }

  const filter = {
    _id: new ObjectId(pollId),
    createdBy: new ObjectId(userId),
  };
  const polls = getCollection("polls");
  const poll = await polls.findOne(filter, {
    projection: {
      _id: 1,
      isPublished: 1,
      expiresAt: 1,
      publishedAt: 1,
      createdBy: 1,
      shareToken: 1,
    },
  });

  if (!poll) throw ApiError.notFound("This poll doesn't exist");

  if (poll.isPublished) {
    return {
      pollId: poll._id,
      isPublished: true,
      publishedAt: poll.publishedAt ?? null,
      message: "Poll results are already published.",
    };
  }

  const now = new Date();

  const result = await polls.findOneAndUpdate(
    filter,
    {
      $set: {
        isPublished: true,
        publishedAt: now,
      },
    },
    {
      projection: {
        shareToken: 0,
      },
      returnDocument: "after",
    },
  );

  return result;
};

export const deletePollById = async (pollId, userId) => {
  if (!ObjectId.isValid(pollId)) {
    throw ApiError.badRequest("Invalid poll ID format");
  }

  const pollObjectId = new ObjectId(pollId);
  const polls = getCollection("polls");
  const result = await polls.findOne({
    _id: pollObjectId,
    createdBy: new ObjectId(userId),
  });

  if (!result) throw ApiError.notFound("This poll doesn't exist");

  const deletedPoll = await polls.deleteOne({
    _id: pollObjectId,
    createdBy: new ObjectId(userId),
  });

  if (!deletedPoll.acknowledged || deletedPoll.deletedCount === 0) {
    throw ApiError.badRequest("This poll couldn't be deleted");
  }

  // Clean up all responses associated with this deleted poll to prevent orphaned data
  const responses = getCollection("responses");
  await responses.deleteMany({ pollId: pollObjectId });

  return {
    isDeleted: true,
    pollId,
    message: "poll is successfully deleted",
  };
};

export const updateAutoPublishOnExpiry = async (
  pollId,
  userId,
  autoPublishOnExpiry,
) => {
  if (!ObjectId.isValid(pollId)) {
    throw ApiError.badRequest("Invalid poll ID format");
  }

  if (typeof autoPublishOnExpiry !== "boolean") {
    throw ApiError.badRequest(
      "Auto-publish setting must be true or false.",
    );
  }

  const polls = getCollection("polls");
  const updated = await polls.findOneAndUpdate(
    { _id: new ObjectId(pollId), createdBy: new ObjectId(userId) },
    { $set: { autoPublishOnExpiry } },
    {
      returnDocument: "after",
      projection: {
        _id: 1,
        autoPublishOnExpiry: 1,
        isPublished: 1,
        expiresAt: 1,
      },
    },
  );

  if (!updated) {
    throw ApiError.notFound("This poll doesn't exist");
  }

  return updated;
};

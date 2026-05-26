import ApiError from "../../common/utils/api-error.js";
import { getCollection } from "../../common/config/db/connection.js";
import { ObjectId } from "mongodb";

export const getOverviewOfAllPolls = async (userId) => {
  const polls = getCollection("polls");
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  const allPolls = await polls
    .aggregate([
      {
        $match: {
          createdBy: new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "responses", // Foreign collection
          localField: "_id",
          foreignField: "pollId",
          as: "pollsDetails",
        },
      },
    ])
    .toArray();

  if (allPolls.length === 0) {
    return {
      totalPolls: 0,
      publishedPolls: 0,
      draftPolls: 0,
      livePolls: 0,
      expiredPolls: 0,
      totalResponses: 0,
      totalResponsesToday: 0,
      overallCompletionRatePercent: 0,
    };
  }

  const summary = {
    totalPolls: allPolls.length,
    publishedPolls: 0,
    draftPolls: 0,
    livePolls: 0,
    expiredPolls: 0,
    totalResponses: 0,
    responsesToday: 0,
    totalQuestions: 0,
    answeredSelections: 0,
  };

  const toValidDate = (value) => {
    if (!value) return null;
    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  for (const poll of allPolls) {
    const expiry = toValidDate(poll.expiresAt);
    const isExpiredByTime = Boolean(expiry && expiry < now);
    const isExpired = Boolean(poll.isPublished || isExpiredByTime);

    if (poll.isPublished) {
      summary.publishedPolls += 1;
    } else {
      summary.draftPolls += 1;
    }

    if (isExpired) {
      summary.expiredPolls += 1;
    }

    if (!poll.isPublished && !isExpiredByTime) {
      summary.livePolls += 1;
    }

    summary.totalQuestions += poll.questions?.length || 0;

    const pollResponses = poll.pollsDetails || [];
    summary.totalResponses += pollResponses.length;

    for (const response of pollResponses) {
      const submittedAt = toValidDate(response.submittedAt);
      if (submittedAt && submittedAt >= dayStart) {
        summary.responsesToday += 1;
      }

      for (const ans of response.answers || []) {
        if (ans.selectedOptionId !== null) {
          summary.answeredSelections += 1;
        }
      }
    }
  }

  let overallCompletionRatePercent = 0;
  if (summary.totalQuestions > 0 && summary.totalResponses > 0) {
    overallCompletionRatePercent = Math.round(
      (summary.answeredSelections /
        (summary.totalQuestions * summary.totalResponses)) *
        100,
    );
  }

  return {
    totalPolls: summary.totalPolls,
    publishedPolls: summary.publishedPolls,
    draftPolls: summary.draftPolls,
    livePolls: summary.livePolls,
    expiredPolls: summary.expiredPolls,
    totalResponses: summary.totalResponses,
    totalResponsesToday: summary.responsesToday,
    overallCompletionRatePercent,
  };
};

export const getOverviewOfPoll = async (userId, pollId) => {
  if (!ObjectId.isValid(pollId)) {
    throw ApiError.badRequest("Invalid poll ID format");
  }

  const polls = getCollection("polls");
  const responses = getCollection("responses");
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  const data = await polls
    .aggregate([
      {
        $match: {
          _id: new ObjectId(pollId),
          createdBy: new ObjectId(userId),
        },
      },
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
          totalResponses: { $size: "$pollResponses" },
          totalQuestions: { $size: "$questions" },
          isExpired: {
            $or: [{ $eq: ["$isPublished", true] }, { $lt: ["$expiresAt", now] }],
          },
          responsesToday: {
            $size: {
              $filter: {
                input: "$pollResponses",
                as: "response",
                cond: { $gte: ["$$response.submittedAt", dayStart] },
              },
            },
          },
          authenticatedResponses: {
            $size: {
              $filter: {
                input: "$pollResponses",
                as: "response",
                cond: { $ne: ["$$response.respondentId", null] },
              },
            },
          },
          anonymousResponses: {
            $size: {
              $filter: {
                input: "$pollResponses",
                as: "response",
                cond: { $eq: ["$$response.respondentId", null] },
              },
            },
          },
          totalAnsweredSelections: {
            $sum: {
              $map: {
                input: "$pollResponses",
                as: "response",
                in: {
                  $size: {
                    $filter: {
                      input: "$$response.answers",
                      as: "answer",
                      cond: { $ne: ["$$answer.selectedOptionId", null] },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          averageCompletionRatePercent: {
            $cond: [
              {
                $or: [
                  { $eq: ["$totalResponses", 0] },
                  { $eq: ["$totalQuestions", 0] },
                ],
              },
              0,
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          "$totalAnsweredSelections",
                          { $multiply: ["$totalResponses", "$totalQuestions"] },
                        ],
                      },
                      100,
                    ],
                  },
                  2,
                ],
              },
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          isPublished: 1,
          autoPublishOnExpiry: 1,
          isAnonymous: 1,
          createdAt: 1,
          expiresAt: 1,
          publishedAt: 1,
          totalResponses: 1,
          totalQuestions: 1,
          isExpired: 1,
          responsesToday: 1,
          authenticatedResponses: 1,
          anonymousResponses: 1,
          totalMandatoryQuestions: 1,
          totalAnsweredSelections: 1,
          averageCompletionRatePercent: 1,
          lastResponseAt: 1,
        },
      },
    ])
    .toArray();

  if (data.length === 0) {
    throw ApiError.notFound("This poll doesn't exist");
  }

  const overview = data[0];

  const pollDoc = await polls.findOne(
    { _id: new ObjectId(pollId), createdBy: new ObjectId(userId) },
    {
      projection: {
        _id: 1,
        questions: 1,
      },
    },
  );

  const mandatoryQuestionIds = new Set(
    (pollDoc?.questions || [])
      .filter((q) => q.isMandatory === true)
      .map((q) => String(q._id)),
  );

  const totalMandatoryQuestions = mandatoryQuestionIds.size;
  const pollResponses = await responses
    .find({ pollId: new ObjectId(pollId) })
    .toArray();

  let fullyCompletedMandatoryCount = 0;
  let totalMandatoryAnsweredSelections = 0;

  for (const response of pollResponses) {
    let answeredMandatoryCount = 0;

    for (const ans of response.answers || []) {
      if (
        mandatoryQuestionIds.has(String(ans.questionId)) &&
        ans.selectedOptionId !== null
      ) {
        answeredMandatoryCount += 1;
      }
    }

    totalMandatoryAnsweredSelections += answeredMandatoryCount;

    if (
      totalMandatoryQuestions > 0 &&
      answeredMandatoryCount === totalMandatoryQuestions
    ) {
      fullyCompletedMandatoryCount += 1;
    }
  }

  let averageMandatoryCompletionRatePercent = 0;
  let mandatoryFullCompletionRatePercent = 0;

  if (overview.totalResponses > 0 && totalMandatoryQuestions > 0) {
    averageMandatoryCompletionRatePercent = Number(
      (
        (totalMandatoryAnsweredSelections /
          (overview.totalResponses * totalMandatoryQuestions)) *
        100
      ).toFixed(2),
    );

    mandatoryFullCompletionRatePercent = Number(
      ((fullyCompletedMandatoryCount / overview.totalResponses) * 100).toFixed(
        2,
      ),
    );
  }

  return {
    ...overview,
    totalMandatoryQuestions,
    fullyCompletedMandatoryCount,
    averageMandatoryCompletionRatePercent,
    mandatoryFullCompletionRatePercent,
  };
};

export const getQuestionWiseAnalytics = async (userId, pollId) => {
  if (!ObjectId.isValid(pollId)) {
    throw ApiError.badRequest("Invalid poll ID format");
  }

  const polls = getCollection("polls");
  const responses = getCollection("responses");
  const pollObjectId = new ObjectId(pollId);

  const poll = await polls.findOne(
    { _id: pollObjectId, createdBy: new ObjectId(userId) },
    {
      projection: {
        _id: 1,
        title: 1,
        questions: 1,
      },
    },
  );

  if (!poll) {
    throw ApiError.notFound("This poll doesn't exist");
  }

  const pollResponses = await responses
    .find({ pollId: pollObjectId })
    .toArray();
  const totalResponses = pollResponses.length;

  const result = {
    pollId: poll._id,
    title: poll.title,
    totalResponses,
    questions: [],
  };

  for (const question of poll.questions || []) {
    const optionCount = new Map();

    for (const option of question.options || []) {
      optionCount.set(String(option._id), {
        optionId: option._id,
        optionText: option.text,
        count: 0,
      });
    }

    let totalAnswerCountForCurrQuestion = 0;

    for (const response of pollResponses) {
      const matchedAnswer = (response.answers || []).find((ans) => {
        if (String(ans.questionId) === String(question._id)) {
          return ans;
        }
      });

      if (!matchedAnswer || matchedAnswer.selectedOptionId === null) {
        continue;
      }

      totalAnswerCountForCurrQuestion += 1;
      const key = String(matchedAnswer.selectedOptionId);
      if (optionCount.has(key)) {
        optionCount.get(key).count += 1;
      }
    }

    const skippedCount = totalResponses - totalAnswerCountForCurrQuestion; //it can be complicated but once you dry run it it makes sense we are doing here is iterating over responses and for curr question we are iterating we are checking for that question user have asnwered it or not.
    const options = Array.from(optionCount.values()).map((opt) => {
      return {
        ...opt,
        percentage:
          totalAnswerCountForCurrQuestion === 0
            ? 0
            : Number(
                ((opt.count / totalAnswerCountForCurrQuestion) * 100).toFixed(
                  2,
                ),
              ),
      };
    });

    result.questions.push({
      questionId: question._id,
      text: question.text,
      isMandatory: Boolean(question.isMandatory),
      skippedCount,
      totalAnswers: totalAnswerCountForCurrQuestion,
      options,
    });
  }

  return result;
};

export const getParticipationTrend = async (userId, pollId, range = "7d") => {
  if (!ObjectId.isValid(pollId)) {
    throw ApiError.badRequest("Invalid poll ID format");
  }

  const polls = getCollection("polls");
  const responses = getCollection("responses");
  const pollObjectId = new ObjectId(pollId);
  const ownerPoll = await polls.findOne(
    { _id: pollObjectId, createdBy: new ObjectId(userId) },
    { projection: { _id: 1, title: 1 } },
  );

  if (!ownerPoll) {
    throw ApiError.notFound("This poll doesn't exist");
  }

  const now = new Date();
  let fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  let bucket = "day";

  if (range === "24h") {
    fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    bucket = "hour";
  } else if (range === "7d") {
    fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    bucket = "day";
  } else if (range === "30d") {
    fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    bucket = "day";
  } else {
    throw ApiError.badRequest("Invalid range. Use 24h, 7d, or 30d.");
  }

  const dateFormat = bucket === "hour" ? "%Y-%m-%d %H:00" : "%Y-%m-%d";

  const points = await responses
    .aggregate([
      {
        $match: {
          pollId: pollObjectId,
          submittedAt: { $gte: fromDate, $lte: now },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: dateFormat,
              date: "$submittedAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          bucket: "$_id",
          count: 1,
        },
      },
    ])
    .toArray();

  return {
    pollId: ownerPoll._id,
    title: ownerPoll.title,
    range,
    bucket,
    from: fromDate,
    to: now,
    points,
  };
};

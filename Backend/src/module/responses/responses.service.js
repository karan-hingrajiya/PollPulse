import ApiError from "../../common/utils/api-error.js";
import { ObjectId } from "mongodb";
import { getCollection } from "../../common/config/db/connection.js";

export const submitResponse = async (poll, user, payload) => {
  if (!payload.answers || !Array.isArray(payload.answers)) {
    throw ApiError.badRequest("Answers must be provided as an array.");
  }

  const responses = getCollection("responses");
  if (payload.answers.length > poll.questions.length) {
    // this check is left by me chatgpt suggestd me to think this scenario as well
    throw ApiError.badRequest(
      "You cannot submit more answers than total poll questions.",
    );
  }

  if (!payload.fingerprint) {
    throw ApiError.badRequest("Fingerprint is required for every user");
  }

  //here is one scenario can happen user can submit poll twice one through when he is loggedin and other response thorugh logout as anonymous user if poll allows it so for that we check here both condition through fingerprint so user can escape the condition.
  const duplicateCheckOr = [{ fingerprint: payload.fingerprint }];
  if (user && user.id) {
    duplicateCheckOr.push({ respondentId: new ObjectId(user.id) });
  }

  const isSubmittedAlready = await responses.findOne({
    pollId: poll.pollId,
    $or: duplicateCheckOr,
  });

  if (isSubmittedAlready) {
    throw ApiError.badRequest(
      "Response for this poll has already been submitted once",
    );
  }

  const answersByQuestionId = new Map();

  for (const answer of payload.answers) {
    //checking the same question is not repeting again and mapping the questionid to its related answer
    const questionId = String(answer.questionId);

    if (answersByQuestionId.has(questionId)) {
      throw ApiError.badRequest("Duplicate answers for the same question.");
    }

    answersByQuestionId.set(questionId, answer);
  }

  const pollQuestionIds = new Set(poll.questions.map((q) => String(q._id)));

  for (const answer of payload.answers) {
    //its not needed but we do it anyway for more secure way that we can handle answers if no answer.queId exist then it is invalid question id it can happen cause someone can do curl req on our server and can send invalid data.
    if (!pollQuestionIds.has(String(answer.questionId))) {
      throw ApiError.badRequest("Answer contains an invalid questionId.");
    }
  }

  const answersArr = poll.questions.map((question) => {
    const questionId = String(question._id);
    const matchedAnswer = answersByQuestionId.get(questionId);
    const selectedOptionId = matchedAnswer?.selectedOptionId ?? null;

    if (question.isMandatory && !selectedOptionId) {
      throw ApiError.badRequest("All mandatory questions must be answered.");
    }

    if (selectedOptionId) {
      const isValidOption = question.options.some(
        (option) => String(option._id) === String(selectedOptionId),
      );

      if (!isValidOption) {
        throw ApiError.badRequest(
          "Selected option does not belong to question.",
        );
      }
    }

    return {
      _id: new ObjectId(),
      questionId: new ObjectId(questionId),
      selectedOptionId: selectedOptionId
        ? new ObjectId(selectedOptionId)
        : null,
    };
  });

  const respondentId = user?.id ? new ObjectId(String(user.id)) : null;

  // Emit updated platform stats to landing page listeners
  try {
    const { getIO, emitStatsUpdate } =
      await import("../../common/config/socket.js");
    emitStatsUpdate(getIO());
  } catch {
    // Socket may not be initialized in test environments
  }
  const result = await responses.insertOne({
    respondentId,
    submittedAt: new Date(),
    pollId: poll.pollId,
    answers: answersArr,
    fingerprint: payload.fingerprint,
  });

  return {
    responseId: result.insertedId,
    pollId: poll.pollId,
    totalQuestions: poll.questions.length,
    answeredCount: answersArr.filter((ans) => ans.selectedOptionId !== null)
      .length,
    skippedCount: answersArr.filter((ans) => ans.selectedOptionId === null)
      .length,
  };
};

import { getCollection } from "../../common/config/db/connection.js";

export const getPlatformStats = async () => {
  const polls = getCollection("polls");
  const responses = getCollection("responses");

  const [totalPolls, totalResponses] = await Promise.all([
    polls.countDocuments({}),
    responses.countDocuments({}),
  ]);

  return { totalPolls, totalResponses };
};
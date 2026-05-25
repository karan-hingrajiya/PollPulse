import { apiClient } from "@/common/api-client";
import type {
  PollAnalyticsOverview,
  PollQuestionAnalytics,
  ParticipationTrend,
} from "@/pages/dashboard/types";

export async function fetchPollAnalyticsOverview(
  pollId: string
): Promise<PollAnalyticsOverview> {
  const res = await apiClient.get(`/api/analytics/${pollId}/overview`);
  if (!res.data?.data?.result) throw new Error("Invalid response from server");
  return res.data.data.result;
}

export async function fetchQuestionAnalytics(
  pollId: string
): Promise<PollQuestionAnalytics> {
  const res = await apiClient.get(`/api/analytics/${pollId}/questions`);
  if (!res.data?.data?.result) throw new Error("Invalid response from server");
  return res.data.data.result;
}

export async function fetchParticipationTrend(
  pollId: string,
  range: "24h" | "7d" | "30d" = "7d"
): Promise<ParticipationTrend> {
  const res = await apiClient.get(
    `/api/analytics/${pollId}/trend?range=${range}`
  );
  if (!res.data?.data?.result) throw new Error("Invalid response from server");
  return res.data.data.result;
}
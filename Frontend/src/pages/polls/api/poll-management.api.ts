import { apiClient } from "@/common/api-client";
import type {
  CreatePollPayload,
  PublicPoll,
  SubmitResponsePayload,
  PublishedPollResults,
} from "@/pages/dashboard/types";

const silentHandledErrorConfig = {
  suppressGlobalErrorHandler: true,
} as any;

export async function createPoll(payload: CreatePollPayload) {
  const res = await apiClient.post("/api/poll", payload);
  return res.data;
}

export async function getShareToken(pollId: string): Promise<string> {
  const res = await apiClient.post(`/api/poll/share/${pollId}`);
  // backend returns token directly as data object
  const token = res.data?.data?.result ?? res.data?.data;
  if (!token) throw new Error("Failed to generate share token");
  return typeof token === "string" ? token : JSON.stringify(token);
}

export async function publishPoll(pollId: string) {
  const res = await apiClient.patch(`/api/poll/${pollId}/publish`);
  return res.data;
}

export async function getPublicPoll(token: string): Promise<PublicPoll> {
  const res = await apiClient.get(
    `/api/poll/public/share/${token}`,
    silentHandledErrorConfig,
  );
  // backend returns { data: { poll: {...} } }
  const poll = res.data?.data?.poll;
  if (!poll) throw new Error("Poll not found");
  return poll;
}

export async function submitResponse(
  token: string,
  payload: SubmitResponsePayload
) {
  const res = await apiClient.post(
    `/api/response/${token}`,
    payload,
    silentHandledErrorConfig,
  );
  return res.data;
}

export async function getPublishedResults(
  token: string
): Promise<PublishedPollResults> {
  const res = await apiClient.get(
    `/api/poll/public/share/${token}/results`,
    silentHandledErrorConfig,
  );
  if (!res.data?.data?.result) throw new Error("Results not available");
  return res.data.data.result;
}

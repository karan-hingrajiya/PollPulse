import { apiClient } from "@/common/api-client";
import type {
  AnalyticsOverview,
  DashboardApiResponse,
  DashboardPoll,
  DashboardUser,
} from "../types";

export async function fetchDashboardOverview(): Promise<AnalyticsOverview> {
  const response = await apiClient.get<DashboardApiResponse<AnalyticsOverview>>("/api/analytics/overview");
  
  if (!response.data?.data?.result) {
    throw new Error("Invalid API response shape");
  }
  return response.data.data.result;
}

export async function fetchPolls(): Promise<DashboardPoll[]> {
  const response = await apiClient.get<DashboardApiResponse<DashboardPoll[]>>("/api/poll");

  if (!response.data?.data?.result) {
    throw new Error("Invalid API response shape");
  }
  return response.data.data.result;
}

export async function fetchCurrentUser(): Promise<DashboardUser> {
  const response = await apiClient.get<{
    status: boolean;
    message: string;
    data?: DashboardUser;
  }>("/api/auth/getme");

  if (!response.data?.data) {
    throw new Error("Invalid API response shape");
  }

  return response.data.data;
}

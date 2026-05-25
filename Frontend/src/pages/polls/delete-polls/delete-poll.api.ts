import { apiClient } from "@/common/api-client";

export interface DeleteApiResponse<T> {
  status: boolean;
  message: string;
  data?: {
    result?: T;
  };
}

export interface DeletePollResponse {
  isDeleted: boolean;
  pollId: string;
  message: string;
}

export async function deletePoll(pollId: string): Promise<DeletePollResponse> {
  const response = await apiClient.delete<DeleteApiResponse<DeletePollResponse>>(`/api/poll/${pollId}`);
  
  // If backend sends the full result object, return it
  if (response.data?.data?.result) {
    return response.data.data.result;
  }
  
  // Fallback: If backend just sends { status: true, message: "Deleted" }
  return {
    isDeleted: true,
    pollId,
    message: response.data?.message || "Poll deleted successfully",
  };
}

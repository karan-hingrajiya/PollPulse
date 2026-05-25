import { useCallback, useEffect, useState } from "react";
import {
  fetchCurrentUser,
  fetchDashboardOverview,
  fetchPolls,
} from "../api/dashboard.api";
import type { AnalyticsOverview, DashboardPoll, DashboardUser } from "../types";
import { getUserFriendlyError } from "@/common/error-handler";
import { useDeletePoll } from "@/pages/polls/delete-polls/useDeletePoll";

interface UseDashboardDataResult {
  user: DashboardUser | null;
  polls: DashboardPoll[];
  overview: AnalyticsOverview | null;
  isLoading: boolean;
  error: string | null;
  deletingPollId: string | null;
  refetch: () => Promise<void>;
  handleDeletePoll: (pollId: string) => Promise<void>;
}

export function useDashboardData(): UseDashboardDataResult {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [polls, setPolls] = useState<DashboardPoll[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [userData, pollData, overviewData] = await Promise.all([
        fetchCurrentUser(),
        fetchPolls(),
        fetchDashboardOverview(),
      ]);

      setUser(userData);
      setPolls(pollData);
      setOverview(overviewData);
    } catch (err) {
      setError(getUserFriendlyError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  
  const { deletingPollId, handleDeletePoll } = useDeletePoll((pollId) => {
    // On Success: Remove the poll from the UI instantly
    setPolls((prev) => prev.filter((poll) => poll._id !== pollId));
    // On Success: Refetch the overview stats in the background
    fetchDashboardOverview().then(setOverview).catch(() => {});
  });

  return {
    user,
    polls,
    overview,
    isLoading,
    error,
    deletingPollId,
    refetch: loadData,
    handleDeletePoll,
  };
}

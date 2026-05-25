import { useState, useEffect, useCallback } from "react";
import {
  fetchPollAnalyticsOverview,
  fetchQuestionAnalytics,
  fetchParticipationTrend,
} from "../api/analytics.api";
import { publishPoll, getShareToken } from "../api/poll-management.api";
import type {
  PollAnalyticsOverview,
  PollQuestionAnalytics,
  ParticipationTrend,
} from "@/pages/dashboard/types";
import { getUserFriendlyError } from "@/common/error-handler";
import { toast } from "sonner";

type TrendRange = "24h" | "7d" | "30d";

export function usePollAnalytics(pollId: string) {
  const [overview, setOverview] = useState<PollAnalyticsOverview | null>(null);
  const [questions, setQuestions] = useState<PollQuestionAnalytics | null>(null);
  const [trend, setTrend] = useState<ParticipationTrend | null>(null);
  const [trendRange, setTrendRange] = useState<TrendRange>("7d");
  const [isLoading, setIsLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!pollId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [overviewData, questionsData, trendData] = await Promise.all([
        fetchPollAnalyticsOverview(pollId),
        fetchQuestionAnalytics(pollId),
        fetchParticipationTrend(pollId, "7d"),
      ]);
      setOverview(overviewData);
      setQuestions(questionsData);
      setTrend(trendData);
    } catch (err) {
      setError(getUserFriendlyError(err));
    } finally {
      setIsLoading(false);
    }
  }, [pollId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const changeTrendRange = async (range: TrendRange) => {
    setTrendRange(range);
    setTrendLoading(true);
    try {
      const data = await fetchParticipationTrend(pollId, range);
      setTrend(data);
    } catch {
      toast.error("Failed to load trend data");
    } finally {
      setTrendLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!pollId) return;
    setIsPublishing(true);
    try {
      await publishPoll(pollId);
      toast.success("Poll results published successfully!");
      // Refresh overview to get updated isPublished state
      const updated = await fetchPollAnalyticsOverview(pollId);
      setOverview(updated);
    } catch {
      toast.error("Failed to publish poll");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleGetShareToken = async () => {
    if (!pollId) return;
    setShareLoading(true);
    try {
      const token = await getShareToken(pollId);
      setShareToken(token);
    } catch {
      toast.error("Failed to generate share link");
    } finally {
      setShareLoading(false);
    }
  };

  return {
    overview,
    questions,
    trend,
    trendRange,
    isLoading,
    trendLoading,
    error,
    isPublishing,
    shareToken,
    shareLoading,
    refetch: loadData,
    handlePublish,
    handleGetShareToken,
    changeTrendRange,
  };
}
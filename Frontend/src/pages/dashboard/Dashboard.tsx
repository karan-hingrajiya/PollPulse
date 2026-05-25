import DashboardView from "./DashboardView";
import { useDashboardData } from "./hooks/useDashboardData";
import { useNavigate } from "react-router";

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    user,
    polls,
    overview,
    isLoading,
    error,
    refetch,
    handleDeletePoll,
    deletingPollId,
  } = useDashboardData();

  return (
    <DashboardView
      user={user}
      polls={polls}
      overview={overview}
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      onCreatePoll={() => navigate("/dashboard/polls/create")}
      onPollClick={(pollId : string) =>
        navigate(`/dashboard/polls/${pollId}/analytics`)
      }
      onDeletePoll={handleDeletePoll}
      deletingPollId={deletingPollId}
    />
  );
}
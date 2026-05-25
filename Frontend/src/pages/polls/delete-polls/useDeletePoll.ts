import { useState } from "react";
import { deletePoll } from "./delete-poll.api";
import { toast } from "sonner";

export function useDeletePoll(onSuccess?: (pollId: string) => void) {
  const [deletingPollId, setDeletingPollId] = useState<string | null>(null);

  const handleDeletePoll = async (pollId: string) => {
    setDeletingPollId(pollId);
    try {
      await deletePoll(pollId);
      toast.success("Poll removed successfully!");
      
      // Let the calling component know it succeeded so it can update its UI
      if (onSuccess) {
        onSuccess(pollId);
      }
    } catch (err) {
      // Note: The global Axios interceptor handles displaying the error toast
      console.error("Failed to delete poll", err);
    } finally {
      setDeletingPollId(null);
    }
  };

  return {
    deletingPollId,
    handleDeletePoll,
  };
}

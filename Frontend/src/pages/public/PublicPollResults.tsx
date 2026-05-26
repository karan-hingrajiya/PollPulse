import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import { Loader2, XCircle, Lock, AlertTriangle } from "lucide-react";
import { getPublishedResults } from "@/pages/polls/api/poll-management.api";
import type { PublishedPollResults } from "@/pages/dashboard/types";
import PollResultsDisplay from "./components/PollResultsDisplay";
import { PollPulseLogo } from "@/components/layout/Navbar";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/common/error-handler";

type State = "loading" | "ready" | "not_published" | "not_found" | "error";

function CenteredScreen({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 gap-4">
      <div className="flex items-center gap-2 mb-4">
        <PollPulseLogo size={22} />
        <span className="text-sm font-semibold text-white">PollPulse</span>
      </div>
      {icon}
      <h2 className="text-lg font-semibold text-white text-center">{title}</h2>
      <p className="text-sm text-[#71717a] text-center max-w-xs">{desc}</p>
    </div>
  );
}

export default function PublicPollResults() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<State>("loading");
  const [results, setResults] = useState<PublishedPollResults | null>(null);
  const fetched = useRef(false);
  const hasShownNotPublishedToast = useRef(false);

  useEffect(() => {
    if (!token || fetched.current) return;
    fetched.current = true;

    getPublishedResults(token)
      .then((data) => {
        setResults(data);
        setState("ready");
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message.toLowerCase() : "";
        if (msg.includes("not published") || msg.includes("not published yet")) {
          if (!hasShownNotPublishedToast.current) {
            toast.warning("Results are not published yet. Please check again later.");
            hasShownNotPublishedToast.current = true;
          }
          setState("not_published");
        } else if (msg.includes("not found") || msg.includes("invalid")) {
          setState("not_found");
        } else {
          toast.error(getUserFriendlyError(err));
          setState("error");
        }
      });
  }, [token]);

  if (state === "loading") {
    return (
      <CenteredScreen
        icon={<Loader2 size={32} className="text-[#6366f1] animate-spin" />}
        title="Loading results..."
        desc="Fetching the published poll results."
      />
    );
  }

  if (state === "not_published") {
    return (
      <CenteredScreen
        icon={
          <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Lock size={24} className="text-amber-400" />
          </div>
        }
        title="Results not published yet"
        desc="The poll creator hasn't published results yet. Check back later."
      />
    );
  }

  if (state === "not_found" || !results) {
    if (state === "error") {
      return (
        <CenteredScreen
          icon={
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle size={24} className="text-red-400" />
            </div>
          }
          title="Unable to load results"
          desc="Something went wrong while loading poll results. Please try again."
        />
      );
    }

    return (
      <CenteredScreen
        icon={
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
            <XCircle size={24} className="text-red-400" />
          </div>
        }
        title="Results not found"
        desc="This link is invalid or the poll doesn't exist."
      />
    );
  }

  return <PollResultsDisplay results={results} />;
}

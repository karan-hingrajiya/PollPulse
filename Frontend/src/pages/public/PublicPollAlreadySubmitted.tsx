import { useNavigate, useParams } from "react-router";
import { AlertTriangle, BarChart3, ChevronRight, Home } from "lucide-react";
import { PollPulseLogo } from "@/components/layout/Navbar";
import Button from "@/components/pollpulse/Button";

export default function PublicPollAlreadySubmitted() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  return (
    <div className="min-h-screen pollpulse-page flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <PollPulseLogo size={24} />
          <span className="text-sm font-semibold text-[#17231d]">PollPulse</span>
        </div>

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 mb-4">
          <AlertTriangle size={30} className="text-amber-400" />
        </div>
        <h1 className="text-xl font-semibold text-[#17231d] mb-2">
          Response Already Submitted
        </h1>
        <p className="text-sm text-[#43554b] mb-6 leading-relaxed">
          You have already answered this poll from this account or browser. Each
          user can submit only one response.
        </p>

        <div className="grid gap-3">
          <Button
            onClick={() => navigate(token ? `/poll/${token}/results` : "/")}
            className="w-full justify-center gap-2"
          >
            <BarChart3 size={16} />
            View Published Results
            <ChevronRight size={14} />
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="w-full justify-center gap-2"
          >
            <Home size={16} />
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

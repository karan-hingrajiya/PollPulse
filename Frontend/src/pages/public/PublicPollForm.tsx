/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import PollResultsDisplay from "./components/PollResultsDisplay";
import {
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import {
  getPublicPoll,
  submitResponse,
  getPublishedResults,
} from "@/pages/polls/api/poll-management.api";
import type {
  PublicPoll,
  PublishedPollResults,
  PublishedOptionResult,
} from "@/pages/dashboard/types";
import Card from "@/components/pollpulse/Card";
import Button from "@/components/pollpulse/Button";
import { PollPulseLogo } from "@/components/layout/Navbar";
import { getUserFriendlyError } from "@/common/error-handler";
import { apiClient } from "@/common/api-client";

// ─── Fingerprint ─────────────────────────────────────────────────────────────

function getOrCreateFingerprint(pollId: string): string {
  const key = `ppfp_${pollId}`;
  let fp = localStorage.getItem(key);
  if (!fp) {
    let hash = 0;
    const raw = `${navigator.userAgent}_${pollId}_${Date.now()}_${Math.random()}`;
    for (let i = 0; i < raw.length; i++) {
      hash = (Math.imul(31, hash) + raw.charCodeAt(i)) | 0;
    }
    fp = Math.abs(hash).toString(36) + Date.now().toString(36).slice(-4);
    localStorage.setItem(key, fp);
  }
  return fp;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatExpiry(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isExpired(expiresAt: string) {
  return new Date(expiresAt) < new Date();
}

function isDuplicateSubmissionError(message: string) {
  const msg = message.toLowerCase();
  return (
    msg.includes("already been submitted") ||
    msg.includes("already submitted") ||
    msg.includes("already answered") ||
    msg.includes("already responded") ||
    msg.includes("duplicate") ||
    msg.includes("response already")
  );
}

// ─── Status Screens ───────────────────────────────────────────────────────────

function StatusScreen({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-4">{icon}</div>
        <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
        <p className="text-sm text-[#71717a] mb-6">{description}</p>
        {action}
      </div>
    </div>
  );
}


// ─── Main Poll Form ───────────────────────────────────────────────────────────

type PageState =
  | "loading"
  | "form"
  | "submitted"
  | "already_submitted"
  | "expired"
  | "not_found"
  | "published"
  | "auth_required"
  | "error";

export default function PublicPollForm() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [pageState, setPageState] = useState<PageState>("loading");
  const [poll, setPoll] = useState<PublicPoll | null>(null);
  const [results, setResults] = useState<PublishedPollResults | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId → optionId
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const hasFetched = useRef(false);

  const ensureAuthenticatedUser = async () => {
    try {
      await apiClient.get("/api/auth/getme", {
        suppressGlobalErrorHandler: true,
      } as any);
      return true;
    } catch {
      return false;
    }
  };

const redirectToLogin = () => {
    sessionStorage.setItem("login_reason", "auth_required_poll");
    navigate(
      `/login?redirect=/poll/${token}&reason=auth_required_poll`,
      { replace: true },
    );
  };

  useEffect(() => {
    if (!token || hasFetched.current) return;
    hasFetched.current = true;

    const load = async () => {
      try {
        const pollData = await getPublicPoll(token);

        if (pollData.isPublished) {
          // Load and show results
          try {
            const resultsData = await getPublishedResults(token);
            setResults(resultsData);
            setPageState("published");
          } catch {
            setPageState("not_found");
          }
          return;
        }

        if (isExpired(pollData.expiresAt)) {
          setPageState("expired");
          return;
        }

        if (!pollData.isAnonymous) {
          const isAllowed = await ensureAuthenticatedUser();
          if (!isAllowed) {
            redirectToLogin();
            return;
          }
        }

        setPoll(pollData);
        setPageState("form");
      } catch (err) {
        const msg = err instanceof Error ? err.message.toLowerCase() : "";
        if (
          msg.includes("not authenticated") ||
          msg.includes("401") ||
          msg.includes("unauthorized")
        ) {
          redirectToLogin();
          return;
        } else if (
          msg.includes("not found") ||
          msg.includes("invalid") ||
          msg.includes("doesn't exist")
        ) {
          setPageState("not_found");
        } else {
          toast.error(getUserFriendlyError(err));
          setPageState("error");
        }
      }
    };

    load();
  }, [token]);

  // ── Answer selection ────────────────────────────────────────
  const selectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!poll || !token) return;

    // Validate mandatory questions
    const errs: Record<string, string> = {};
    for (const q of poll.questions) {
      if (q.isMandatory && !answers[q._id]) {
        errs[q._id] = "This question is required";
      }
    }
    if (Object.keys(errs).length > 0) {
      setValidationErrors(errs);
      toast.error("Please answer all required questions");
      return;
    }

    setIsSubmitting(true);
    try {
      const fingerprint = getOrCreateFingerprint(poll._id);
      const answersArr = poll.questions.map((q) => ({
        questionId: q._id,
        selectedOptionId: answers[q._id] ?? null,
      }));

      await submitResponse(token, { answers: answersArr, fingerprint });
      setPageState("submitted");
    } catch (err) {
      const rawMsg = err instanceof Error ? err.message : "";
      const msg = rawMsg.toLowerCase();
      if (isDuplicateSubmissionError(msg)) {
        toast.warning("You already submitted this poll. Redirecting...");
        setPageState("already_submitted");
        navigate(`/poll/${token}/already-submitted`, { replace: true });
      } else if (
        msg.includes("not authenticated") ||
        msg.includes("401") ||
        msg.includes("unauthorized")
      ) {
        redirectToLogin();
      } else if (msg.includes("expired")) {
        setPageState("expired");
      } else {
        toast.error(getUserFriendlyError(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Answered count ──────────────────────────────────────────
  const answeredCount = poll
    ? poll.questions.filter((q) => answers[q._id]).length
    : 0;
  const totalRequired = poll
    ? poll.questions.filter((q) => q.isMandatory).length
    : 0;
  const requiredAnswered = poll
    ? poll.questions.filter((q) => q.isMandatory && answers[q._id]).length
    : 0;

  // ── Render states ───────────────────────────────────────────

  if (pageState === "loading") {
    return (
      <StatusScreen
        icon={
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1a1a1a]">
            <Loader2 size={28} className="text-[#6366f1] animate-spin" />
          </div>
        }
        title="Loading poll..."
        description="Please wait while we fetch the poll details."
      />
    );
  }

  if (pageState === "expired") {
    return (
      <StatusScreen
        icon={
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10">
            <Clock size={28} className="text-amber-400" />
          </div>
        }
        title="Poll has expired"
        description="This poll is no longer accepting responses. The expiry time has passed."
      />
    );
  }

  if (pageState === "not_found") {
    return (
      <StatusScreen
        icon={
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10">
            <XCircle size={28} className="text-red-400" />
          </div>
        }
        title="Poll not found"
        description="This poll link is invalid or doesn't exist. Double-check the URL and try again."
      />
    );
  }

  if (pageState === "auth_required") {
    return (
      <StatusScreen
        icon={
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#6366f1]/10">
            <ShieldCheck size={28} className="text-[#818cf8]" />
          </div>
        }
        title="Login required"
        description="This poll requires you to be logged in to respond."
        action={
          <Button
            onClick={() => navigate(`/login?redirect=/poll/${token}`)}
            className="gap-2"
          >
            Sign in to respond
            <ChevronRight size={14} />
          </Button>
        }
      />
    );
  }

  if (pageState === "published" && results) {
    return <PollResultsDisplay results={results} />;
  }

  if (pageState === "submitted") {
    return (
      <StatusScreen
        icon={
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 animate-[scaleIn_0.4s_ease-out]">
            <CheckCircle2 size={32} className="text-emerald-400" />
          </div>
        }
        title="Response submitted!"
        description="Thank you for participating. Your response has been recorded successfully."
      />
    );
  }

  if (pageState === "already_submitted") {
    return null;
  }

  if (pageState === "error") {
    return (
      <StatusScreen
        icon={
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10">
            <AlertTriangle size={28} className="text-red-400" />
          </div>
        }
        title="Unable to load poll"
        description="Something went wrong while loading this poll. Please refresh and try again."
        action={
          <Button onClick={() => window.location.reload()} className="gap-2">
            Try again
            <ChevronRight size={14} />
          </Button>
        }
      />
    );
  }

  // ── Main form ───────────────────────────────────────────────
  if (!poll) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4">
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(99,102,241,0.06), transparent)",
        }}
      />

      <div className="relative max-w-xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <PollPulseLogo size={24} />
          <span className="text-sm font-semibold text-white">PollPulse</span>
        </div>

        {/* Poll header */}
        <div className="mb-6">
          {poll.isAnonymous ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-full text-xs text-[#818cf8] font-medium mb-3">
              <ShieldCheck size={11} />
              Anonymous poll
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full text-xs text-sky-400 font-medium mb-3">
              <ShieldCheck size={11} />
              Authenticated responses only
            </div>
          )}

          <h1 className="text-2xl font-bold text-white">{poll.title}</h1>
          {poll.description && (
            <p className="text-sm text-[#71717a] mt-2 leading-relaxed">
              {poll.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-3 text-xs text-[#52525b]">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              Closes {formatExpiry(poll.expiresAt)}
            </span>
            {totalRequired > 0 && (
              <span>
                {totalRequired} required question
                {totalRequired !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        {poll.questions.length > 0 && (
          <div className="mb-5">
            <div className="flex justify-between text-xs text-[#52525b] mb-1.5">
              <span>
                {answeredCount} of {poll.questions.length} answered
              </span>
              {totalRequired > 0 && (
                <span
                  className={
                    requiredAnswered === totalRequired ? "text-emerald-400" : ""
                  }
                >
                  {requiredAnswered}/{totalRequired} required
                </span>
              )}
            </div>
            <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#6366f1] rounded-full transition-all duration-500"
                style={{
                  width: `${(answeredCount / poll.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-4">
          {poll.questions.map((q, qi) => (
            <Card key={q._id} className="p-5">
              {/* Question text */}
              <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-xs font-semibold text-[#a1a1aa]">
                  {qi + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white leading-snug">
                    {q.text}
                    {q.isMandatory && (
                      <span className="text-red-400 ml-1">*</span>
                    )}
                  </p>
                  {answers[q._id] && (
                    <p className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1">
                      <CheckCircle2 size={10} />
                      Answered
                    </p>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2 ml-9">
                {q.options.map((opt) => {
                  const isSelected = answers[q._id] === opt._id;
                  return (
                    <button
                      key={opt._id}
                      type="button"
                      onClick={() => selectOption(q._id, opt._id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left text-sm transition-all duration-150 ${
                        isSelected
                          ? "bg-[#6366f1]/10 border-[#6366f1]/50 text-white"
                          : "bg-[#111] border-[#2a2a2a] text-[#a1a1aa] hover:border-[#3a3a3a] hover:text-white"
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "border-[#6366f1] bg-[#6366f1]"
                            : "border-[#3a3a3a]"
                        }`}
                      >
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <span className="leading-snug">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Validation error */}
              {validationErrors[q._id] && (
                <p className="flex items-center gap-1 text-xs text-red-400 mt-2 ml-9">
                  <AlertTriangle size={11} />
                  {validationErrors[q._id]}
                </p>
              )}
            </Card>
          ))}
        </div>

        {/* Submit */}
        <div className="mt-6 pb-8">
          {totalRequired > 0 && requiredAnswered < totalRequired && (
            <p className="text-xs text-[#52525b] text-center mb-3">
              Answer {totalRequired - requiredAnswered} more required question
              {totalRequired - requiredAnswered !== 1 ? "s" : ""} to submit
            </p>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full justify-center gap-2 h-12 text-base"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Send size={16} />
                Submit Response
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useParams, useNavigate } from "react-router";
import { usePollAnalytics } from "./hooks/usePollAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Share2,
  Globe,
  Copy,
  CheckCircle2,
  TrendingUp,
  Users,
  BarChart3,
  Clock,
  ShieldCheck,
  Target,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Card from "@/components/pollpulse/Card";
import Badge from "@/components/pollpulse/Badge";
import Button from "@/components/pollpulse/Button";
import Navbar from "@/components/layout/Navbar";
import { toast } from "sonner";
import { useState } from "react";
import type { OptionAnalytics } from "@/pages/dashboard/types";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isExpired(expiresAt?: string) {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  sub,
  accent = "indigo",
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
  accent?: "indigo" | "emerald" | "amber" | "sky" | "rose" | "violet";
}) {
  const accents = {
    indigo: "bg-[#6366f1]/10 border-[#6366f1]/20 text-[#818cf8]",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    sky: "bg-sky-500/10 border-sky-500/20 text-sky-400",
    rose: "bg-rose-500/10 border-rose-500/20 text-rose-400",
    violet: "bg-violet-500/10 border-violet-500/20 text-violet-400",
  };
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-[#71717a] font-medium truncate">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-[#52525b] mt-0.5">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg border shrink-0 ${accents[accent]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ─── Option Bar ──────────────────────────────────────────────────────────────

function OptionBar({
  option,
  rank,
}: {
  option: OptionAnalytics;
  rank: number;
}) {
  const barColors = [
    "bg-[#6366f1]",
    "bg-sky-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-violet-500",
  ];
  const color = barColors[rank % barColors.length];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#e4e4e7] font-medium truncate pr-4 max-w-[70%]">
          {option.optionText}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[#a1a1aa]">{option.count} votes</span>
          <span className="text-white font-semibold w-12 text-right">
            {option.percentage.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="h-2.5 bg-[#2a2a2a] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${option.percentage}%` }}
        />
      </div>
    </div>
  );
}

// ─── Trend Chart (SVG) ───────────────────────────────────────────────────────

function TrendChart({
  points,
  bucket,
}: {
  points: { bucket: string; count: number }[];
  bucket: string;
}) {
  if (!points || points.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-[#52525b] text-sm">
        No data in this range
      </div>
    );
  }

  const width = 600;
  const height = 160;
  const padding = { top: 16, right: 16, bottom: 32, left: 36 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxCount = Math.max(...points.map((p) => p.count), 1);
  const minCount = 0;

  const xScale = (i: number) =>
    padding.left + (i / Math.max(points.length - 1, 1)) * chartW;
  const yScale = (v: number) =>
    padding.top + chartH - ((v - minCount) / (maxCount - minCount)) * chartH;

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(p.count)}`)
    .join(" ");

  const areaD =
    pathD +
    ` L ${xScale(points.length - 1)} ${padding.top + chartH} L ${xScale(0)} ${padding.top + chartH} Z`;

  // Y axis labels
  const yTicks = [0, Math.round(maxCount / 2), maxCount];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ minWidth: "280px" }}
      >
        {/* Grid lines */}
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={padding.left}
              y1={yScale(tick)}
              x2={width - padding.right}
              y2={yScale(tick)}
              stroke="#2a2a2a"
              strokeWidth={1}
            />
            <text
              x={padding.left - 6}
              y={yScale(tick) + 4}
              textAnchor="end"
              fill="#52525b"
              fontSize={10}
            >
              {tick}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaD} fill="url(#areaGrad)" opacity={0.3} />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#6366f1"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={xScale(i)}
            cy={yScale(p.count)}
            r={3}
            fill="#6366f1"
            stroke="#0f0f0f"
            strokeWidth={1.5}
          />
        ))}

        {/* X axis labels — show every Nth label based on count */}
        {points.map((p, i) => {
          const step = Math.ceil(points.length / 6);
          if (i % step !== 0 && i !== points.length - 1) return null;
          const label =
            bucket === "hour"
              ? p.bucket.split(" ")[1]
              : p.bucket.replace(/^\d{4}-/, "");
          return (
            <text
              key={i}
              x={xScale(i)}
              y={height - 6}
              textAnchor="middle"
              fill="#52525b"
              fontSize={9}
            >
              {label}
            </text>
          );
        })}

        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function PollAnalyticsPage() {
  const { pollId } = useParams<{ pollId: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const {
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
    refetch,
    handlePublish,
    handleGetShareToken,
    changeTrendRange,
  } = usePollAnalytics(pollId!);

  const shareUrl = shareToken
    ? `${window.location.origin}/poll/${shareToken}`
    : null;

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f]">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <Skeleton className="h-8 w-64 bg-[#1a1a1a]" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-24 bg-[#1a1a1a] rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 bg-[#1a1a1a] rounded-xl" />
        </main>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="min-h-screen bg-[#0f0f0f]">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Card className="p-8 text-center border-red-500/20 bg-red-500/5">
            <p className="text-red-300 mb-4">
              {error || "Failed to load analytics"}
            </p>
            <Button variant="outline" onClick={refetch}>
              <RefreshCw size={14} className="mr-2" /> Retry
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  const expired = overview.isPublished || isExpired(overview.expiresAt);

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Header ── */}
        <div className="mb-10">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-[#71717a] hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={15} />
            Back to Dashboard
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {overview.isPublished ? (
                  <Badge variant="green">
                    <Globe size={11} /> Published
                  </Badge>
                ) : (
                  <Badge variant="gray">Draft</Badge>
                )}
                {overview.isAnonymous ? (
                  <Badge variant="purple">Anonymous</Badge>
                ) : (
                  <Badge variant="blue">Authenticated</Badge>
                )}
                {expired ? (
                  <Badge variant="red">Expired</Badge>
                ) : (
                  <Badge variant="indigo">Active</Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight break-words">
                {overview.title}
              </h1>
              <p className="text-sm text-[#71717a] mt-3">
                Created {formatDate(overview.createdAt)} · Expires{" "}
                {formatDate(overview.expiresAt)}
              </p>
            </div>
          </div>
          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 min-w-[120px] justify-center"
              onClick={handleGetShareToken}
              disabled={shareLoading}
            >
              {shareLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Share2 size={14} />
              )}
              Share Link
            </Button>

            {!overview.isPublished && (
              <Button
                size="sm"
                className="gap-1.5 min-w-[140px] justify-center"
                onClick={handlePublish}
                disabled={isPublishing}
              >
                {isPublishing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Globe size={14} />
                )}
                Publish Results
              </Button>
            )}
          </div>
        </div>

        {/* Share URL strip (only while not published) */}
        {shareUrl && !overview.isPublished && (
          <div className="mb-8 space-y-3">
            {/* Share link */}
            <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3">
              <Globe size={14} className="text-[#6366f1] shrink-0" />
              <span className="text-xs text-[#a1a1aa] truncate flex-1">
                {shareUrl}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-[#6366f1] hover:text-white transition-colors shrink-0 ml-2"
              >
                {copied ? (
                  <CheckCircle2 size={13} className="text-emerald-400" />
                ) : (
                  <Copy size={13} />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

          </div>
        )}

        {/* Results link row (published state only) */}
        {overview.isPublished && shareToken && (
          <div className="mb-8">
            <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3">
              <Eye size={14} className="text-emerald-400 shrink-0" />
              <span className="text-xs text-[#a1a1aa] flex-1">
                Public results page is live
              </span>
              <a
                href={`/poll/${shareToken}/results`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors shrink-0 ml-2"
              >
                View <ArrowRight size={11} />
              </a>
            </div>
          </div>
        )}

        {/* ── Tabs ── */}
        <Tabs defaultValue="overview">
          <TabsList className="bg-[#1a1a1a] border border-[#2a2a2a] mb-8">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-[#6366f1] data-[state=active]:text-white text-[#a1a1aa]"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="questions"
              className="data-[state=active]:bg-[#6366f1] data-[state=active]:text-white text-[#a1a1aa]"
            >
              Questions ({overview.totalQuestions})
            </TabsTrigger>
            <TabsTrigger
              value="trend"
              className="data-[state=active]:bg-[#6366f1] data-[state=active]:text-white text-[#a1a1aa]"
            >
              Trend
            </TabsTrigger>
          </TabsList>

          {/* ─── Overview Tab ─── */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Total Responses"
                value={overview.totalResponses}
                icon={<Users size={16} />}
                accent="indigo"
              />
              <StatCard
                label="Responses Today"
                value={overview.responsesToday}
                icon={<Clock size={16} />}
                accent="sky"
              />
              <StatCard
                label="Completion Rate"
                value={`${overview.averageCompletionRatePercent}%`}
                icon={<BarChart3 size={16} />}
                accent="emerald"
                sub="of all questions answered"
              />
              <StatCard
                label="Total Questions"
                value={overview.totalQuestions}
                icon={<Target size={16} />}
                accent="violet"
              />
              <StatCard
                label="Authenticated"
                value={overview.authenticatedResponses}
                icon={<ShieldCheck size={16} />}
                accent="sky"
                sub="logged-in respondents"
              />
              <StatCard
                label="Anonymous"
                value={overview.anonymousResponses}
                icon={<Users size={16} />}
                accent="amber"
                sub="guest respondents"
              />
              <StatCard
                label="Mandatory Questions"
                value={overview.totalMandatoryQuestions}
                icon={<Target size={16} />}
                accent="rose"
              />
              <StatCard
                label="Fully Completed"
                value={`${overview.mandatoryFullCompletionRatePercent}%`}
                icon={<CheckCircle2 size={16} />}
                accent="emerald"
                sub="answered all mandatory"
              />
            </div>

            {/* Completion breakdown */}
            {overview.totalMandatoryQuestions > 0 && (
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-white mb-4">
                  Mandatory Question Completion
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-[#a1a1aa] mb-1.5">
                      <span>Average mandatory completion</span>
                      <span className="text-white font-medium">
                        {overview.averageMandatoryCompletionRatePercent}%
                      </span>
                    </div>
                    <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#6366f1] rounded-full transition-all duration-700"
                        style={{
                          width: `${overview.averageMandatoryCompletionRatePercent}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-[#a1a1aa] mb-1.5">
                      <span>
                        Fully completed all mandatory (
                        {overview.fullyCompletedMandatoryCount} respondents)
                      </span>
                      <span className="text-white font-medium">
                        {overview.mandatoryFullCompletionRatePercent}%
                      </span>
                    </div>
                    <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                        style={{
                          width: `${overview.mandatoryFullCompletionRatePercent}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* ─── Questions Tab ─── */}
          <TabsContent value="questions" className="space-y-5">
            {!questions || questions.questions.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-[#71717a]">No responses yet</p>
              </Card>
            ) : (
              questions.questions.map((q, idx) => (
                <Card key={q.questionId} className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center text-xs font-semibold text-[#818cf8]">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white leading-snug">
                          {q.text}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[#71717a]">
                          <span>{q.totalAnswers} answered</span>
                          <span>{q.skippedCount} skipped</span>
                        </div>
                      </div>
                    </div>
                    {q.isMandatory && (
                      <Badge variant="rose" className="shrink-0 text-xs">
                        Required
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3">
                    {q.options
                      .slice()
                      .sort((a, b) => b.count - a.count)
                      .map((opt, optIdx) => (
                        <OptionBar
                          key={opt.optionId}
                          option={opt}
                          rank={optIdx}
                        />
                      ))}
                  </div>

                  {q.totalAnswers === 0 && (
                    <p className="text-xs text-[#52525b] mt-3 text-center">
                      No answers for this question yet
                    </p>
                  )}
                </Card>
              ))
            )}
          </TabsContent>

          {/* ─── Trend Tab ─── */}
          <TabsContent value="trend">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <TrendingUp size={15} className="text-[#6366f1]" />
                    Participation Over Time
                  </h3>
                  <p className="text-xs text-[#71717a] mt-0.5">
                    Response submissions per {trend?.bucket ?? "day"}
                  </p>
                </div>

                {/* Range selector */}
                <div className="flex items-center gap-1 bg-[#111] border border-[#2a2a2a] rounded-lg p-1">
                  {(["24h", "7d", "30d"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => changeTrendRange(r)}
                      disabled={trendLoading}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                        trendRange === r
                          ? "bg-[#6366f1] text-white"
                          : "text-[#71717a] hover:text-white"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {trendLoading ? (
                <div className="h-40 flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-[#6366f1]" />
                </div>
              ) : (
                <TrendChart
                  points={trend?.points ?? []}
                  bucket={trend?.bucket ?? "day"}
                />
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}


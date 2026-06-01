import Navbar from "../../components/layout/Navbar";
import Card from "../../components/pollpulse/Card";
import Badge from "../../components/pollpulse/Badge";
import Button from "../../components/pollpulse/Button";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { AnalyticsOverview, DashboardPoll, DashboardUser } from "./types";
import {
  BinIcon,
  OrbitClockIcon,
  PeoplePulseIcon,
  RadarEyeIcon,
  RocketIcon,
  ScrollIcon,
  ShieldCheckIcon,
  SparkPlusIcon,
  StackBarsIcon,
  WarningHexIcon,
} from "./components/DashboardIcons";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, PieChart, Pie, Cell } from "recharts";

interface DashboardViewProps {
  user: DashboardUser | null;
  polls: DashboardPoll[];
  overview: AnalyticsOverview | null;
  isLoading: boolean;
  error: string | null;
  deletingPollId?: string | null;
  onRetry: () => void;
  onCreatePoll?: () => void;
  onDeletePoll?: (pollId: string) => Promise<void>;
  onPollClick?: (pollId: string) => void;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isExpired(expiresAt?: string): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

function StatCard({
  label,
  value,
  icon,
  accentClass,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accentClass: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[#43554b] text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-[#17231d] mt-1.5">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg border ${accentClass}`}>{icon}</div>
      </div>
    </Card>
  );
}

function PollCard({
  poll,
  onDelete,
  isDeleting,
  onPollClick,
}: {
  poll: DashboardPoll;
  onDelete?: (pollId: string) => void;
  isDeleting?: boolean;
  onPollClick?: (pollId: string) => void;
}) {
  const expired = poll.isPublished || isExpired(poll.expiresAt);

  return (
    <Card>
      <div className="p-5">
        <h3 className="text-[#17231d] font-semibold text-base leading-snug line-clamp-1">
          {poll.title}
        </h3>

        {poll.description && (
          <p className="text-[#43554b] text-sm mt-2 line-clamp-2 leading-relaxed">
            {poll.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          {poll.isPublished ? (
            <Badge variant="green">
              <RadarEyeIcon width={14} height={14} />
              Published
            </Badge>
          ) : (
            <Badge variant="gray">
              <ScrollIcon width={14} height={14} />
              Draft
            </Badge>
          )}

          {poll.isAnonymous ? (
            <Badge variant="purple">
              <ShieldCheckIcon width={14} height={14} />
              Anonymous
            </Badge>
          ) : (
            <Badge variant="blue">
              <ShieldCheckIcon width={14} height={14} />
              Authenticated
            </Badge>
          )}

          {expired ? (
            <Badge variant="red">
              <WarningHexIcon width={14} height={14} />
              Expired
            </Badge>
          ) : (
            <Badge variant="indigo">
              <OrbitClockIcon width={14} height={14} />
              Active
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 text-xs text-[#43554b]">
          <div className="flex items-center gap-1.5">
            <PeoplePulseIcon width={15} height={15} />
            <span className="font-medium text-[#17231d]">
              {poll.totalResponses ?? 0}
            </span>
            responses
          </div>
          <span>{formatDate(poll.createdAt)}</span>
        </div>
      </div>

      <div className="px-5 py-3 border-t border-[#d7e1da] flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => onPollClick?.(poll._id)}
        >
          <StackBarsIcon width={14} height={14} />
          View Analytics
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="p-2 rounded-lg text-[#66786f] border border-transparent hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
              title="Delete Poll"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin text-red-400" />
              ) : (
                <BinIcon width={16} height={16} />
              )}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[#ffffff] border-[#d7e1da] text-[#17231d]">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-[#43554b]">
                This action cannot be undone. This will permanently delete your
                poll
                <span className="font-semibold text-[#17231d]">
                  {" "}
                  "{poll.title}"{" "}
                </span>
                and all associated responses.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-[#d7e1da] text-[#17231d] hover:bg-[#d7e1da] hover:text-[#0f6f61]">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                onClick={() => onDelete?.(poll._id)}
              >
                Yes, delete poll
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-[#ffffff] border border-[#d7e1da] rounded-xl p-5 animate-pulse">
      <div className="h-4 bg-[#d7e1da] rounded w-3/4 mb-3" />
      <div className="h-3 bg-[#d7e1da] rounded w-full mb-2" />
      <div className="h-3 bg-[#d7e1da] rounded w-2/3 mb-4" />
      <div className="h-5 bg-[#d7e1da] rounded-full w-24 mb-4" />
      <div className="flex justify-between">
        <div className="h-3 bg-[#d7e1da] rounded w-24" />
        <div className="h-3 bg-[#d7e1da] rounded w-20" />
      </div>
      <div className="mt-4 pt-3 border-t border-[#d7e1da] flex justify-between">
        <div className="h-8 bg-[#d7e1da] rounded w-28" />
        <div className="h-8 bg-[#d7e1da] rounded w-8" />
      </div>
    </div>
  );
}

export default function DashboardView({
  user,
  polls,
  overview,
  isLoading,
  error,
  deletingPollId,
  onRetry,
  onCreatePoll,
  onDeletePoll,
  onPollClick
}: DashboardViewProps) {
  const pollStatusData = overview
    ? [
        { label: "Live", value: overview.livePolls, fill: "#10b981" },
        { label: "Published", value: overview.publishedPolls, fill: "#38bdf8" },
        { label: "Draft", value: overview.draftPolls, fill: "#a78bfa" },
        { label: "Expired", value: overview.expiredPolls, fill: "#fb7185" },
      ]
    : [];

  const responsePulseData = overview
    ? [
        { label: "Today", value: overview.totalResponsesToday, fill: "#14b8a6" },
        {
          label: "Older",
          value: Math.max(overview.totalResponses - overview.totalResponsesToday, 0),
          fill: "#0f9f8a",
        },
      ]
    : [];

  return (
    <div className="min-h-screen pollpulse-page">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "url(/pattern-dots.png)",
          backgroundSize: "600px 600px",
          backgroundRepeat: "repeat",
        }}
      />

      <Navbar user={user || undefined} />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#17231d] tracking-tight">
              Your Polls
            </h1>
            <p className="text-[#43554b] text-sm mt-1">
              Live dashboard connected to your analytics and poll data
            </p>
          </div>
          <Button className="gap-2 self-start" onClick={onCreatePoll}>
            <SparkPlusIcon width={15} height={15} />
            Create Poll
          </Button>
        </div>

        {error && (
          <Card className="p-4 mb-6 border-red-500/20 bg-red-500/5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-red-300">{error}</p>
              <Button variant="outline" size="sm" onClick={onRetry}>
                Retry
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Polls"
            value={isLoading ? "-" : (overview?.totalPolls ?? 0)}
            icon={<ScrollIcon />}
            accentClass="text-[#0f766e] bg-[#0f9f8a]/10 border-[#0f9f8a]/20"
          />
          <StatCard
            label="Live Polls"
            value={isLoading ? "-" : (overview?.livePolls ?? 0)}
            icon={<OrbitClockIcon />}
            accentClass="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
          />
          <StatCard
            label="Published"
            value={isLoading ? "-" : (overview?.publishedPolls ?? 0)}
            icon={<RocketIcon />}
            accentClass="text-sky-400 bg-sky-500/10 border-sky-500/20"
          />
          <StatCard
            label="Total Responses"
            value={
              isLoading ? "-" : (overview?.totalResponses ?? 0).toLocaleString()
            }
            icon={<PeoplePulseIcon />}
            accentClass="text-amber-400 bg-amber-500/10 border-amber-500/20"
          />
          <StatCard
            label="Draft Polls"
            value={isLoading ? "-" : (overview?.draftPolls ?? 0)}
            icon={<ScrollIcon />}
            accentClass="text-cyan-600 bg-cyan-50 border-cyan-200"
          />
          <StatCard
            label="Expired Polls"
            value={isLoading ? "-" : (overview?.expiredPolls ?? 0)}
            icon={<WarningHexIcon />}
            accentClass="text-rose-400 bg-rose-500/10 border-rose-500/20"
          />
          <StatCard
            label="Responses Today"
            value={
              isLoading
                ? "-"
                : (overview?.totalResponsesToday ?? 0).toLocaleString()
            }
            icon={<PeoplePulseIcon />}
            accentClass="text-teal-400 bg-teal-500/10 border-teal-500/20"
          />
          <StatCard
            label="Completion Rate"
            value={
              isLoading
                ? "-"
                : `${overview?.overallCompletionRatePercent ?? 0}%`
            }
            icon={<StackBarsIcon />}
            accentClass="text-orange-400 bg-orange-500/10 border-orange-500/20"
          />
        </div>

        {!isLoading && overview && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-8">
            <Card className="p-5 xl:col-span-2">
              <p className="text-sm font-semibold text-[#17231d] mb-4">
                Poll Status Snapshot
              </p>
              <ChartContainer
                config={{
                  value: { label: "Polls", color: "#0f9f8a" },
                }}
                className="h-[230px] w-full"
              >
                <BarChart data={pollStatusData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={10} />
                </BarChart>
              </ChartContainer>
            </Card>

            <Card className="p-5">
              <p className="text-sm font-semibold text-[#17231d] mb-4">
                Response Pulse
              </p>
              <ChartContainer
                config={{
                  today: { label: "Today", color: "#14b8a6" },
                  older: { label: "Older", color: "#0f9f8a" },
                }}
                className="h-[230px] w-full"
              >
                <PieChart>
                  <Pie
                    data={responsePulseData}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={55}
                    outerRadius={88}
                    paddingAngle={3}
                  >
                    {responsePulseData.map((entry) => (
                      <Cell key={entry.label} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </Card>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : polls.length === 0 ? (
          <Card className="border-dashed border-[#d7e1da]">
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-[#0f9f8a]/20 blur-3xl rounded-full scale-75" />
                <img
                  src="/empty-state.png"
                  alt="No polls yet"
                  className="relative w-64 h-64 object-contain drop-shadow-[0_18px_26px_rgba(15,159,138,0.16)]"
                />
              </div>
              <h3 className="text-xl font-semibold text-[#17231d] mb-2">
                No polls yet
              </h3>
              <p className="text-[#43554b] text-sm max-w-sm mb-8 leading-relaxed">
                Create your first poll to start collecting responses. It&apos;s
                quick, easy, and your respondents will love the clean
                experience.
              </p>
              <Button onClick={onCreatePoll} className="gap-2">
                <SparkPlusIcon width={15} height={15} />
                Create your first poll
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {polls.map((poll) => (
              <PollCard
                key={poll._id}
                poll={poll}
                onDelete={onDeletePoll}
                onPollClick={onPollClick}
                isDeleting={deletingPollId === poll._id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

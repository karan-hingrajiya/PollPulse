import type { PublishedPollResults, PublishedOptionResult } from "@/pages/dashboard/types";
import { CheckCircle2, Users, Globe, Calendar } from "lucide-react";
import Card from "@/components/pollpulse/Card";
import { PollPulseLogo } from "@/components/layout/Navbar";
import { motion } from "framer-motion";

const BAR_COLORS = [
  "bg-[#0f9f8a]",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];

function formatDate(d?: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface PollResultsDisplayProps {
  results: PublishedPollResults;
}

export default function PollResultsDisplay({ results }: PollResultsDisplayProps) {
  return (
    <div className="min-h-screen pollpulse-page py-8 px-4">
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(15,159,138,0.06), transparent)",
        }}
      />

      <div className="relative max-w-xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <PollPulseLogo size={22} />
          <span className="text-sm font-semibold text-[#17231d]">PollPulse</span>
        </div>

        {/* Header card */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400 font-medium">
              <Globe size={11} />
              Results Published
            </div>
          </div>

          <h1 className="text-xl font-bold text-[#17231d] mb-1">{results.title}</h1>

          {results.description && (
            <p className="text-sm text-[#566a60] leading-relaxed mb-3">
              {results.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-[#66786f]">
            <span className="flex items-center gap-1.5">
              <Users size={11} />
              <span className="text-[#43554b] font-medium">
                {results.totalResponses.toLocaleString()}
              </span>{" "}
              total responses
            </span>
            {results.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar size={11} />
                Published {formatDate(results.publishedAt)}
              </span>
            )}
          </div>
        </Card>

        {/* Questions */}
        <div className="space-y-5">
          {results.questions.map((q, qi) => {
            const sorted = [...q.options].sort(
              (a: PublishedOptionResult, b: PublishedOptionResult) =>
                b.count - a.count
            );
            const topOption = sorted[0];

            return (
              <motion.div
                key={q.questionId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: qi * 0.08 }}
              >
                <Card className="p-5">
                  {/* Question header */}
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0f9f8a]/10 border border-[#0f9f8a]/20 flex items-center justify-center text-xs font-bold text-[#0f766e]">
                      {qi + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#17231d] leading-snug">
                        {q.text}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#66786f]">
                        <span>{q.totalAnswered} answered</span>
                        {q.skippedCount > 0 && (
                          <span>{q.skippedCount} skipped</span>
                        )}
                        {topOption && topOption.count > 0 && (
                          <span className="text-[#0f9f8a]">
                            "{topOption.text}" leads
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    {sorted.map((opt: PublishedOptionResult, oi) => {
                      const isTop = oi === 0 && opt.count > 0;
                      return (
                        <div key={opt.optionId} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 min-w-0 pr-2">
                              {isTop && (
                                <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                              )}
                              <span
                                className={`font-medium truncate ${
                                  isTop ? "text-[#17231d]" : "text-[#43554b]"
                                }`}
                              >
                                {opt.text}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[#66786f]">
                                {opt.count.toLocaleString()}
                              </span>
                              <span
                                className={`font-semibold w-10 text-right ${
                                  isTop ? "text-[#17231d]" : "text-[#566a60]"
                                }`}
                              >
                                {opt.percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <div className="h-2.5 bg-[#d7e1da] rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${BAR_COLORS[oi % BAR_COLORS.length]}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${opt.percentage}%` }}
                              transition={{
                                duration: 0.9,
                                delay: 0.1 + qi * 0.06 + oi * 0.05,
                                ease: "easeOut",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {q.totalAnswered === 0 && (
                    <p className="text-xs text-[#b6c5bb] text-center mt-3">
                      No responses for this question
                    </p>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-xs text-[#b6c5bb] text-center mt-8">
          Results powered by{" "}
          <span className="text-[#0f9f8a]">PollPulse</span>
        </p>
      </div>
    </div>
  );
}
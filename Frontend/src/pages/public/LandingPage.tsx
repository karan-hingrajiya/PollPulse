import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useLiveStats } from "@/hooks/useLiveStats";
import {
  BarChart3,
  Share2,
  Shield,
  CheckCircle2,
  ArrowRight,
  Globe,
  ChevronRight,
  Zap,
  Eye,
  Activity,
  Timer,
} from "lucide-react";
import Navbar, { PollPulseLogo } from "@/components/layout/Navbar";
import Button from "@/components/pollpulse/Button";

// ─── Demo Poll Data ──────────────────────────────────────────────────────────

const DEMO_QUESTION = "What's your preferred way to collect team feedback?";
const DEMO_OPTIONS = [
  { id: "a", label: "Quick online polls", votes: 1203, color: "bg-[#0f9f8a]" },
  { id: "b", label: "Long email surveys", votes: 421, color: "bg-sky-500" },
  { id: "c", label: "In-person meetings", votes: 234, color: "bg-emerald-500" },
  { id: "d", label: "Anonymous forms", votes: 847, color: "bg-amber-500" },
];

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedCounter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const prevToRef = useRef(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 400; //jaldi se count number increment and decrement animation k liye h ye.
    const from = prevToRef.current;
    const diff = to - from;
    if (diff === 0) {
      return;
    }
    const step = diff / (duration / 16);
    let current = from;
    const timer = setInterval(() => {
      current += step;
      if ((step > 0 && current >= to) || (step < 0 && current <= to)) {
        setCount(to);
        clearInterval(timer);
      } else setCount(Math.floor(current));
    }, 16);
    prevToRef.current = to;
    return () => clearInterval(timer);
  }, [inView, to]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Interactive Demo Poll ────────────────────────────────────────────────────

function DemoPoll() {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [votes, setVotes] = useState<Record<string, number>>(
    DEMO_OPTIONS.reduce((acc, o) => ({ ...acc, [o.id]: o.votes }), {}),
  );
  const [total, setTotal] = useState(
    DEMO_OPTIONS.reduce((s, o) => s + o.votes, 0),
  );

  const getPercent = (id: string) =>
    total === 0 ? 0 : Math.round((votes[id] / total) * 100);

  const handleSubmit = () => {
    if (!selected || submitted) return;
    setVotes((p) => ({ ...p, [selected]: p[selected] + 1 }));
    setTotal((t) => t + 1);
    setSubmitted(true);
  };

  const maxPct = Math.max(...DEMO_OPTIONS.map((o) => getPercent(o.id)));

  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="bg-[#ffffff] border border-[#d7e1da] rounded-2xl p-6 shadow-[0_22px_55px_rgba(24,43,35,0.10)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0f9f8a]/10 border border-[#0f9f8a]/20 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0f9f8a] animate-pulse" />
          <span className="text-xs text-[#0f766e] font-medium">
            Try it live
          </span>
        </div>
        <span className="text-xs text-[#66786f]">
          {total.toLocaleString()} responses
        </span>
      </div>

      <p className="text-sm font-semibold text-[#17231d] mb-4 leading-snug">
        {DEMO_QUESTION}
      </p>

      <div className="space-y-2.5">
        {DEMO_OPTIONS.map((opt) => {
          const pct = getPercent(opt.id);
          const isSelected = selected === opt.id;
          const isLeading = submitted && pct === maxPct;

          return (
            <button
              key={opt.id}
              onClick={() => !submitted && setSelected(opt.id)}
              disabled={submitted}
              className={`w-full text-left rounded-xl border transition-all duration-200 overflow-hidden
                ${isSelected ? "border-[#0f9f8a]/50" : "border-[#d7e1da] hover:border-[#b6c5bb]"}`}
            >
              <div className="relative px-3 py-2.5">
                {submitted && (
                  <motion.div
                    className={`absolute inset-y-0 left-0 ${opt.color} opacity-[0.08] rounded-xl`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
                  />
                )}
                <div className="relative flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all
                        ${isSelected ? "border-[#0f9f8a] bg-[#0f9f8a]" : "border-[#b6c5bb]"}`}
                    >
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    <span
                      className={`text-sm truncate transition-colors ${
                        isSelected || submitted
                          ? "text-[#17231d]"
                          : "text-[#43554b]"
                      }`}
                    >
                      {opt.label}
                    </span>
                    {isLeading && (
                      <span className="text-xs text-emerald-400 font-medium shrink-0">
                        ↑ Leading
                      </span>
                    )}
                  </div>
                  {submitted && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="text-xs font-semibold text-[#17231d] shrink-0"
                    >
                      {pct}%
                    </motion.span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.button
              key="submit"
              onClick={handleSubmit}
              disabled={!selected}
              className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all
                ${
                  selected
                    ? "bg-[#0f9f8a] text-white hover:bg-[#0b8574] shadow-[0_12px_30px_rgba(15,159,138,0.22)]"
                    : "bg-[#ffffff] text-[#66786f] cursor-not-allowed border border-[#d7e1da]"
                }`}
            >
              {selected ? "Submit Response" : "Select an option"}
            </motion.button>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 py-2.5 text-emerald-400 text-sm font-medium"
            >
              <CheckCircle2 size={15} />
              Response recorded — see results above!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────

function FeatureCard({
  icon,
  title,
  desc,
  iconBg,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  iconBg: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="group relative bg-[#ffffff] border border-[#d7e1da] rounded-2xl p-6 
        hover:border-[#d7e1da] transition-all duration-300 overflow-hidden"
    >
      {/* Glow on hover */}
      <div
        className={`absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${iconBg} blur-3xl`}
        style={{ opacity: 0 }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.06")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
      />
      <div className="relative">
        <div className={`inline-flex p-3 rounded-xl mb-4 border ${iconBg}`}>
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-[#17231d] mb-2">{title}</h3>
        <p className="text-sm text-[#566a60] leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

// ─── How It Works Step ────────────────────────────────────────────────────────

function StepCard({
  number,
  title,
  desc,
  visual,
  delay,
}: {
  number: string;
  title: string;
  desc: string;
  visual: React.ReactNode;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col gap-4"
    >
      <div className="bg-[#ffffff] border border-[#d7e1da] rounded-2xl p-6 h-52 flex items-center justify-center overflow-hidden">
        {visual}
      </div>
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="w-7 h-7 rounded-full bg-[#0f9f8a]/10 border border-[#0f9f8a]/20 flex items-center justify-center text-xs font-bold text-[#0f766e] shrink-0">
            {number}
          </span>
          <h3 className="text-sm font-semibold text-[#17231d]">{title}</h3>
        </div>
        <p className="text-sm text-[#566a60] leading-relaxed pl-10">{desc}</p>
      </div>
    </motion.div>
  );
}

// ─── Step Visuals (inline SVG) ────────────────────────────────────────────────

// ─── Step 1: Create Visual ────────────────────────────────────────────────────

function CreateVisual() {
  const questions = [
    { text: "Rate your experience", w: 110 },
    { text: "Would you recommend us?", w: 130 },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-[200px] space-y-2">
        {/* Poll card */}
        <div className="pollpulse-page border border-[#d7e1da] rounded-xl p-3 space-y-2">
          {/* Title bar */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#0f9f8a]/40" />
            <div className="h-2 bg-[#d7e1da] rounded-full w-24" />
          </div>

          {/* Questions appearing */}
          {questions.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              transition={{
                duration: 0.4,
                delay: 0.6 + i * 0.8,
                repeat: Infinity,
                repeatDelay: 3.5,
              }}
              className="overflow-hidden"
            >
              <div className="bg-[#ffffff] border border-[#d7e1da] rounded-lg p-2 space-y-1.5">
                <div
                  className="h-1.5 bg-[#b6c5bb] rounded-full"
                  style={{ width: q.w }}
                />
                <div className="flex gap-1.5">
                  {["A", "B", "C"].map((letter) => (
                    <div
                      key={letter}
                      className="flex items-center gap-1 bg-white/70 border border-[#d7e1da] rounded px-1.5 py-0.5"
                    >
                      <div className="w-1.5 h-1.5 rounded-full border border-[#b6c5bb]" />
                      <div className="h-1 w-6 bg-[#d7e1da] rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Add question button pulsing */}
          <motion.div
            animate={{ scale: [1, 1.03, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, delay: 2 }}
            className="flex items-center justify-center gap-1 bg-[#0f9f8a]/10 border border-[#0f9f8a]/30 rounded-lg py-1.5 mt-1"
          >
            <span className="text-[#0f766e] text-xs font-medium">
              + Add question
            </span>
          </motion.div>
        </div>

        {/* Mandatory toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
          className="flex items-center justify-between pollpulse-page border border-[#d7e1da] rounded-lg px-3 py-1.5"
        >
          <span className="text-[10px] text-[#566a60]">Required question</span>
          <motion.div
            animate={{
              backgroundColor: ["#d7e1da", "#0f9f8a", "#0f9f8a", "#d7e1da"],
            }}
            transition={{ duration: 4, repeat: Infinity, delay: 2 }}
            className="w-6 h-3.5 rounded-full relative"
          >
            <motion.div
              animate={{ x: [1, 11, 11, 1] }}
              transition={{ duration: 4, repeat: Infinity, delay: 2 }}
              className="absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Step 2: Share Visual ─────────────────────────────────────────────────────

function ShareVisual() {
  const [phase, setPhase] = useState(0);
  // phase 0: idle, 1: copying, 2: copied, 3: devices lit up

  useEffect(() => {
    const cycle = () => {
      setPhase(0);
      setTimeout(() => setPhase(1), 800);
      setTimeout(() => setPhase(2), 1400);
      setTimeout(() => setPhase(3), 2000);
      setTimeout(() => setPhase(0), 4200);
    };
    cycle();
    const id = setInterval(cycle, 4800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-5">
      {/* URL bar */}
      <div className="w-[220px]">
        <div className="flex items-center gap-2 pollpulse-page border border-[#d7e1da] rounded-xl px-3 py-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500/60 shrink-0" />
          <span className="text-[10px] text-[#66786f] flex-1 truncate font-mono">
            pollpulse.app/poll/x9f2k...
          </span>
          <motion.button
            animate={
              phase === 1
                ? { scale: [1, 0.9, 1.05, 1] }
                : phase >= 2
                  ? { backgroundColor: "#059669" }
                  : { backgroundColor: "#0f9f8a" }
            }
            transition={{ duration: 0.3 }}
            className="shrink-0 px-2 py-0.5 rounded-md text-[10px] text-white font-medium"
            style={{ backgroundColor: "#0f9f8a" }}
          >
            {phase >= 2 ? "✓" : "Copy"}
          </motion.button>
        </div>

        {/* Ripple on copy */}
        <AnimatePresence>
          {phase === 1 && (
            <motion.div
              initial={{ opacity: 0.6, scale: 0.95 }}
              animate={{ opacity: 0, scale: 1.08 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-xl border border-[#0f9f8a]/50 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Devices receiving */}
      <div className="flex items-end gap-6">
        {[
          {
            label: "Phone",
            icon: (
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="5" y="2" width="14" height="20" rx="3" />
                <circle cx="12" cy="18" r="1" />
              </svg>
            ),
            delay: 0,
          },
          {
            label: "Laptop",
            icon: (
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="2" y="4" width="20" height="13" rx="2" />
                <path d="M1 21h22" />
              </svg>
            ),
            delay: 0.15,
          },
          {
            label: "Tablet",
            icon: (
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <circle cx="12" cy="18" r="0.8" />
              </svg>
            ),
            delay: 0.3,
          },
        ].map(({ label, icon, delay }) => (
          <motion.div
            key={label}
            animate={
              phase >= 3
                ? {
                    color: "#0f766e",
                    filter: "drop-shadow(0 0 6px rgba(15,159,138,0.6))",
                  }
                : { color: "#d7e1da", filter: "none" }
            }
            transition={{ duration: 0.4, delay }}
            className="flex flex-col items-center gap-1"
          >
            {icon}
            <AnimatePresence>
              {phase >= 3 && (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay }}
                  className="text-[9px] text-[#0f9f8a]"
                >
                  ✓
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <motion.p
        animate={{ opacity: phase >= 2 ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="text-[10px] text-[#66786f] text-center"
      >
        Anyone with the link can respond
      </motion.p>
    </div>
  );
}

// ─── Step 3: Analytics Visual ─────────────────────────────────────────────────

function AnalyticsVisual() {
  const bars = [
    { label: "Option A", pct: 48, color: "#0f9f8a" },
    { label: "Option B", pct: 27, color: "#0f766e" },
    { label: "Option C", pct: 16, color: "#38bdf8" },
    { label: "Option D", pct: 9, color: "#f59e0b" },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center px-4">
      <div className="w-full max-w-[210px] space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-[#66786f] font-medium">
            Live results
          </span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400">247 responses</span>
          </div>
        </div>

        {/* Bars */}
        {bars.map((bar, i) => (
          <div key={bar.label} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#566a60]">{bar.label}</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: 0.3 + i * 0.15,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
                className="text-[10px] font-semibold text-[#17231d]"
              >
                {bar.pct}%
              </motion.span>
            </div>
            <div className="h-4 bg-[#ffffff] rounded-full overflow-hidden relative">
              <motion.div
                className="h-full rounded-full flex items-center justify-end pr-1.5"
                style={{ backgroundColor: bar.color }}
                initial={{ width: "0%" }}
                animate={{ width: `${bar.pct}%` }}
                transition={{
                  duration: 0.9,
                  delay: i * 0.12,
                  repeat: Infinity,
                  repeatDelay: 2.2,
                  ease: "easeOut",
                }}
              >
                {bar.pct >= 20 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + i * 0.12 }}
                    className="text-[9px] text-white/90 font-medium"
                  >
                    {bar.pct}%
                  </motion.span>
                )}
              </motion.div>
            </div>
          </div>
        ))}

        {/* Winner indicator */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: [0, 1, 1, 0], y: [4, 0, 0, 4] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: 1.2 }}
          className="flex items-center gap-1.5 mt-1 pt-2 border-t border-[#ffffff]"
        >
          <CheckCircle2 size={11} className="text-emerald-400" />
          <span className="text-[10px] text-emerald-400 font-medium">
            Option A is leading by 21%
          </span>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Live Stats Bar ───────────────────────────────────────────────────────────

function LiveStatsBar() {
  const { stats, isLoading, isConnected } = useLiveStats();

  return (
    <section className="relative z-10 border-y border-[#ffffff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 gap-6 max-w-xl mx-auto">
          {[
            {
              label: "Polls Created",
              value: stats.totalPolls,
              icon: (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="text-[#0f766e]"
                >
                  <rect x="6" y="3" width="12" height="18" rx="2" />
                  <path d="M9 7h6M9 11h6M9 15h4" />
                </svg>
              ),
              accent: "text-[#0f766e]",
              bg: "bg-[#0f9f8a]/10 border-[#0f9f8a]/20",
            },
            {
              label: "Responses Collected",
              value: stats.totalResponses,
              icon: (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="text-emerald-400"
                >
                  <circle cx="8" cy="8" r="3" />
                  <path d="M2 20c.7-3.1 3-5 6-5s5.3 1.9 6 5" />
                  <circle cx="17.5" cy="9" r="2.5" />
                  <path d="M15 20c.4-1.8 1.9-3 4-3" />
                </svg>
              ),
              accent: "text-emerald-400",
              bg: "bg-emerald-500/10 border-emerald-500/20",
            },
          ].map(({ label, value, icon, accent, bg }) => (
            <div
              key={label}
              className="flex items-center gap-4 bg-[#ffffff] border border-[#d7e1da] rounded-2xl px-5 py-4"
            >
              <div className={`p-2.5 rounded-xl border ${bg} shrink-0`}>
                {icon}
              </div>
              <div className="min-w-0">
                {isLoading ? (
                  <div className="h-7 w-16 bg-[#d7e1da] rounded-lg animate-pulse mb-1" />
                ) : (
                  <motion.p
                    key={label}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`text-2xl font-bold ${accent} tabular-nums`}
                  >
                    <AnimatedCounter to={value} />
                  </motion.p>
                )}
                <p className="text-xs text-[#566a60] font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Live indicator */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected ? "bg-emerald-400 animate-pulse" : "bg-[#b6c5bb]"
            }`}
          />
          <span className="text-xs text-[#b6c5bb]">
            {isConnected ? "Updating live" : "Live data"}
          </span>
        </div>
      </div>
    </section>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pollpulse-page text-[#17231d] overflow-x-hidden">
      {/* ── Global background effects ── */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(circle, #d7e1da 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute -top-24 left-1/2 h-[360px] w-[760px] -translate-x-1/2 rounded-full pollpulse-aurora opacity-75" />
        <div className="absolute bottom-1/3 -left-24 h-56 w-56 rotate-12 rounded-[2rem] border border-[#b8ded6] bg-white/35" />
        <div className="absolute bottom-1/4 -right-24 h-64 w-64 -rotate-6 rounded-[2rem] border border-sky-200 bg-sky-100/30" />
      </div>

      {/* ══════════════════════════════════════════ NAVBAR ══ */}
      <Navbar
        publicLinks={[
          { label: "Features", href: "#features" },
          { label: "How it works", href: "#how-it-works" },
        ]}
      />

      {/* ══════════════════════════════════════════ HERO ══ */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0f9f8a]/10 border border-[#0f9f8a]/20 rounded-full text-xs text-[#0f766e] font-medium mb-6"
            >
              <Zap size={11} />
              Real-time polling for modern teams
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl font-bold leading-[1.1] tracking-tight mb-6"
            >
              Polls that{" "}
              <span
                className="inline-block"
                style={{
                  background:
                    "linear-gradient(135deg, #0f766e 0%, #38bdf8 50%, #f59e0b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                actually
              </span>{" "}
              tell you something.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-[#566a60] leading-relaxed mb-8 max-w-lg"
            >
              Create polls in seconds, share a single link, and watch responses
              roll in with live analytics. No setup, no friction — just answers.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 mb-10"
            >
              <Button
                onClick={() => navigate("/register")}
                className="gap-2 px-6 py-3 text-base shadow-[0_16px_36px_rgba(15,159,138,0.24)]"
                size="lg"
              >
                Create your first poll
                <ArrowRight size={16} />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="gap-2"
              >
                See how it works
                <ChevronRight size={15} />
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center gap-4 text-xs text-[#66786f]"
            >
              {[
                { icon: <Shield size={12} />, label: "Anonymous mode" },
                { icon: <Timer size={12} />, label: "Expiry control" },
                { icon: <Activity size={12} />, label: "Live analytics" },
              ].map(({ icon, label }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <span className="text-[#b6c5bb]">{icon}</span>
                  {label}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right — Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <DemoPoll />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ LIVE STATS ══ */}
      <LiveStatsBar />

      {/* ══════════════════════════════════════════ FEATURES ══ */}
      <section
        id="features"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
      >
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-semibold text-[#0f9f8a] uppercase tracking-widest mb-3"
          >
            Everything you need
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight"
          >
            Built for real decisions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[#566a60] mt-3 max-w-lg mx-auto text-sm leading-relaxed"
          >
            From quick team check-ins to large-scale feedback collection —
            PollPulse handles every scenario without getting in your way.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: <Shield size={18} className="text-[#0f766e]" />,
              title: "Anonymous & Authenticated Modes",
              desc: "Choose whether respondents need to log in or can answer completely anonymously. Fingerprinting prevents duplicate submissions either way.",
              iconBg: "bg-[#0f9f8a]/10 border-[#0f9f8a]/20",
              delay: 0,
            },
            {
              icon: <Activity size={18} className="text-emerald-400" />,
              title: "Live Analytics Dashboard",
              desc: "Watch responses come in real-time. See option counts, percentages, completion rates, and participation trends — all updating live.",
              iconBg: "bg-emerald-500/10 border-emerald-500/20",
              delay: 0.08,
            },
            {
              icon: <Timer size={18} className="text-amber-400" />,
              title: "Expiry Control",
              desc: "Set a precise expiry date and time for your poll. After it closes, no new responses are accepted. Expired polls are clearly marked.",
              iconBg: "bg-amber-500/10 border-amber-500/20",
              delay: 0.16,
            },
            {
              icon: <Share2 size={18} className="text-sky-400" />,
              title: "One Link, Share Anywhere",
              desc: "Each poll gets a unique shareable link you can post anywhere — social media, email, Slack, or embed on your site.",
              iconBg: "bg-sky-500/10 border-sky-500/20",
              delay: 0.24,
            },
            {
              icon: <CheckCircle2 size={18} className="text-cyan-600" />,
              title: "Mandatory & Optional Questions",
              desc: "Mark specific questions as required. Respondents can skip optional questions but must answer mandatory ones before submitting.",
              iconBg: "bg-cyan-50 border-cyan-200",
              delay: 0.32,
            },
            {
              icon: <Eye size={18} className="text-rose-400" />,
              title: "Publish Results Publicly",
              desc: "When you're ready, publish final results. Anyone visiting the poll link will now see a results page instead of the form.",
              iconBg: "bg-rose-500/10 border-rose-500/20",
              delay: 0.4,
            },
          ].map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════ HOW IT WORKS ══ */}
      <section
        id="how-it-works"
        className="relative z-10 border-t border-[#ffffff]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-14">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-semibold text-[#0f9f8a] uppercase tracking-widest mb-3"
            >
              Simple by design
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl font-bold tracking-tight"
            >
              Three steps. That's it.
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector lines — desktop only */}

            <StepCard
              number="1"
              title="Build your poll"
              desc="Add your questions, set options, mark mandatory fields, choose anonymous or authenticated mode, and set an expiry time."
              visual={<CreateVisual />}
              delay={0}
            />
            <StepCard
              number="2"
              title="Share the link"
              desc="Copy your unique poll link and share it anywhere. Respondents open it directly in their browser — no account needed for anonymous polls."
              visual={<ShareVisual />}
              delay={0.15}
            />
            <StepCard
              number="3"
              title="See who said what"
              desc="Your analytics dashboard shows every response in real-time. Question breakdowns, option percentages, completion rates, and participation trends."
              visual={<AnalyticsVisual />}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ SOCIAL PROOF ══ */}
      {/* ══════════════════════════════════════════ DASHBOARD PREVIEW ══ */}
      <section className="relative z-10 border-t border-[#ffffff] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-semibold text-[#0f9f8a] uppercase tracking-widest mb-3"
            >
              Your command center
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl font-bold tracking-tight"
            >
              Everything in one dashboard
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-[#566a60] mt-3 max-w-md mx-auto text-sm"
            >
              See all your polls, track live response counts, drill into
              question breakdowns, and publish results — from one clean
              interface.
            </motion.p>
          </div>

          {/* Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative max-w-4xl mx-auto"
          >
            {/* Glow behind mockup */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(15,159,138,0.12), transparent)",
                filter: "blur(20px)",
                transform: "translateY(10%)",
              }}
            />

            {/* Browser chrome */}
            <div className="relative pollpulse-page border border-[#d7e1da] rounded-2xl overflow-hidden shadow-[0_24px_70px_rgba(24,43,35,0.14)]">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#ffffff] border-b border-[#d7e1da]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                </div>
                <div className="flex-1 mx-4 bg-[#ffffff] border border-[#d7e1da] rounded-md px-3 py-1 text-xs text-[#b6c5bb] font-mono">
                  pollpulse.app/dashboard
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-5 space-y-4">
                {/* Stat cards row */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    {
                      label: "Total Polls",
                      value: "12",
                      color: "text-[#0f766e]",
                      bg: "bg-[#0f9f8a]/10 border-[#0f9f8a]/20",
                    },
                    {
                      label: "Live Now",
                      value: "5",
                      color: "text-emerald-400",
                      bg: "bg-emerald-500/10 border-emerald-500/20",
                    },
                    {
                      label: "Published",
                      value: "3",
                      color: "text-sky-400",
                      bg: "bg-sky-500/10 border-sky-500/20",
                    },
                    {
                      label: "Responses",
                      value: "284",
                      color: "text-amber-400",
                      bg: "bg-amber-500/10 border-amber-500/20",
                    },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      className="bg-[#ffffff] border border-[#d7e1da] rounded-xl p-3"
                    >
                      <p className="text-[10px] text-[#66786f] mb-1">{label}</p>
                      <p className={`text-xl font-bold ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Poll cards */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      title: "Q2 Team Retrospective",
                      responses: 47,
                      status: "Live",
                      statusColor:
                        "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                      barPct: 62,
                    },
                    {
                      title: "Product Roadmap Vote",
                      responses: 128,
                      status: "Published",
                      statusColor:
                        "text-[#0f766e] bg-[#0f9f8a]/10 border-[#0f9f8a]/20",
                      barPct: 89,
                    },
                  ].map((poll) => (
                    <div
                      key={poll.title}
                      className="bg-[#ffffff] border border-[#d7e1da] rounded-xl p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-[#17231d] leading-snug flex-1">
                          {poll.title}
                        </p>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium shrink-0 ${poll.statusColor}`}
                        >
                          {poll.status}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-[#66786f]">
                          <span>{poll.responses} responses</span>
                          <span>{poll.barPct}%</span>
                        </div>
                        <div className="h-1.5 bg-white/70 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-[#0f9f8a] rounded-full"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${poll.barPct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <div className="flex-1 flex items-center justify-center gap-1 bg-white/70 border border-[#d7e1da] rounded-md py-1 text-[10px] text-[#0f9f8a]">
                          <BarChart3 size={9} />
                          Analytics
                        </div>
                        <div className="flex-1 flex items-center justify-center gap-1 bg-white/70 border border-[#d7e1da] rounded-md py-1 text-[10px] text-[#66786f]">
                          <Share2 size={9} />
                          Share
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mini analytics row */}
                <div className="bg-[#ffffff] border border-[#d7e1da] rounded-xl p-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-[#17231d]">
                      Q2 Retrospective — Question Breakdown
                    </span>
                    <span className="text-[10px] text-[#66786f]">
                      47 responses
                    </span>
                  </div>
                  <div className="space-y-2">
                    {[
                      {
                        opt: "More async communication",
                        pct: 42,
                        color: "bg-[#0f9f8a]",
                      },
                      {
                        opt: "Better sprint planning",
                        pct: 31,
                        color: "bg-sky-500",
                      },
                      {
                        opt: "Clearer documentation",
                        pct: 27,
                        color: "bg-emerald-500",
                      },
                    ].map((item) => (
                      <div key={item.opt} className="flex items-center gap-3">
                        <span className="text-[10px] text-[#566a60] w-36 shrink-0 truncate">
                          {item.opt}
                        </span>
                        <div className="flex-1 h-2 bg-white/70 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${item.color}`}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.pct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                          />
                        </div>
                        <span className="text-[10px] text-[#17231d] font-medium w-8 text-right shrink-0">
                          {item.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-4 top-16 bg-[#ffffff] border border-[#d7e1da] rounded-xl px-3 py-2 shadow-xl hidden lg:flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-[#17231d] font-medium">
                Live response received
              </span>
            </motion.div>

            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -left-4 bottom-20 bg-[#ffffff] border border-[#d7e1da] rounded-xl px-3 py-2 shadow-xl hidden lg:flex items-center gap-2"
            >
              <Globe size={12} className="text-[#0f9f8a]" />
              <span className="text-xs text-[#17231d] font-medium">
                Results published
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ CTA ══ */}
      <section className="relative z-10 border-t border-[#ffffff]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Glow */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(15,159,138,0.08), transparent)",
              }}
            />

            <div
              className="relative border border-[#d7e1da] rounded-3xl p-12"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f6f7f2 100%)",
              }}
            >
              {/* Decorative corners */}
              <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-[#0f9f8a]/30 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-[#0f9f8a]/30 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-[#0f9f8a]/30 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-[#0f9f8a]/30 rounded-br-lg" />

              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0f9f8a]/10 border border-[#0f9f8a]/20 rounded-full text-xs text-[#0f766e] font-medium mb-6">
                <PollPulseLogo size={14} />
                Start for free — no credit card needed
              </div>

              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                Ready to start asking
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #0f766e, #f59e0b)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  better questions?
                </span>
              </h2>

              <p className="text-[#566a60] text-base mb-8 max-w-md mx-auto">
                Create your first poll in under 2 minutes. No tutorials. No
                onboarding. Just answers.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate("/register")}
                  size="lg"
                  className="gap-2 px-8 shadow-[0_18px_42px_rgba(15,159,138,0.24)]"
                >
                  Create free account
                  <ArrowRight size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/login")}
                  className="gap-2"
                >
                  I already have an account
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ FOOTER ══ */}
      <footer className="relative z-10 border-t border-[#ffffff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <PollPulseLogo size={20} />
              <span className="text-sm font-semibold text-[#17231d]">
                PollPulse
              </span>
              <span className="text-[#b6c5bb] text-xs ml-2">
                © {new Date().getFullYear()}
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs text-[#66786f]">
              <Link to="/login" className="hover:text-[#0f6f61] transition-colors">
                Sign in
              </Link>
              <Link
                to="/register"
                className="hover:text-[#0f6f61] transition-colors"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

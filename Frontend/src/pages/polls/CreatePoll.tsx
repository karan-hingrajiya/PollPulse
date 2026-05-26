import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Loader2,
  CalendarIcon,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Card from "@/components/pollpulse/Card";
import Button from "@/components/pollpulse/Button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { createPoll } from "./api/poll-management.api";
import type { CreatePollQuestion } from "@/pages/dashboard/types";
import { getUserFriendlyError } from "@/common/error-handler";

// ─── Types ───────────────────────────────────────────────────────────────────

interface QuestionDraft extends CreatePollQuestion {
  id: string;
  isCollapsed: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2);
}

function makeEmptyQuestion(): QuestionDraft {
  return {
    id: uid(),
    text: "",
    isMandatory: false,
    isCollapsed: false,
    options: [{ text: "" }, { text: "" }],
  };
}

// ─── Option Input ─────────────────────────────────────────────────────────────

function OptionInput({
  value,
  onChange,
  onRemove,
  canRemove,
  index,
}: {
  value: string;
  onChange: (v: string) => void;
  onRemove: () => void;
  canRemove: boolean;
  index: number;
}) {
  return (
    <div className="flex items-center gap-2 group">
      <GripVertical size={14} className="text-[#3a3a3a] shrink-0" />
      <div className="flex-1 flex items-center gap-2 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 focus-within:border-[#6366f1]/50 transition-colors">
        <span className="text-xs text-[#52525b] font-medium w-5 shrink-0">
          {String.fromCharCode(65 + index)}
        </span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Option ${String.fromCharCode(65 + index)}`}
          className="flex-1 bg-transparent text-sm text-white placeholder:text-[#3a3a3a] outline-none"
          maxLength={200}
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        className="p-1.5 rounded-lg text-[#3a3a3a] hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-0 disabled:pointer-events-none"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  index,
  total,
  onUpdate,
  onRemove,
}: {
  question: QuestionDraft;
  index: number;
  total: number;
  onUpdate: (updated: Partial<QuestionDraft>) => void;
  onRemove: () => void;
}) {
  const updateOption = (optIdx: number, text: string) => {
    const options = question.options.map((o, i) =>
      i === optIdx ? { text } : o
    );
    onUpdate({ options });
  };

  const addOption = () => {
    if (question.options.length >= 8) {
      toast.error("Maximum 8 options per question");
      return;
    }
    onUpdate({ options: [...question.options, { text: "" }] });
  };

  const removeOption = (optIdx: number) => {
    if (question.options.length <= 2) return;
    onUpdate({ options: question.options.filter((_, i) => i !== optIdx) });
  };

  return (
    <Card className="overflow-hidden">
      {/* Question header */}
      <div className="p-4 flex items-center gap-3">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center text-xs font-bold text-[#818cf8]">
          {index + 1}
        </div>

        <input
          value={question.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Enter your question..."
          className="flex-1 bg-transparent text-sm font-medium text-white placeholder:text-[#3a3a3a] outline-none"
        />

        <div className="flex items-center gap-1 ml-auto pl-2">
          <button
            type="button"
            onClick={() => onUpdate({ isCollapsed: !question.isCollapsed })}
            className="p-1.5 rounded-lg text-[#52525b] hover:text-white hover:bg-[#2a2a2a] transition-all"
          >
            {question.isCollapsed ? (
              <ChevronDown size={15} />
            ) : (
              <ChevronUp size={15} />
            )}
          </button>
          {total > 1 && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1.5 rounded-lg text-[#52525b] hover:text-red-400 hover:bg-red-400/10 transition-all"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Options */}
      {!question.isCollapsed && (
        <div className="px-4 pb-4 space-y-3 border-t border-[#2a2a2a] pt-4">
          <div className="space-y-2">
            {question.options.map((opt, optIdx) => (
              <OptionInput
                key={optIdx}
                index={optIdx}
                value={opt.text}
                onChange={(v) => updateOption(optIdx, v)}
                onRemove={() => removeOption(optIdx)}
                canRemove={question.options.length > 2}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1.5 text-xs text-[#6366f1] hover:text-[#818cf8] transition-colors py-1"
          >
            <Plus size={12} />
            Add option
          </button>

          <div className="flex items-center justify-between pt-2 border-t border-[#1a1a1a]">
            <span className="text-xs text-[#71717a]">Mark as required</span>
            <Switch
              checked={question.isMandatory}
              onCheckedChange={(v) => onUpdate({ isMandatory: v })}
              className="data-[state=checked]:bg-[#6366f1] scale-90"
            />
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Date Picker (minimal) ────────────────────────────────────────────────────

function DateTimeInput({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  // Minimum: now + 5 minutes
  const [min] = useState(() => {
    const targetTime = new Date(Date.now() + 5 * 60 * 1000);
    return new Date(targetTime.getTime() - targetTime.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  });

  return (
    <div>
      <div
        className={`flex items-center gap-2 bg-[#1a1a1a] border rounded-lg px-3 py-2.5 focus-within:border-[#6366f1]/60 transition-colors ${
          error ? "border-red-500/60" : "border-[#2a2a2a]"
        }`}
      >
        <CalendarIcon size={15} className="text-[#52525b] shrink-0" />
        <input
          type="datetime-local"
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-sm text-white outline-none [color-scheme:dark]"
        />
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-400 mt-1.5">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CreatePollPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>(() => [
    makeEmptyQuestion(),
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Validation ──────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!title.trim() || title.trim().length < 2) {
      e.title = "Title must be at least 2 characters";
    }
    if (description.trim() && description.trim().length < 10) {
      e.description = "Description must be at least 10 characters if provided";
    }
    if (!expiresAt) {
      e.expiresAt = "Please set an expiry date and time";
    } else if (new Date(expiresAt) <= new Date()) {
      e.expiresAt = "Expiry must be in the future";
    }

    questions.forEach((q, qi) => {
      if (!q.text.trim() || q.text.trim().length < 6) {
        e[`q_${qi}`] = "Question must be at least 6 characters";
      }
      q.options.forEach((opt, oi) => {
        if (!opt.text.trim() || opt.text.trim().length < 2) {
          e[`q_${qi}_o_${oi}`] = "Option must be at least 2 characters";
        }
      });
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      await createPoll({
        title: title.trim(),
        description: description.trim() || undefined,
        isAnonymous,
        expiresAt: new Date(expiresAt).toISOString(),
        questions: questions.map(({ text, isMandatory, options }) => ({
          text: text.trim(),
          isMandatory,
          options: options.map((o) => ({ text: o.text.trim() })),
        })),
      });
      toast.success("Poll created successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(getUserFriendlyError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Question helpers ────────────────────────────────────────
  const addQuestion = () => {
    if (questions.length >= 20) {
      toast.error("Maximum 20 questions per poll");
      return;
    }
    setQuestions((prev) => [...prev, makeEmptyQuestion()]);
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      50
    );
  };

  const updateQuestion = (id: string, update: Partial<QuestionDraft>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...update } : q))
    );
    // Clear related errors
    const qi = questions.findIndex((q) => q.id === id);
    if (qi >= 0) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`q_${qi}`];
        return next;
      });
    }
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-[#71717a] hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={15} />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-white">Create a new poll</h1>
          <p className="text-sm text-[#71717a] mt-1">
            Build your poll, set options, and share it with anyone.
          </p>
        </div>

        <div className="space-y-6">
          {/* ── Poll Settings ── */}
          <Card className="p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[#6366f1]"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 9h6M9 13h4" />
              </svg>
              Poll Settings
            </h2>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors((p) => ({ ...p, title: "" }));
                }}
                placeholder="What is this poll about?"
                maxLength={300}
                className={`w-full bg-[#1a1a1a] border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-[#3a3a3a] outline-none focus:border-[#6366f1]/60 transition-colors ${
                  errors.title ? "border-red-500/60" : "border-[#2a2a2a]"
                }`}
              />
              {errors.title && (
                <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
                  <AlertCircle size={11} /> {errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">
                Description{" "}
                <span className="text-[#52525b] font-normal">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors((p) => ({ ...p, description: "" }));
                }}
                placeholder="Give respondents some context..."
                rows={3}
                maxLength={1000}
                className={`w-full bg-[#1a1a1a] border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-[#3a3a3a] outline-none focus:border-[#6366f1]/60 transition-colors resize-none ${
                  errors.description ? "border-red-500/60" : "border-[#2a2a2a]"
                }`}
              />
              {errors.description && (
                <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
                  <AlertCircle size={11} /> {errors.description}
                </p>
              )}
            </div>

            {/* Expiry */}
            <div>
              <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">
                Expires at <span className="text-red-400">*</span>
              </label>
              <DateTimeInput
                value={expiresAt}
                onChange={(v) => {
                  setExpiresAt(v);
                  setErrors((p) => ({ ...p, expiresAt: "" }));
                }}
                error={errors.expiresAt}
              />
            </div>

            {/* Anonymous toggle */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-medium text-white">
                  Anonymous responses
                </p>
                <p className="text-xs text-[#71717a] mt-0.5">
                  Respondents won't need to log in
                </p>
              </div>
              <Switch
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
                className="data-[state=checked]:bg-[#6366f1]"
              />
            </div>
          </Card>

          {/* ── Questions ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                Questions{" "}
                <span className="text-[#52525b] font-normal">
                  ({questions.length})
                </span>
              </h2>
              <span className="text-xs text-[#52525b]">
                {questions.length}/20
              </span>
            </div>

            {questions.map((q, qi) => (
              <div key={q.id}>
                {(errors[`q_${qi}`] ||
                  q.options.some(
                    (_, oi) => errors[`q_${qi}_o_${oi}`]
                  )) && (
                  <p className="flex items-center gap-1 text-xs text-red-400 mb-1.5 px-1">
                    <AlertCircle size={11} />
                    {errors[`q_${qi}`] || "One or more options are too short"}
                  </p>
                )}
                <QuestionCard
                  question={q}
                  index={qi}
                  total={questions.length}
                  onUpdate={(update) => updateQuestion(q.id, update)}
                  onRemove={() => removeQuestion(q.id)}
                />
              </div>
            ))}

            <button
              type="button"
              onClick={addQuestion}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#2a2a2a] rounded-xl text-sm text-[#52525b] hover:text-[#6366f1] hover:border-[#6366f1]/40 transition-all"
            >
              <Plus size={15} />
              Add question
            </button>

            <div ref={bottomRef} />
          </div>

          {/* ── Submit ── */}
          <div className="flex items-center justify-between pt-2 pb-8">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-2 min-w-[140px] justify-center"
            >
              {isSubmitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 4v16M4 12h16" />
                    <path d="M19 5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8.8-1.9Z" />
                  </svg>
                  Create Poll
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

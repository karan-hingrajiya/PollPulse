import { useState, type FormEvent } from "react";
// import { useNavigate } from "react-router";
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";
import AuthLayout from "./components/AuthLayout";
import Button from "@/components/pollpulse/Button";
import { cn } from "@/lib/utils";
import { apiClient } from "@/common/api-client";
import { getUserFriendlyError } from "@/common/error-handler";

interface ForgotPasswordProps {
  onNavigateToLogin?: () => void;
}

// const navigate = useNavigate();

export default function ForgotPassword({
  onNavigateToLogin,
}: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldError("");

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("Please enter a valid email");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post("/api/auth/forgot-password", { email });
      await new Promise((r) => setTimeout(r, 1000));
      setIsSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Request failed";
      if (message.toLowerCase().includes("email does not exist")) {
        setError("No account found with this email address.");
      } else {
        setError(getUserFriendlyError(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    onNavigateToLogin?.();
    // navigate("/login");
  };

  // ─── Success State ──────────────────────────────────────
  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4 animate-in zoom-in duration-300">
            <CheckCircle2 size={32} className="text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Reset link sent
          </h2>
          <p className="text-sm text-[#71717a] mb-1">
            We sent a password reset link to{" "}
            <span className="text-white font-medium">{email}</span>.
          </p>
          <p className="text-sm text-[#71717a] mb-2">
            The link expires in 15 minutes.
          </p>
          <p className="text-xs text-[#52525b] mb-6">
            Didn&apos;t get it? Check your spam folder.
          </p>
          <Button className="w-full justify-center" onClick={goToLogin}>
            Back to Sign In
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // ─── Form State ─────────────────────────────────────────
  return (
    <AuthLayout
      footer={{
        text: "Remember it?",
        linkText: "Sign in",
        to: "/login",
      }}
    >
      {/* Back button */}
      <button
        onClick={goToLogin}
        className="flex items-center gap-1.5 text-sm text-[#71717a] hover:text-white transition-colors mb-4 -ml-1"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Icon */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#6366f1]/10 mb-3">
          <Mail size={24} className="text-[#818cf8]" />
        </div>
        <h1 className="text-xl font-semibold text-white">
          Forgot your password?
        </h1>
        <p className="text-sm text-[#71717a] mt-1">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-white">Email</label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b]"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldError("");
              }}
              placeholder="Enter your email"
              className={cn(
                "w-full h-10 pl-10 pr-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder:text-[#52525b]",
                "focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/30",
                "transition-all duration-200",
                fieldError &&
                  "border-red-500 focus:border-red-500 focus:ring-red-500/30",
              )}
            />
          </div>
          {fieldError && <p className="text-xs text-red-400">{fieldError}</p>}
        </div>

        <Button
          type="submit"
          className="w-full justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}

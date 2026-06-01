/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router";
import { Loader2, Mail, AlertTriangle } from "lucide-react";
import AuthLayout from "./components/AuthLayout";
import PasswordInput from "./components/PasswordInput";
import Button from "@/components/pollpulse/Button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { apiClient } from "@/common/api-client";
import { getUserFriendlyError } from "@/common/error-handler";

interface LoginProps {
  onLoginSuccess?: () => void;
  onNavigateToRegister?: () => void;
  onNavigateToForgotPassword?: () => void;
}

export default function Login({
  onLoginSuccess,
  onNavigateToRegister: _onNavigateToRegister,
  // The underscore prefix (_onNavigateToRegister) is a common JavaScript and TypeScript convention used to signal that a variable or prop is intentionally unused in the code body.
  onNavigateToForgotPassword,
}: LoginProps) {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [isUnverified, setIsUnverified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showAuthOnlyPollWarning, setShowAuthOnlyPollWarning] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const reason = query.get("reason");
    if (reason === "auth_required_poll") {
      setShowAuthOnlyPollWarning(true);
      toast.warning(
        "This poll accepts authenticated responses only. Please sign in to continue.",
      );
    }
  }, [location.search]);

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsUnverified(false);

    if (!validate()) return;

    setIsLoading(true);

    try {
      const res = await apiClient.post("/api/auth/login", { email, password });
      const { accessToken } = res.data.data;
      // Persist access token for authenticated requests
      try {
        localStorage.setItem("accessToken", accessToken);
      } catch (err) {
        // ignore storage errors
      }

      // Safely trigger navigation now that credentials are saved
      onLoginSuccess?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      if (message.includes("Please Verify Your Email First Before Login")) {
        localStorage.setItem(
          "pendingVerificationEmail",
          email.trim().toLowerCase(),
        );
        setIsUnverified(true);
      } else {
        setError(getUserFriendlyError(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Please enter your email first.");
      return;
    }

    setIsResending(true);
    try {
      await apiClient.post("/api/auth/resend-verification", {
        email: normalizedEmail,
      });
      localStorage.setItem("pendingVerificationEmail", normalizedEmail);
      toast.success("Verification email sent. Please check your inbox.");
    } catch (err: unknown) {
      setError(getUserFriendlyError(err));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      footer={{
        text: "Don't have an account?",
        linkText: "Sign up",
        to: "/register",
      }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-[#17231d]">Welcome back</h1>
        <p className="text-sm text-[#566a60] mt-1">
          Sign in to your PollPulse account
        </p>
      </div>

      {/* Unverified warning */}
      {isUnverified && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
          <div className="w-full">
            <p className="text-sm text-amber-300">
              Please check your email and verify your account before logging in.
            </p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isResending}
              className="mt-2 text-xs text-amber-200 hover:text-[#0f6f61] transition-colors disabled:opacity-60"
            >
              {isResending ? "Sending..." : "Resend verification email"}
            </button>
          </div>
        </div>
      )}

      {showAuthOnlyPollWarning && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
          <div className="w-full">
            <p className="text-sm text-amber-300">
              This poll is for authenticated users only. Please sign in to submit your response.
            </p>
          </div>
        </div>
      )}

      {/* General error */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#17231d]">Email</label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#66786f]"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email)
                  setFieldErrors((p) => ({ ...p, email: undefined }));
              }}
              placeholder="Enter your email"
              className={cn(
                "w-full h-10 pl-10 pr-3 bg-[#ffffff] border border-[#d7e1da] rounded-lg text-sm text-[#17231d] placeholder:text-[#66786f]",
                "focus:outline-none focus:border-[#0f9f8a] focus:ring-1 focus:ring-[#0f9f8a]/30",
                "transition-all duration-200",
                fieldErrors.email &&
                  "border-red-500 focus:border-red-500 focus:ring-red-500/30",
              )}
            />
          </div>
          {fieldErrors.email && (
            <p className="text-xs text-red-400">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password)
                setFieldErrors((p) => ({ ...p, password: undefined }));
            }}
            placeholder="Enter your password"
            error={fieldErrors.password}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onNavigateToForgotPassword}
              className="text-xs text-[#566a60] hover:text-[#0f9f8a] transition-colors"
            >
              Forgot password?
            </button>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      {/* Register link mobile fallback */}
      <div className="mt-6 text-center sm:hidden">
        <p className="text-sm text-[#566a60]">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-[#0f9f8a] hover:text-[#0f766e] transition-colors font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

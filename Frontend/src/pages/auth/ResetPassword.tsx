import { useState, type FormEvent, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Lock, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/common/api-client";
import AuthLayout from "./components/AuthLayout";
import PasswordInput from "./components/PasswordInput";
import Button from "@/components/pollpulse/Button";
import { cn } from "@/lib/utils";

interface ResetPasswordProps {
  token?: string;
  onNavigateToLogin?: () => void;
}

type PageState = "form" | "success" | "expired";

export default function ResetPassword({
  token,
  onNavigateToLogin,
}: ResetPasswordProps) {
  const navigate = useNavigate();
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pageState, setPageState] = useState<PageState>("form");
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  // Password strength calculation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const strengthScore = [hasMinLength, hasUppercase, hasLowercase, hasDigit].filter(Boolean).length;

  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-emerald-500",
  ];
  const strengthTextColors = [
    "text-red-400",
    "text-orange-400",
    "text-yellow-400",
    "text-emerald-400",
  ];

  const validate = () => {
    const errors: typeof fieldErrors = {};
    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasDigit)
      errors.password = "Password does not meet requirements";
    if (password !== confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await apiClient.put(`/api/auth/reset-password/${token}`, { password });
      toast.success("Password updated — redirecting to sign in...");
      setPageState("success");
      // lock UI to avoid duplicate actions while redirecting
      setLocked(true);
      // Redirect after a short delay so user sees confirmation
      redirectTimer.current = setTimeout(() => navigate("/login"), 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      if (
        message.toLowerCase().includes("token expired") ||
        message.toLowerCase().includes("user does not exist")
      ) {
        setPageState("expired");
        toast.error("This reset link is invalid or expired.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    onNavigateToLogin?.();
    if (redirectTimer.current) {
      clearTimeout(redirectTimer.current);
      redirectTimer.current = null;
    }
  };

  // ─── Success State ──────────────────────────────────────
  if (pageState === "success") {
    return (
      <AuthLayout>
        <div className="relative text-center py-4">
          {locked && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
              <Loader2 size={36} className="animate-spin text-[#17231d]" />
            </div>
          )}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4 animate-in zoom-in duration-300">
            <CheckCircle2 size={32} className="text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold text-[#17231d] mb-2">
            Password updated!
          </h2>
          <p className="text-sm text-[#566a60] mb-6">
            Your password has been successfully reset.
          </p>
          <Button className="w-full justify-center" onClick={goToLogin} >
            Sign In Now
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // ─── Expired State ──────────────────────────────────────
  if (pageState === "expired") {
    return (
      <AuthLayout>
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4 animate-in zoom-in duration-300">
            <XCircle size={32} className="text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-[#17231d] mb-2">Link expired</h2>
          <p className="text-sm text-[#566a60] mb-6">
            This password reset link has expired or is invalid. Please request a
            new one.
          </p>
          <Button className="w-full justify-center" onClick={goToLogin}>
            Request new link
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // ─── Form State ─────────────────────────────────────────
  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0f9f8a]/10 mb-3">
          <Lock size={24} className="text-[#0f766e]" />
        </div>
        <h1 className="text-xl font-semibold text-[#17231d]">Create new password</h1>
        <p className="text-sm text-[#566a60] mt-1">
          Your new password must be different from your previous one.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div className="space-y-2">
          <PasswordInput
            label="New Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password)
                setFieldErrors((p) => ({ ...p, password: undefined }));
            }}
            placeholder="Enter new password"
            error={fieldErrors.password}
          />

          {/* Strength indicator */}
          {password.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all duration-300",
                      strengthScore >= level
                        ? strengthColors[strengthScore - 1]
                        : "bg-[#d7e1da]"
                    )}
                  />
                ))}
              </div>
              <p
                className={cn(
                  "text-xs font-medium transition-colors duration-300",
                  strengthTextColors[strengthScore - 1] || "text-[#66786f]"
                )}
              >
                {strengthLabels[strengthScore - 1] || "Weak"}
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <PasswordInput
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (fieldErrors.confirmPassword)
              setFieldErrors((p) => ({ ...p, confirmPassword: undefined }));
          }}
          placeholder="Confirm new password"
          error={fieldErrors.confirmPassword}
        />

        {/* Submit */}
        <Button
          type="submit"
          className="w-full justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}

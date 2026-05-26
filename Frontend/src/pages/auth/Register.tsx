import { useState, type FormEvent } from "react";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import AuthLayout from "./components/AuthLayout";
import PasswordInput from "./components/PasswordInput";
import Button from "@/components/pollpulse/Button";
import { cn } from "@/lib/utils";
import { apiClient } from "@/common/api-client";
import { getUserFriendlyError } from "@/common/error-handler";

interface RegisterProps {
  onRegisterSuccess?: () => void;
  onNavigateToLogin?: () => void;
}

export default function Register({
  onRegisterSuccess,
  onNavigateToLogin,
}: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasMinLength = password.length >= 8;

  const getPasswordHint = () => {
    if (!password) return null;
    const checks = [
      { label: "8+ characters", met: hasMinLength },
      { label: "uppercase", met: hasUppercase },
      { label: "lowercase", met: hasLowercase },
      { label: "number", met: hasDigit },
    ];
    const missing = checks.filter((c) => !c.met).map((c) => c.label);
    if (missing.length === 0) return null;
    return `Missing: ${missing.join(", ")}`;
  };

  const validate = () => {
    const errors: typeof fieldErrors = {};
    if (!name.trim() || name.trim().length < 2)
      errors.name = "Name must be at least 2 characters";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Please enter a valid email";
    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasDigit)
      errors.password = "Password does not meet requirements";
    if (password !== confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {

      await apiClient.post("/api/auth/register", { name, email, password });
      localStorage.setItem("pendingVerificationEmail", email.trim().toLowerCase());
      await new Promise((r) => setTimeout(r, 2000));
      setIsSuccess(true);
      onRegisterSuccess?.();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      if (message.toLowerCase().includes("email is already exists")) {
        setError("An account with this email already exists.");
      } else {
        setError(getUserFriendlyError(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Success State ──────────────────────────────────────
  if (isSuccess) {
    return (
      <AuthLayout
        footer={{
          text: "Already verified?",
          linkText: "Sign in",
          to: "/login",
        }}
      >
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4 animate-in zoom-in duration-300">
            <CheckCircle2 size={32} className="text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Check your email
          </h2>
          <p className="text-sm text-[#71717a] mb-1">
            We sent a verification link to{" "}
            <span className="text-white font-medium">{email}</span>.
          </p>
          <p className="text-sm text-[#71717a] mb-6">
            Click it to activate your account.
          </p>
          <p className="text-xs text-[#52525b] mb-6">
            Didn&apos;t receive it? Check your spam folder.
          </p>
          <Button className="w-full justify-center" onClick={onNavigateToLogin}>
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
        text: "Already have an account?",
        linkText: "Sign in",
        to: "/login",
      }}
    >
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-white">
          Create your account
        </h1>
        <p className="text-sm text-[#71717a] mt-1">
          Start creating polls in minutes
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-white">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldErrors.name)
                setFieldErrors((p) => ({ ...p, name: undefined }));
            }}
            placeholder="Enter your full name"
            className={cn(
              "w-full h-10 px-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder:text-[#52525b]",
              "focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/30",
              "transition-all duration-200",
              fieldErrors.name &&
                "border-red-500 focus:border-red-500 focus:ring-red-500/30",
            )}
          />
          {fieldErrors.name && (
            <p className="text-xs text-red-400">{fieldErrors.name}</p>
          )}
        </div>

        {/* Email */}
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
                if (fieldErrors.email)
                  setFieldErrors((p) => ({ ...p, email: undefined }));
              }}
              placeholder="Enter your email"
              className={cn(
                "w-full h-10 pl-10 pr-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder:text-[#52525b]",
                "focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/30",
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
            placeholder="Create a password"
            error={fieldErrors.password}
          />
          <p className="text-xs text-[#52525b] px-0.5">
            Must be 8+ characters with uppercase, lowercase, and a number
          </p>
          {getPasswordHint() && (
            <p className="text-xs text-amber-400/80 px-0.5">
              {getPasswordHint()}
            </p>
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
          placeholder="Confirm your password"
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
            "Create Account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}

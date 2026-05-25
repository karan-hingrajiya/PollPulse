import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/common/api-client";
import AuthLayout from "./components/AuthLayout";
import Button from "@/components/pollpulse/Button";

interface VerifyEmailProps {
  token?: string;
  onNavigateToLogin?: () => void;
}

type VerifyState = "loading" | "success" | "error";

export default function VerifyEmail({
  token,
  onNavigateToLogin,
}: VerifyEmailProps) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerifyState>(() =>
    token ? "loading" : "error",
  );

  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasRequestedRef = useRef(false);
  const [locked, setLocked] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    // Prevent duplicate verify calls in React StrictMode during development.
    if (hasRequestedRef.current) return;
    hasRequestedRef.current = true;

    const verify = async () => {
      try {
        await apiClient.get(`/api/auth/verify-email/${token}`);
        toast.success("Email verified - you can sign in now.");
        setStatus("success");
        setLocked(true);
        redirectTimer.current = setTimeout(() => navigate("/login"), 2000);
      } catch {
        toast.error("Verification failed or link invalid.");
        setStatus("error");
      }
    };

    verify();

    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, [token, navigate]);

  const goToLogin = () => {
    if (redirectTimer.current) {
      clearTimeout(redirectTimer.current);
      redirectTimer.current = null;
    }
    onNavigateToLogin?.();
  };

  const handleResendVerification = async () => {
    const email = localStorage.getItem("pendingVerificationEmail");
    if (!email) {
      toast.error("Please register again to get a fresh verification link.");
      return;
    }

    setIsResending(true);
    try {
      await apiClient.post("/api/auth/resend-verification", { email });
      toast.success("New verification email sent. Please check your inbox.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not resend verification email.";
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  if (status === "loading") {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 size={40} className="text-[#6366f1] animate-spin mb-4" />
          <p className="text-white font-medium">Verifying your email...</p>
        </div>
      </AuthLayout>
    );
  }

  if (status === "success") {
    return (
      <AuthLayout>
        <div className="relative text-center py-4">
          {/* {locked && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
              <Loader2 size={36} className="animate-spin text-white" />
            </div>
          )} */}
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4"
            style={{
              animation: "scaleIn 0.4s ease-out",
            }}
          >
            <CheckCircle2 size={32} className="text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Email Verified!
          </h2>
          <p className="text-sm text-[#71717a] mb-6">
            Your account has been successfully verified. You can now sign in to
            PollPulse.
          </p>
          <Button
            className="w-full justify-center"
            onClick={goToLogin}
            disabled={locked}
          >
            Continue to Sign In
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="text-center py-4">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4"
          style={{
            animation: "scaleIn 0.4s ease-out",
          }}
        >
          <XCircle size={32} className="text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Verification failed
        </h2>
        <p className="text-sm text-[#71717a] mb-6">
          This verification link is invalid or has already been used. Please
          register again or contact support.
        </p>
        <Button className="w-full justify-center" onClick={goToLogin}>
          Back to Sign In
        </Button>
        <Button
          className="w-full justify-center mt-3"
          onClick={handleResendVerification}
          disabled={isResending}
        >
          {isResending ? <Loader2 size={16} className="animate-spin" /> : "Resend Verification Email"}
        </Button>
      </div>
    </AuthLayout>
  );
}

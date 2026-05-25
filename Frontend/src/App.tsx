import { Route, Routes, useNavigate, useParams } from "react-router";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import DashboardPage from "./pages/dashboard/Dashboard";
import PollAnalyticsPage from "./pages/polls/PollAnalytics";
import CreatePollPage from "./pages/polls/CreatePoll";
import PublicPollForm from "./pages/public/PublicPollForm";
import PublicPollResults from "./pages/public/PublicPollResults";
import LandingPage from "./pages/public/LandingPage";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

function ResetPasswordWrapper() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  return (
    <ResetPassword token={token} onNavigateToLogin={() => navigate("/login")} />
  );
}

function VerifyEmailWrapper() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  return (
    <VerifyEmail token={token} onNavigateToLogin={() => navigate("/login")} />
  );
}

export default function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      {/* ── Auth ── */}
      <Route
        path="/login"
        element={
          <Login
            onLoginSuccess={() => navigate("/dashboard")}
            onNavigateToRegister={() => navigate("/register")}
            onNavigateToForgotPassword={() => navigate("/forgot-password")}
          />
        }
      />
      <Route
        path="/register"
        element={
          <Register
            onRegisterSuccess={() => {
              toast.success("Registration successful — check your email.", {
                icon: <CheckCircle2 className="text-emerald-400" />,
              });
            }}
            onNavigateToLogin={() => navigate("/login")}
          />
        }
      />
      <Route
        path="/forgot-password"
        element={
          <ForgotPassword onNavigateToLogin={() => navigate("/login")} />
        }
      />
      <Route path="/reset-password/:token" element={<ResetPasswordWrapper />} />
      <Route path="/verify-email/:token" element={<VerifyEmailWrapper />} />

      {/* ── Dashboard ── */}
      <Route path="/dashboard" element={<DashboardPage />} />

      {/* ── Poll Management ── */}
      <Route path="/dashboard/polls/create" element={<CreatePollPage />} />
      <Route
        path="/dashboard/polls/:pollId/analytics"
        element={<PollAnalyticsPage />}
      />

      {/* ── Public Routes ── */}
      <Route path="/poll/:token" element={<PublicPollForm />} />
      <Route path="/poll/:token/results" element={<PublicPollResults />} />
      {/* ── Default ── */}
      <Route
        path="*"
        element={
          <Login
            onLoginSuccess={() => navigate("/dashboard")}
            onNavigateToRegister={() => navigate("/register")}
            onNavigateToForgotPassword={() => navigate("/forgot-password")}
          />
        }
      />
    </Routes>
  );
}

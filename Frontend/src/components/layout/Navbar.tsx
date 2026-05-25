import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { Loader2, ArrowRight, LayoutDashboard, PlusCircle } from "lucide-react";
import useLogout from "../../pages/auth/Logout";
import Button from "../pollpulse/Button";

interface NavbarUser {
  name?: string;
  email?: string;
}

interface NavbarProps {
  user?: NavbarUser;
  publicLinks?: Array<{
    label: string;
    href: string;
  }>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const ACCESS_TOKEN_KEY = "accessToken";

export function PollPulseLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="8" fill="#6366f1" />
      <path
        d="M8 20h2.5v-8H8v8zm4.5 0h2.5v-11h-2.5v11zm4.5 0h2.5v-5h-2.5v5zm4.5 0H24v-9h-2.5v9z"
        fill="white"
      />
      <circle cx="23" cy="9" r="3" fill="white" fillOpacity="0.3" />
    </svg>
  );
}

async function fetchCurrentUserWithRefresh(): Promise<NavbarUser | null> {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!accessToken) return null;

  const getMe = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/getme`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(String(response.status));
    }

    const body = (await response.json()) as {
      status?: boolean;
      data?: NavbarUser;
    };

    if (!body?.status || !body?.data) {
      return null;
    }

    return body.data;
  };

  try {
    return await getMe(accessToken);
  } catch {
    const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!refreshRes.ok) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      return null;
    }

    const refreshBody = (await refreshRes.json()) as {
      data?: { accessToken?: string };
      accessToken?: string;
    };

    const nextAccessToken =
      refreshBody?.data?.accessToken || refreshBody?.accessToken;

    if (!nextAccessToken) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      return null;
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, nextAccessToken);

    try {
      return await getMe(nextAccessToken);
    } catch {
      return null;
    }
  }
}

export default function Navbar({ user, publicLinks = [] }: NavbarProps) {
  const [sessionUser, setSessionUser] = useState<NavbarUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const location = useLocation();
  const { handleLogout, isLoggingOut } = useLogout();

  useEffect(() => {
    let active = true;

    if (user?.email) {
      setSessionUser(user);
      setIsCheckingSession(false);
      return () => {
        active = false;
      };
    }

    const run = async () => {
      try {
        const result = await fetchCurrentUserWithRefresh();
        if (!active) return;
        setSessionUser(result);
      } finally {
        if (active) setIsCheckingSession(false);
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [user]);

  const currentUser = useMemo(() => user || sessionUser, [user, sessionUser]);
  const isLoggedIn = Boolean(currentUser?.email);
  const displayName = currentUser?.name?.trim() || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <nav className="sticky top-0 z-50 border-b border-[#1a1a1a]/80 backdrop-blur-xl bg-[#0a0a0a]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <PollPulseLogo size={28} />
            <span className="text-lg font-bold tracking-tight text-white">PollPulse</span>
          </Link>

          {!isLoggedIn && publicLinks.length > 0 && (
            <div className="hidden md:flex items-center gap-6">
              {publicLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm text-[#71717a] hover:text-white transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors hidden sm:block ${
                    location.pathname.startsWith("/dashboard")
                      ? "text-white"
                      : "text-[#a1a1aa] hover:text-white"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <LayoutDashboard size={14} />
                    Dashboard
                  </span>
                </Link>

                <Link to="/dashboard/polls/create" className="hidden sm:block">
                  <Button size="sm" className="gap-1.5">
                    <PlusCircle size={14} />
                    Create Poll
                  </Button>
                </Link>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#6366f1]/20 border border-[#6366f1]/30 flex items-center justify-center">
                    <span className="text-sm font-semibold text-[#818cf8]">{initial}</span>
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-white leading-none">{displayName}</p>
                    {currentUser?.email && (
                      <p className="text-xs text-[#a1a1aa] mt-0.5">{currentUser.email}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="p-2 rounded-lg text-[#a1a1aa] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 border border-transparent hover:border-red-500/20 disabled:opacity-50"
                  title="Logout"
                >
                  {isLoggingOut ? (
                    <Loader2 size={18} className="animate-spin text-red-400" />
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  )}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-[#a1a1aa] hover:text-white transition-colors hidden sm:block"
                >
                  Sign in
                </Link>
                <Link to="/register" className="inline-flex">
                  <Button size="sm" className="gap-1.5" disabled={isCheckingSession}>
                    {isCheckingSession ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <>
                        Get started free
                        <ArrowRight size={13} />
                      </>
                    )}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

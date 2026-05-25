/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
// import React from "react";
import { toast } from "sonner";

// Custom SVGs for different error scenarios
const AuthErrorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const NetworkErrorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
    <line x1="2" x2="22" y1="2" y2="22" />
    <path d="M8.5 16.5a5 5 0 0 1 7 0" />
    <path d="M2 8.82a15 15 0 0 1 4.17-2.65" />
    <path d="M10.66 5c4.01-.36 8.14.9 11.34 3.82" />
  </svg>
);

const ServerErrorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

export function getUserFriendlyError(err: unknown): string {
  const message = err instanceof Error ? err.message : "";
  const normalized = message.toLowerCase();

  if (
    normalized.includes("network") ||
    normalized.includes("failed to fetch")
  ) {
    return "We couldn't connect right now. Please check your internet and try again.";
  }

  if (
    normalized.includes("unauthorized") ||
    normalized.includes("forbidden") ||
    normalized.includes("401") ||
    normalized.includes("403") ||
    normalized.includes("invalid token") ||
    normalized.includes("not authenticated")
  ) {
    return "Your session is not active. Please sign in again to view your dashboard.";
  }

  if (normalized.includes("not found")) {
    return "We couldn't find your dashboard data yet.";
  }

  return "Something went wrong. Please try again.";
}

/**
 * Global Single-Gate Error Handler
 * Triggers targeted sonner notifications based on the environment
 */
export function handleGlobalError(error: any) {
  const isDev = import.meta.env.NODE_ENV;
  const normalizedMsg = error instanceof Error ? error.message.toLowerCase() : "";
  const statusCode = error?.response?.status;
  const backendMessage = error?.response?.data?.message || error?.message || "Unknown error";

  const friendlyMessage = getUserFriendlyError(error);
  let ErrorIcon = ServerErrorIcon;

  // Determine the best icon based on the error type
  if (statusCode === 403 || normalizedMsg.includes("unauthorized")) {
    ErrorIcon = AuthErrorIcon;
  } else if (!error.response && error.request) {
    ErrorIcon = NetworkErrorIcon;
  }

  if (isDev) {
    // Developer Mode: Highly detailed, technical trace toast
    toast("🔧 Development Error Details", {
      description: (
        <div className="flex flex-col gap-2 mt-2 text-sm w-full">
          <div className="flex flex-col bg-background p-2 rounded border border-border shadow-sm">
            <span className="font-semibold text-destructive">HTTP Status: {statusCode || "N/A"}</span>
            <span className="font-mono text-xs mt-1 text-muted-foreground break-words">{backendMessage}</span>
          </div>
          {error?.config?.url && (
            <div className="text-xs font-mono text-muted-foreground bg-background p-2 rounded border border-border shadow-sm break-all">
              <span className="font-semibold text-foreground/70">Endpoint:</span> {error.config.url}
            </div>
          )}
        </div>
      ),
      icon: <ErrorIcon />,
      duration: 10000, // Stays longer for devs to read
      className: "border-destructive/30 bg-destructive/10 backdrop-blur-md", // Distinct dev styling
    });
  } else {
    // Production Mode: Clean, aesthetic, user-friendly toast
    toast.error("Action Failed", {
      description: friendlyMessage,
      icon: <ErrorIcon />,
      duration: 4000,
    });
  }
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { handleGlobalError } from "./error-handler";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Simple token helpers using localStorage
const ACCESS_TOKEN_KEY = "accessToken";
function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}
function setAccessToken(token: string | null) {
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
  else localStorage.removeItem(ACCESS_TOKEN_KEY);
}

// Attach access token to outgoing requests
apiClient.interceptors.request.use((config) => {
  // Think of `config` as the `req` object. We intercept it right before it leaves the browser!
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Use a plain axios instance for the refresh route so interceptors won't loop infinitely
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.status === false) {
      const error = new Error(response.data.message || "Request failed");
      (error as any).response = response; // Attach response data so our global handler can read it
      const suppressGlobalError = Boolean(
        (response.config as any)?.suppressGlobalErrorHandler,
      );
      const status = response.status;
      if (!suppressGlobalError && (!status || status >= 500)) {
        handleGlobalError(error);
      }
      return Promise.reject(error);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const suppressGlobalError = Boolean(
      error?.config?.suppressGlobalErrorHandler,
    );

    // If 401 Unauthorized, and we haven't already retried this request
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark as retried to prevent infinite loops

      try {
        // 1. Ask backend for a new token (bypasses interceptors)
        const res = await refreshClient.post("/api/auth/refresh-token");
        const newAccessToken =
          res.data?.data?.accessToken || res.data?.accessToken;

        if (typeof newAccessToken === "string") {
          // 2. Save the new tokens to localStorage
          setAccessToken(newAccessToken);
          // 3. Update the original request's header with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // 4. Retry the original request!
        return apiClient(originalRequest);
      } catch (refreshErr) {
        // If the refresh request failed, wipe token and reject
        setAccessToken(null);
        if (!suppressGlobalError) {
          handleGlobalError(refreshErr);
        }

        // Redirect the user back to the login page to re-authenticate
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      }
    }

    // Show fallback global toast only for network/server failures.
    // 4xx errors are expected to be handled by page-level UX.
    if (!suppressGlobalError && (!status || status >= 500)) {
      handleGlobalError(error);
    }
    const message =
      error.response?.data?.message || error.message || "Request failed";
    return Promise.reject(new Error(message));
  },
);

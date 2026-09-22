import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") return "/api/v1";
  return "http://localhost:3000/api/v1";
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 45000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor: attach auth token ──────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    let token = useAuthStore.getState().token;
    if (!token && typeof window !== "undefined") {
      token = localStorage.getItem("ventureroot_token");
      if (!token) {
        try {
          const authStorage = localStorage.getItem("ventureroot_auth_storage");
          if (authStorage) {
            const parsed = JSON.parse(authStorage);
            token = parsed?.state?.token;
          }
        } catch (_) {}
      }
    }

    // Prevent token leakage: only attach to relative paths or the configured baseURL
    const isRelativeUrl =
      !config.url?.startsWith("http://") && !config.url?.startsWith("https://");
    const isApiUrl = config.url?.startsWith(config.baseURL || "");

    if (token && (isRelativeUrl || isApiUrl)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Safely resolves a user-facing error message.
 * Principle: Never display raw backend error messages or unhandled server dumps to users by default.
 * Technical error details are preserved for development logging.
 */
function resolveUserSafeErrorMessage(error: any): string {
  const status = error?.response?.status;
  const rawMessage = error?.response?.data?.message || error?.message;

  // Preserve technical details for development logging
  if (process.env.NODE_ENV === "development") {
    console.warn("[apiClient] Technical error response:", {
      status,
      url: error?.config?.url,
      rawMessage,
      data: error?.response?.data,
    });
  }

  // Network or timeout errors (no response from server)
  if (!error?.response) {
    if (error?.code === "ECONNABORTED" || (typeof error?.message === "string" && error.message.includes("timeout"))) {
      return "Request timed out. Please check your connection and try again.";
    }
    return "Unable to connect to the server. Please check your network connection.";
  }

  // 5xx Server Errors: Always return controlled generic messages, never backend internals
  if (status >= 500) {
    if (status === 503) {
      return "The service is temporarily unavailable. Please try again later.";
    }
    if (status === 504 || status === 502) {
      return "The server took too long to respond. Please try again later.";
    }
    return "A server error occurred. Please try again or contact support.";
  }

  // 4xx Client Errors: Handled with controlled messages
  if (status === 401) {
    return "Your session has expired or you are not authorized. Please log in again.";
  }
  if (status === 403) {
    return "You do not have permission to perform this action.";
  }
  if (status === 404) {
    return "The requested resource was not found.";
  }
  if (status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }

  // For 400/422 validation or business errors:
  // Only display if it is a concise, well-formed user string (no stack traces, paths, or code blocks)
  if (typeof rawMessage === "string" && rawMessage.trim().length > 0) {
    const trimmed = rawMessage.trim();
    const hasUnsafePatterns =
      trimmed.includes("\n") ||
      trimmed.length > 200 ||
      /(\/|\\)[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/.test(trimmed) || // file paths
      /at\s+[a-zA-Z0-9_.]+\s+\(/.test(trimmed); // stack traces

    if (!hasUnsafePatterns) {
      return trimmed;
    }
  }

  return "Invalid request. Please check your inputs.";
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest?.url?.includes("/auth/login") || originalRequest?.url?.includes("/auth/register");

    // Auto-logout on 401 for authenticated endpoints
    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      useAuthStore.getState().logout();
    }

    // Normalize Error with controlled user-safe message for UI safety
    const normalizedError: ApiError = {
      message: resolveUserSafeErrorMessage(error),
      code: error.response?.data?.error_code || "UNKNOWN",
      details: error.response?.data?.errors,
    };

    return Promise.reject(normalizedError);
  },
);

export default apiClient;

import { logInfo, logError, logWarn } from "@/lib/logger";
import { handleError } from "@/utils/error-handler";

export function getRequestId(request) {
  const existingRequestId = request?.headers?.get?.("x-request-id");
  if (existingRequestId) {
    return existingRequestId;
  }
  return crypto.randomUUID();
}

export function startRequestTimer() {
  return performance.now();
}

export function getRequestDuration(startTime) {
  return Math.round(performance.now() - startTime);
}

export function logRequestStart({ requestId, request }) {
  const url = new URL(request.url);
  logInfo("Request started", {
    requestId,
    method: request.method,
    path: url.pathname,
  });
}

export function logRequestComplete({ requestId, request, status, durationMs }) {
  const url = new URL(request.url);
  const context = {
    requestId,
    method: request.method,
    path: url.pathname,
    status,
    durationMs,
  };

  if (durationMs >= 2000) {
    logWarn("Slow request completed", context);
    return;
  }

  logInfo("Request completed", context);
}

export function logRequestError({ requestId, request, error, durationMs }) {
  const url = new URL(request.url);
  logError("Request failed", {
    requestId,
    method: request.method,
    path: url.pathname,
    durationMs,
    errorName: error?.name ?? "UnknownError",
    errorMessage: error?.message ?? "Unknown error",
    errorCode: error?.errorCode ?? error?.code ?? null,
    stack: process.env.NODE_ENV === "production" ? undefined : error?.stack,
  });
}

export function withRequestLogging(handler) {
  return async function loggedHandler(request, context) {
    const requestId = getRequestId(request);
    const startTime = startRequestTimer();

    logRequestStart({
      requestId,
      request,
    });

    try {
      const response = await handler(request, context, {
        requestId,
      });

      logRequestComplete({
        requestId,
        request,
        status: response?.status ?? 200,
        durationMs: getRequestDuration(startTime),
      });

      return response;
    } catch (error) {
      logRequestError({
        requestId,
        request,
        error,
        durationMs: getRequestDuration(startTime),
      });

      return handleError(error);
    }
  };
}
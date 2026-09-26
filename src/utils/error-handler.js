import { AppError } from "@/errors/AppError";
import { ZodError } from "zod";

export function errorResponse({
  message = "Something went wrong",
  errorCode = "INTERNAL_ERROR",
  errors = null,
  status = 500,
  requestId = null,
}) {
  const headers = {};
  if (requestId) {
    headers["X-Request-ID"] = requestId;
  }

  return Response.json(
    {
      success: false,
      message,
      error_code: errorCode,
      errors,
      data: null,
    },
    { status, headers }
  );
}

export function handleError(error, requestId = null) {
  // Zod validation error
  if (error instanceof ZodError) {
    return errorResponse({
      message: "Validation failed",
      errorCode: "VALIDATION_ERROR",
      errors: error.flatten().fieldErrors,
      status: 400,
      requestId,
    });
  }

  // Known / custom application error
  if (error instanceof AppError) {
    return errorResponse({
      message: error.message,
      errorCode: error.errorCode,
      status: error.statusCode,
      requestId,
    });
  }

  // Unknown / unexpected error
  console.error(error);

  return errorResponse({
    message: "Internal server error",
    errorCode: "INTERNAL_ERROR",
    status: 500,
    requestId,
  });
}
export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "BAD_REQUEST"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(status: number, message: string, code: ErrorCode, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static unauthorized(message = "Unauthorized") {
    return new AppError(401, message, "UNAUTHORIZED");
  }

  static forbidden(message = "Forbidden") {
    return new AppError(403, message, "FORBIDDEN");
  }

  static notFound(message = "Not found") {
    return new AppError(404, message, "NOT_FOUND");
  }

  static conflict(message: string) {
    return new AppError(409, message, "CONFLICT");
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, message, "BAD_REQUEST", details);
  }

  static validation(message = "Validation error", details?: unknown) {
    return new AppError(400, message, "VALIDATION_ERROR", details);
  }

  static rateLimited(message = "Too many requests. Please try again later.") {
    return new AppError(429, message, "RATE_LIMITED");
  }
}

import { ErrorRequestHandler } from "express";
import { ApiError } from "../utils/ApiError";
import { logger } from "../config/logger";
import { fail } from "../utils/response";
import { env } from "../config/env";

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  let apiError: ApiError;

  if (err instanceof ApiError) {
    apiError = err;
  } else {
    apiError = new ApiError(500, "Internal server error", false);
  }

  logger.error("Request error", {
    path: req.path,
    method: req.method,
    message: (err as any)?.message || apiError.message,
    stack: (err as any)?.stack,
  });

  const response: any = {
    message: apiError.message,
  };

  if (env.nodeEnv === "development" && !(err instanceof ApiError)) {
    response.stack = (err as any)?.stack;
  }

  fail(res, apiError.statusCode, response.message, response.stack);
};


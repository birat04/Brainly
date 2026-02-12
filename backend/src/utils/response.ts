import { Response } from "express";

export function success<T>(res: Response, data: T, statusCode = 200): Response {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

export function fail(
  res: Response,
  statusCode: number,
  message: string,
  details?: unknown
): Response {
  return res.status(statusCode).json({
    success: false,
    error: { message, details },
  });
}


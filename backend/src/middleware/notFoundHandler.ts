import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
}


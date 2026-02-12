import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

interface JWTPayload {
  id: string;
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authorization header missing or invalid"));
  }

  const token = header.substring(7);

  try {
    const decoded = jwt.verify(token, env.jwt.secret) as JWTPayload;
    (req as any).userId = decoded.id;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return next(new ApiError(401, "Token expired"));
    }
    return next(new ApiError(401, "Invalid token"));
  }
}


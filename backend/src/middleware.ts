import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_PASSWORD } from './config';

interface JWTPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      userId: number;
    }
  }
}

export const userMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    res.status(401).json({ message: "Authorization header missing" });
    return;
  }

  const token = authHeader.startsWith("Bearer ") 
    ? authHeader.slice(7) 
    : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_PASSWORD) as JWTPayload;
    req.userId = Number(decoded.id);
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      res.status(401).json({ message: "Token expired" });
      return;
    }
    res.status(401).json({ message: "Invalid or missing token" });
    return;
  }
};

import {NextFunction,Request,Response} from 'express';
import jwt from 'jsonwebtoken';
import {JWT_PASSWORD} from './config';

interface JWTPayLoad{
    id:string;
}

declare global{
    namespace Express{
        interface Request{
            userId:string;
        }
    }
}
export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    
    if (!authHeader) {
      return res.status(401).json({
        message: "You are not logged in"
      });
    }
  
    const token = authHeader.startsWith("Bearer ") 
      ? authHeader.slice(7) 
      : authHeader;
    
    try {
      const decoded = jwt.verify(token, JWT_PASSWORD) as JWTPayLoad;
      req.userId = decoded.id;
      next();
    } catch (error) {
      return res.status(401).json({
        message: "You are not logged in"
      });
    }
  }
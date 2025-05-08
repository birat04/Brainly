import {NextFunction,Request,Response} from 'express';
import jwt from 'jsonwebtoken';
export const userMiddleware = (req:Request,res:Response,next:NextFunction) =>{
    const headers = req.headers["authorization"];
    const decoded = jwt.verify
}
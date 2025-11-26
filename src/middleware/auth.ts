import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
    userId?: string;
}

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            throw new AppError('Authentication required', 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
        req.userId = decoded.userId;

        next();
    } catch (error) {
        next(new AppError('Invalid or expired token', 401));
    }
};

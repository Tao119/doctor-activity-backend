import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { body, validationResult } from 'express-validator';

export const registerValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').trim().notEmpty(),
];

export const loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
];

export class AuthController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new AppError('Validation failed', 400);
            }

            const { email, password, name, specialty, hospitalName, licenseNumber } = req.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new AppError('Email already registered', 409);
            }

            const user = await User.create({
                email,
                password,
                name,
                specialty,
                hospitalName,
                licenseNumber,
            });

            const token = jwt.sign(
                { userId: user._id.toString() },
                process.env.JWT_SECRET || 'secret'
            );

            res.status(201).json({
                status: 'success',
                data: {
                    token,
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        specialty: user.specialty,
                    },
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new AppError('Validation failed', 400);
            }

            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user || !(await user.comparePassword(password))) {
                throw new AppError('Invalid credentials', 401);
            }

            const token = jwt.sign(
                { userId: user._id.toString() },
                process.env.JWT_SECRET || 'secret'
            );

            res.json({
                status: 'success',
                data: {
                    token,
                    user: {
                        id: user._id,
                        email: user.email,
                        name: user.name,
                        specialty: user.specialty,
                    },
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req: Request & { userId?: string }, res: Response, next: NextFunction) {
        try {
            const user = await User.findById(req.userId).select('-password');
            if (!user) {
                throw new AppError('User not found', 404);
            }

            res.json({
                status: 'success',
                data: { user },
            });
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();

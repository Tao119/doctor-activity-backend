import { Response, NextFunction } from 'express';
import { Quiz } from '../models/Quiz';
import { QuizResult } from '../models/QuizResult';
import { PatientRecord } from '../models/PatientRecord';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { openAIService } from '../services/openai.service';
import { body, validationResult } from 'express-validator';

export const submitQuizValidation = [
    body('answers').isArray(),
    body('timeSpent').isNumeric(),
];

export class QuizController {
    async generateQuiz(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { recordIds, difficulty = 'medium' } = req.body;

            if (!recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
                throw new AppError('Record IDs are required', 400);
            }

            const records = await PatientRecord.find({
                _id: { $in: recordIds },
                userId: req.userId,
            });

            if (records.length === 0) {
                throw new AppError('No records found', 404);
            }

            const generatedQuiz = await openAIService.generateQuizFromRecords(records, difficulty);

            const quiz = await Quiz.create({
                userId: req.userId,
                title: generatedQuiz.title,
                description: generatedQuiz.description,
                questions: generatedQuiz.questions,
                basedOnRecordIds: recordIds,
                difficulty: generatedQuiz.difficulty,
            });

            res.status(201).json({
                status: 'success',
                data: { quiz },
            });
        } catch (error) {
            next(error);
        }
    }

    async getQuizzes(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { page = 1, limit = 20 } = req.query;

            const skip = (Number(page) - 1) * Number(limit);

            const [quizzes, total] = await Promise.all([
                Quiz.find({ userId: req.userId })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(Number(limit)),
                Quiz.countDocuments({ userId: req.userId }),
            ]);

            res.json({
                status: 'success',
                data: {
                    quizzes,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total,
                        pages: Math.ceil(total / Number(limit)),
                    },
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async getQuizById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const quiz = await Quiz.findOne({
                _id: req.params.id,
                userId: req.userId,
            });

            if (!quiz) {
                throw new AppError('Quiz not found', 404);
            }

            // 正解を隠す（クイズ実施時）
            const quizData = quiz.toObject();
            if (req.query.hideAnswers === 'true') {
                quizData.questions = quizData.questions.map(q => ({
                    question: q.question,
                    options: q.options,
                    correctAnswer: -1,
                    explanation: '',
                }));
            }

            res.json({
                status: 'success',
                data: { quiz: quizData },
            });
        } catch (error) {
            next(error);
        }
    }

    async submitQuiz(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new AppError('Validation failed', 400);
            }

            const { answers, timeSpent } = req.body;
            const quizId = req.params.id;

            const quiz = await Quiz.findOne({
                _id: quizId,
                userId: req.userId,
            });

            if (!quiz) {
                throw new AppError('Quiz not found', 404);
            }

            // 採点
            const processedAnswers = answers.map((answer: any, index: number) => {
                const question = quiz.questions[index];
                return {
                    questionIndex: index,
                    selectedAnswer: answer.selectedAnswer,
                    isCorrect: answer.selectedAnswer === question.correctAnswer,
                    timeSpent: answer.timeSpent || 0,
                };
            });

            const correctCount = processedAnswers.filter((a: any) => a.isCorrect).length;
            const score = Math.round((correctCount / quiz.questions.length) * 100);

            const result = await QuizResult.create({
                userId: req.userId,
                quizId,
                answers: processedAnswers,
                score,
                totalQuestions: quiz.questions.length,
                timeSpent,
            });

            res.status(201).json({
                status: 'success',
                data: {
                    result,
                    correctAnswers: quiz.questions.map((q, i) => ({
                        questionIndex: i,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation,
                    })),
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async getQuizResults(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { page = 1, limit = 20 } = req.query;

            const skip = (Number(page) - 1) * Number(limit);

            const [results, total] = await Promise.all([
                QuizResult.find({ userId: req.userId })
                    .populate('quizId', 'title difficulty')
                    .sort({ completedAt: -1 })
                    .skip(skip)
                    .limit(Number(limit)),
                QuizResult.countDocuments({ userId: req.userId }),
            ]);

            res.json({
                status: 'success',
                data: {
                    results,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total,
                        pages: Math.ceil(total / Number(limit)),
                    },
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async getQuizStatistics(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const results = await QuizResult.find({ userId: req.userId });

            const totalQuizzes = results.length;
            const averageScore = totalQuizzes > 0
                ? results.reduce((sum, r) => sum + r.score, 0) / totalQuizzes
                : 0;

            const scoreDistribution = {
                excellent: results.filter(r => r.score >= 90).length,
                good: results.filter(r => r.score >= 70 && r.score < 90).length,
                fair: results.filter(r => r.score >= 50 && r.score < 70).length,
                poor: results.filter(r => r.score < 50).length,
            };

            res.json({
                status: 'success',
                data: {
                    totalQuizzes,
                    averageScore: Math.round(averageScore),
                    scoreDistribution,
                },
            });
        } catch (error) {
            next(error);
        }
    }
}

export const quizController = new QuizController();

import { Response, NextFunction } from 'express';
import { PatientRecord } from '../models/PatientRecord';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import { encrypt, maskPersonalInfo, generatePatientId } from '../utils/encryption';

export const createRecordValidation = [
    body('chiefComplaint').trim().notEmpty(),
    body('diagnosis').trim().notEmpty(),
    body('treatment').trim().notEmpty(),
];

export class RecordController {
    async createRecord(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new AppError('Validation failed', 400);
            }

            const {
                chiefComplaint,
                diagnosis,
                treatment,
                notes,
                medications,
                followUpRequired,
                followUpDate,
                tags,
            } = req.body;

            // 個人情報をマスキング
            const maskedNotes = notes ? maskPersonalInfo(notes) : '';

            // 機密データを暗号化
            const sensitiveData = JSON.stringify({
                originalNotes: notes,
                timestamp: new Date().toISOString(),
            });
            const encryptedData = encrypt(sensitiveData);

            const record = await PatientRecord.create({
                userId: req.userId,
                patientId: generatePatientId(),
                chiefComplaint,
                diagnosis,
                treatment,
                notes: maskedNotes,
                medications,
                followUpRequired,
                followUpDate,
                encryptedData,
                tags: tags || [],
            });

            res.status(201).json({
                status: 'success',
                data: { record },
            });
        } catch (error) {
            next(error);
        }
    }

    async getRecords(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { startDate, endDate, tags, page = 1, limit = 20 } = req.query;

            const query: any = { userId: req.userId };

            if (startDate || endDate) {
                query.date = {};
                if (startDate) query.date.$gte = new Date(startDate as string);
                if (endDate) query.date.$lte = new Date(endDate as string);
            }

            if (tags) {
                const tagArray = (tags as string).split(',');
                query.tags = { $in: tagArray };
            }

            const skip = (Number(page) - 1) * Number(limit);

            const [records, total] = await Promise.all([
                PatientRecord.find(query)
                    .sort({ date: -1 })
                    .skip(skip)
                    .limit(Number(limit))
                    .select('-encryptedData'),
                PatientRecord.countDocuments(query),
            ]);

            res.json({
                status: 'success',
                data: {
                    records,
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

    async getRecordById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const record = await PatientRecord.findOne({
                _id: req.params.id,
                userId: req.userId,
            });

            if (!record) {
                throw new AppError('Record not found', 404);
            }

            res.json({
                status: 'success',
                data: { record },
            });
        } catch (error) {
            next(error);
        }
    }

    async updateRecord(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const updates = req.body;

            if (updates.notes) {
                updates.notes = maskPersonalInfo(updates.notes);
            }

            const record = await PatientRecord.findOneAndUpdate(
                { _id: req.params.id, userId: req.userId },
                updates,
                { new: true, runValidators: true }
            );

            if (!record) {
                throw new AppError('Record not found', 404);
            }

            res.json({
                status: 'success',
                data: { record },
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteRecord(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const record = await PatientRecord.findOneAndDelete({
                _id: req.params.id,
                userId: req.userId,
            });

            if (!record) {
                throw new AppError('Record not found', 404);
            }

            res.json({
                status: 'success',
                message: 'Record deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getStatistics(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { startDate, endDate } = req.query;

            const query: any = { userId: req.userId };

            if (startDate || endDate) {
                query.date = {};
                if (startDate) query.date.$gte = new Date(startDate as string);
                if (endDate) query.date.$lte = new Date(endDate as string);
            }

            const [totalRecords, diagnosisStats, tagStats] = await Promise.all([
                PatientRecord.countDocuments(query),
                PatientRecord.aggregate([
                    { $match: query },
                    { $group: { _id: '$diagnosis', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 },
                ]),
                PatientRecord.aggregate([
                    { $match: query },
                    { $unwind: '$tags' },
                    { $group: { _id: '$tags', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 },
                ]),
            ]);

            res.json({
                status: 'success',
                data: {
                    totalRecords,
                    diagnosisStats,
                    tagStats,
                },
            });
        } catch (error) {
            next(error);
        }
    }
}

export const recordController = new RecordController();

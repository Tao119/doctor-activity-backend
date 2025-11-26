import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizAnswer {
    questionIndex: number;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
}

export interface IQuizResult extends Document {
    userId: mongoose.Types.ObjectId;
    quizId: mongoose.Types.ObjectId;
    answers: IQuizAnswer[];
    score: number;
    totalQuestions: number;
    completedAt: Date;
    timeSpent: number;
    createdAt: Date;
}

const quizAnswerSchema = new Schema<IQuizAnswer>({
    questionIndex: {
        type: Number,
        required: true,
    },
    selectedAnswer: {
        type: Number,
        required: true,
    },
    isCorrect: {
        type: Boolean,
        required: true,
    },
    timeSpent: {
        type: Number,
        default: 0,
    },
}, { _id: false });

const quizResultSchema = new Schema<IQuizResult>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        quizId: {
            type: Schema.Types.ObjectId,
            ref: 'Quiz',
            required: true,
            index: true,
        },
        answers: [quizAnswerSchema],
        score: {
            type: Number,
            required: true,
            min: 0,
        },
        totalQuestions: {
            type: Number,
            required: true,
        },
        completedAt: {
            type: Date,
            default: Date.now,
        },
        timeSpent: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

quizResultSchema.index({ userId: 1, completedAt: -1 });

export const QuizResult = mongoose.model<IQuizResult>('QuizResult', quizResultSchema);

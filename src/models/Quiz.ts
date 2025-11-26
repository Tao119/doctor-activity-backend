import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

export interface IQuiz extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    questions: IQuizQuestion[];
    basedOnRecordIds: mongoose.Types.ObjectId[];
    difficulty: 'easy' | 'medium' | 'hard';
    createdAt: Date;
    updatedAt: Date;
}

const quizQuestionSchema = new Schema<IQuizQuestion>({
    question: {
        type: String,
        required: true,
    },
    options: [{
        type: String,
        required: true,
    }],
    correctAnswer: {
        type: Number,
        required: true,
        min: 0,
    },
    explanation: {
        type: String,
        required: true,
    },
}, { _id: false });

const quizSchema = new Schema<IQuiz>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        questions: [quizQuestionSchema],
        basedOnRecordIds: [{
            type: Schema.Types.ObjectId,
            ref: 'PatientRecord',
        }],
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
        },
    },
    {
        timestamps: true,
    }
);

export const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface IPatientRecord extends Document {
    userId: mongoose.Types.ObjectId;
    patientId: string;
    date: Date;
    chiefComplaint: string;
    diagnosis: string;
    treatment: string;
    notes: string;
    medications?: string[];
    followUpRequired: boolean;
    followUpDate?: Date;
    encryptedData?: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const patientRecordSchema = new Schema<IPatientRecord>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        patientId: {
            type: String,
            required: true,
            index: true,
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
            index: true,
        },
        chiefComplaint: {
            type: String,
            required: true,
        },
        diagnosis: {
            type: String,
            required: true,
        },
        treatment: {
            type: String,
            required: true,
        },
        notes: {
            type: String,
            default: '',
        },
        medications: [{
            type: String,
        }],
        followUpRequired: {
            type: Boolean,
            default: false,
        },
        followUpDate: {
            type: Date,
        },
        encryptedData: {
            type: String,
        },
        tags: [{
            type: String,
            trim: true,
        }],
    },
    {
        timestamps: true,
    }
);

patientRecordSchema.index({ userId: 1, date: -1 });
patientRecordSchema.index({ userId: 1, tags: 1 });

export const PatientRecord = mongoose.model<IPatientRecord>('PatientRecord', patientRecordSchema);

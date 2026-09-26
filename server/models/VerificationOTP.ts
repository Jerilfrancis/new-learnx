import mongoose, { Schema, Document } from 'mongoose';

export interface IVerificationOTP extends Document {
  email: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationOTPSchema: Schema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: '10m' } },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const VerificationOTP = mongoose.model<IVerificationOTP>('VerificationOTP', VerificationOTPSchema);

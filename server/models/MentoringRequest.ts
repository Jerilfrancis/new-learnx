import mongoose, { Schema, Document } from 'mongoose';

export interface IMentoringRequest extends Document {
  slotId: mongoose.Types.ObjectId | string;
  studentId: mongoose.Types.ObjectId | string;
  mentorId: mongoose.Types.ObjectId | string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  createdAt: Date;
}

const MentoringRequestSchema: Schema = new Schema({
  slotId: { type: Schema.Types.ObjectId, ref: 'MentoringSlot', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export const MentoringRequest = mongoose.model<IMentoringRequest>('MentoringRequest', MentoringRequestSchema);

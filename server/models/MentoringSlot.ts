import mongoose, { Schema, Document } from 'mongoose';

export interface IMentoringSlot extends Document {
  mentorId: mongoose.Types.ObjectId | string;
  topic: string;
  dateTime: Date;
  durationMinutes: number;
  price: number;
  isBooked: boolean;
  createdAt: Date;
}

const MentoringSlotSchema: Schema = new Schema({
  mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  dateTime: { type: Date, required: true },
  durationMinutes: { type: Number, default: 45 },
  price: { type: Number, default: 0 },
  isBooked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const MentoringSlot = mongoose.model<IMentoringSlot>('MentoringSlot', MentoringSlotSchema);

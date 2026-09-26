import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkshop extends Document {
  freelancerId: mongoose.Types.ObjectId | string;
  title: string;
  description: string;
  thumbnail?: string;
  date: Date;
  time: string;
  duration: string;
  price: number;
  participantLimit: number;
  enrolledCount: number;
  createdAt: Date;
}

const WorkshopSchema: Schema = new Schema({
  freelancerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String },
  date: { type: Date, required: true },
  time: { type: String, default: '18:00 IST' },
  duration: { type: String, default: '2 hours' },
  price: { type: Number, default: 0 },
  participantLimit: { type: Number, default: 50 },
  enrolledCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const Workshop = mongoose.model<IWorkshop>('Workshop', WorkshopSchema);

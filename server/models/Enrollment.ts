// server/models/Enrollment.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  courseId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  progress: number;
  completedLessons: string[];
  completed: boolean;
  completedAt?: Date;
  enrolledAt: Date;
}

const EnrollmentSchema: Schema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    progress: { type: Number, default: 0 },
    completedLessons: [{ type: String }],
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    enrolledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);

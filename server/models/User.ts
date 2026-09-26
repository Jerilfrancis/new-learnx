// server/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'STUDENT' | 'COURSE_EDUCATOR' | 'FREELANCER' | 'DISTRIBUTOR' | 'ADMIN' | 'CREATOR' | 'MENTOR' | 'RECRUITER';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  handle: string;
  role: UserRole;
  avatar: string;
  bio: string;
  totalXp: number;
  xp: number;
  streak: number;
  level: number;
  isBanned: boolean;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  skills: string[];
  badges: string[];
  createdCoursesCount: number;
  completedCoursesCount: number;
  followersCount: number;
  followingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    handle: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ['STUDENT', 'COURSE_EDUCATOR', 'FREELANCER', 'DISTRIBUTOR', 'ADMIN', 'CREATOR', 'MENTOR', 'RECRUITER'],
      default: 'STUDENT',
    },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    totalXp: { type: Number, default: 100 },
    xp: { type: Number, default: 100 },
    streak: { type: Number, default: 1 },
    level: { type: Number, default: 1 },
    isBanned: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    onboardingCompleted: { type: Boolean, default: false },
    skills: [{ type: String }],
    badges: [{ type: String }],
    createdCoursesCount: { type: Number, default: 0 },
    completedCoursesCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);

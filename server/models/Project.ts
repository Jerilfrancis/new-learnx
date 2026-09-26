// server/models/Project.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
  projectId: mongoose.Types.ObjectId;
  authorId?: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected' | 'changes_requested';
  feedback?: string;
  attachments?: string[];
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  githubUrl: string;
  demoUrl: string;
  description: string;
  upvotes: number;
  upvotedBy: mongoose.Types.ObjectId[];
  ciScore: number;
  submittedAt: Date;
}

const SubmissionSchema: Schema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'changes_requested'], default: 'pending' },
    feedback: { type: String, default: '' },
    attachments: [{ type: String }],
    authorName: { type: String, required: true },
    authorAvatar: { type: String },
    authorRole: { type: String, default: 'STUDENT' },
    githubUrl: { type: String, default: '' },
    demoUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    ciScore: { type: Number, default: 95 },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);

export interface IProject extends Document {
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  creatorId?: mongoose.Types.ObjectId;
  deadline?: Date;
  maxTeamSize: number;
  rewardXp: number;
  repositoryUrl?: string;
  starsCount: number;
  submissionsCount: number;
  specs: string[];
  starterTemplateUrl?: string;
  bannerImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'Full Stack' },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
    tags: [{ type: String }],
    creatorId: { type: Schema.Types.ObjectId, ref: 'User' },
    deadline: { type: Date },
    maxTeamSize: { type: Number, default: 4, min: 1 },
    rewardXp: { type: Number, default: 500, min: 0 },
    repositoryUrl: { type: String, default: '' },
    starsCount: { type: Number, default: 0 },
    submissionsCount: { type: Number, default: 0 },
    specs: [{ type: String }],
    starterTemplateUrl: { type: String },
    bannerImage: { type: String },
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>('Project', ProjectSchema);

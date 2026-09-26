import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectSubmission extends Document {
  projectId: mongoose.Types.ObjectId | string;
  studentId: mongoose.Types.ObjectId | string;
  distributorId: mongoose.Types.ObjectId | string;
  githubUrl?: string;
  liveUrl?: string;
  notes?: string;
  attachments?: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'changes_requested';
  feedback?: string;
  submittedAt: Date;
  updatedAt: Date;
}

const ProjectSubmissionSchema: Schema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  distributorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  githubUrl: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  notes: { type: String, default: '' },
  attachments: [{ type: String }],
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'changes_requested'], default: 'pending' },
  feedback: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const ProjectSubmission = mongoose.model<IProjectSubmission>('ProjectSubmission', ProjectSubmissionSchema);

// server/models/CodeBounty.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISolution {
  id: string;
  solverId: string;
  solverName: string;
  solverAvatar: string;
  reviewText: string;
  codeSolution?: string;
  createdAt: Date;
  isAccepted: boolean;
}

export interface ICodeBounty extends Document {
  title: string;
  description: string;
  codeSnippet: string;
  language: string;
  bountyXp: number;
  authorId: mongoose.Types.ObjectId | string;
  authorName: string;
  authorAvatar: string;
  status: 'open' | 'solved';
  solutions: ISolution[];
  createdAt: Date;
}

const SolutionSchema: Schema = new Schema(
  {
    id: { type: String, required: true },
    solverId: { type: String, required: true },
    solverName: { type: String, required: true },
    solverAvatar: { type: String },
    reviewText: { type: String, required: true },
    codeSolution: { type: String },
    isAccepted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CodeBountySchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    codeSnippet: { type: String, required: true },
    language: { type: String, default: 'typescript' },
    bountyXp: { type: Number, default: 100 },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    authorAvatar: { type: String },
    status: { type: String, enum: ['open', 'solved'], default: 'open', index: true },
    solutions: [SolutionSchema],
  },
  { timestamps: true }
);

export const CodeBounty = mongoose.model<ICodeBounty>('CodeBounty', CodeBountySchema);

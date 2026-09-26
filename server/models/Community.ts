// server/models/Community.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunity extends Document {
  name: string;
  description: string;
  membersCount: number;
  members: mongoose.Types.ObjectId[];
  avatar: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CommunitySchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    membersCount: { type: Number, default: 0 },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    avatar: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export const Community = mongoose.model<ICommunity>('Community', CommunitySchema);

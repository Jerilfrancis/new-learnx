// server/models/LiveClass.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ILiveClass extends Document {
  title: string;
  description: string;
  hostName: string;
  hostTitle: string;
  hostAvatar: string;
  instructorId?: mongoose.Types.ObjectId;
  category: string;
  startTime: Date;
  duration: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  thumbnail: string;
  roomUrl?: string;
  viewersCount: number;
  rsvps: string[]; // User IDs who RSVPed
  tags: string[];
  createdAt: Date;
}

const LiveClassSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    hostName: { type: String, required: true },
    hostTitle: { type: String, default: 'Senior Tech Educator' },
    hostAvatar: { type: String },
    instructorId: { type: Schema.Types.ObjectId, ref: 'User' },
    category: { type: String, default: 'Web Development' },
    startTime: { type: Date, required: true },
    duration: { type: String, default: '60m' },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'ended', 'cancelled'],
      default: 'scheduled',
    },
    thumbnail: {
      type: String,
      default: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    },
    roomUrl: { type: String },
    viewersCount: { type: Number, default: 0 },
    rsvps: [{ type: String }],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export const LiveClass = mongoose.model<ILiveClass>('LiveClass', LiveClassSchema);

// server/models/XPEvent.ts
import mongoose, { Schema, Document } from 'mongoose';

export type XPActionType =
  | 'COURSE_COMPLETION'
  | 'QUIZ_PASS'
  | 'PROJECT_SUBMISSION'
  | 'DAILY_LOGIN'
  | 'POST_LIKE'
  | 'MENTORSHIP_SESSION'
  | 'COMMUNITY_POST';

export interface IXPEvent extends Document {
  userId: mongoose.Types.ObjectId | string;
  action: XPActionType;
  xp: number;
  referenceId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const XPEventSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: {
      type: String,
      enum: [
        'COURSE_COMPLETION',
        'QUIZ_PASS',
        'PROJECT_SUBMISSION',
        'DAILY_LOGIN',
        'POST_LIKE',
        'MENTORSHIP_SESSION',
        'COMMUNITY_POST',
      ],
      required: true,
    },
    xp: { type: Number, required: true },
    referenceId: { type: String, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Compound index to prevent duplicate awards for the same action on the same reference item
XPEventSchema.index({ userId: 1, action: 1, referenceId: 1 }, { unique: true, sparse: true });

export const XPEvent = mongoose.model<IXPEvent>('XPEvent', XPEventSchema);

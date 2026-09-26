// server/models/Post.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IComment {
  _id?: string;
  author: string;
  authorId?: mongoose.Types.ObjectId;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
}

export interface IPost extends Document {
  author: {
    id?: mongoose.Types.ObjectId;
    name: string;
    handle: string;
    role: string;
    avatar: string;
  };
  content: string;
  media: {
    mediaType: 'image' | 'video' | 'file';
    url: string;
    thumbnailUrl?: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  }[];
  codeSnippet?: string;
  codeLang?: string;
  pollData?: {
    question: string;
    options: { text: string; votes: number }[];
    totalVotes: number;
  };
  projectHighlight?: {
    title: string;
    description: string;
    demoUrl: string;
    githubUrl: string;
  };
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
  commentsCount: number;
  shares: number;
  savedBy: mongoose.Types.ObjectId[];
  commentsList: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema = new Schema(
  {
    author: {
      id: { type: Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, required: true },
      handle: { type: String, required: true },
      role: { type: String, default: 'STUDENT' },
      avatar: { type: String, default: '' },
    },
    content: { type: String, required: true },
    media: [
      {
        mediaType: { type: String, enum: ['image', 'video', 'file'], required: true },
        url: { type: String, required: true },
        thumbnailUrl: { type: String },
        fileName: { type: String, required: true },
        mimeType: { type: String, required: true },
        fileSize: { type: Number, required: true },
      },
    ],
    codeSnippet: { type: String },
    codeLang: { type: String },
    pollData: {
      question: { type: String },
      options: [
        {
          text: { type: String },
          votes: { type: Number, default: 0 },
        },
      ],
      totalVotes: { type: Number, default: 0 },
    },
    projectHighlight: {
      title: { type: String },
      description: { type: String },
      demoUrl: { type: String },
      githubUrl: { type: String },
    },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    commentsCount: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    savedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    commentsList: [
      {
        author: { type: String, required: true },
        authorId: { type: Schema.Types.ObjectId, ref: 'User' },
        avatar: { type: String },
        text: { type: String, required: true },
        timestamp: { type: String, default: 'Just now' },
        likes: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

export const Post = mongoose.model<IPost>('Post', PostSchema);

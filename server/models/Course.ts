// server/models/Course.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ILessonResource {
  id?: string;
  url: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  resourceType?: string;
  createdAt?: Date;
}

export interface IMCQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-3 index
  explanation: string;
}

export interface ILessonQuiz {
  id?: string;
  title: string;
  questions: IMCQuestion[];
  passingScore?: number;
}

export interface ILesson {
  id: string;
  title: string;
  description?: string;
  duration: string;
  type: 'video' | 'article' | 'quiz' | 'coding';
  videoUrl?: string;
  content?: string;
  resources?: ILessonResource[];
  quiz?: ILessonQuiz;
  order?: number;
  isFreePreview?: boolean;
  completed?: boolean;
}

export interface IModule {
  id: string;
  title: string;
  description?: string;
  order?: number;
  lessons: ILesson[];
}

export interface ICourse extends Document {
  title: string;
  description: string;
  category: string;
  level: string;
  language: string;
  duration: string;
  price: string;
  thumbnail: string;
  status: 'draft' | 'published' | 'unpublished' | 'archived';
  published: boolean;
  instructor: string;
  instructorId?: mongoose.Types.ObjectId;
  instructorRole: string;
  instructorAvatar: string;
  learningObjectives: string[];
  prerequisites: string[];
  tags: string[];
  curriculum: IModule[];
  rating: number;
  reviewsCount: number;
  studentsCount: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, required: true, default: 'Web Development' },
    level: { type: String, default: 'Intermediate' },
    language: { type: String, default: 'English' },
    duration: { type: String, default: '10 Hours' },
    price: { type: String, default: 'Free' },
    thumbnail: {
      type: String,
      default: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'unpublished', 'archived'],
      default: 'published',
    },
    published: { type: Boolean, default: true },
    instructor: { type: String, required: true },
    instructorId: { type: Schema.Types.ObjectId, ref: 'User' },
    instructorRole: { type: String, default: 'COURSE_EDUCATOR' },
    instructorAvatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    },
    learningObjectives: [{ type: String }],
    prerequisites: [{ type: String }],
    tags: [{ type: String }],
    curriculum: [
      {
        id: { type: String },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        order: { type: Number, default: 0 },
        lessons: [
          {
            id: { type: String },
            title: { type: String, required: true },
            description: { type: String, default: '' },
            duration: { type: String, default: '15m' },
            type: {
              type: String,
              enum: ['video', 'article', 'quiz', 'coding'],
              default: 'video',
            },
            videoUrl: { type: String, default: '' },
            content: { type: String, default: '' },
            order: { type: Number, default: 0 },
            isFreePreview: { type: Boolean, default: false },
            resources: [
              {
                id: { type: String },
                url: { type: String, required: true },
                fileName: { type: String, required: true },
                fileSize: { type: Number },
                mimeType: { type: String },
                resourceType: { type: String, default: 'pdf' },
                createdAt: { type: Date, default: Date.now },
              },
            ],
            quiz: {
              id: { type: String },
              title: { type: String },
              passingScore: { type: Number, default: 70 },
              questions: [
                {
                  id: { type: String },
                  question: { type: String, required: true },
                  options: [{ type: String, required: true }],
                  correctAnswer: { type: Number, required: true },
                  explanation: { type: String, default: '' },
                },
              ],
            },
          },
        ],
      },
    ],
    rating: { type: Number, default: 5.0 },
    reviewsCount: { type: Number, default: 12 },
    studentsCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Course = mongoose.model<ICourse>('Course', CourseSchema);

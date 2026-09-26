import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate extends Document {
  certificateId: string; // Unique string like "CI-CERT-XXXXX"
  studentId: mongoose.Types.ObjectId | string;
  studentName: string;
  courseId: mongoose.Types.ObjectId | string;
  courseTitle: string;
  instructorName: string;
  issueDate: Date;
  pdfUrl?: string;
  createdAt: Date;
}

const CertificateSchema: Schema = new Schema({
  certificateId: { type: String, required: true, unique: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  courseTitle: { type: String, required: true },
  instructorName: { type: String, required: true },
  issueDate: { type: Date, default: Date.now },
  pdfUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export const Certificate = mongoose.model<ICertificate>('Certificate', CertificateSchema);

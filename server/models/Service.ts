import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  freelancerId: mongoose.Types.ObjectId | string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  price: number;
  deliveryTime: string; // e.g. "3 days"
  portfolio?: string[];
  availability: boolean;
  rating: number;
  ordersCount: number;
  createdAt: Date;
}

const ServiceSchema: Schema = new Schema({
  freelancerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'Development' },
  skills: [{ type: String }],
  price: { type: Number, required: true },
  deliveryTime: { type: String, default: '3-5 days' },
  portfolio: [{ type: String }],
  availability: { type: Boolean, default: true },
  rating: { type: Number, default: 5.0 },
  ordersCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const Service = mongoose.model<IService>('Service', ServiceSchema);

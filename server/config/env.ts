// server/config/env.ts
import { config } from 'dotenv';
config();

// Export required env variables with default fallbacks where appropriate
export const PORT = process.env.PORT || 3000;
export const MONGODB_URI = process.env.MONGODB_URI || '';
export const LOCAL_MONGODB_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/code_infinite';
export const USE_LOCAL_MONGODB = process.env.USE_LOCAL_MONGODB === 'true';
export const MONGODB_DNS_SERVERS = (process.env.MONGODB_DNS_SERVERS || '8.8.8.8,1.1.1.1')
	.split(',')
	.map((server) => server.trim())
	.filter(Boolean);
export const JWT_SECRET = process.env.JWT_SECRET || '';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '';
export const CLIENT_URL = process.env.CLIENT_URL || '';
export const SERVER_URL = process.env.SERVER_URL || '';

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
export const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || '';

export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
export const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || '';

export const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || '';
export const EMAIL_FROM = process.env.EMAIL_FROM || '';
export const EMAIL_API_KEY = process.env.EMAIL_API_KEY || '';
export const GMAIL_USER = process.env.GMAIL_USER || '';
export const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';
export const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

export const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
export const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
export const LIVEKIT_URL = process.env.LIVEKIT_URL || '';
export const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || '';
export const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || '';
export const CLAMAV_HOST = process.env.CLAMAV_HOST || 'localhost';
export const CLAMAV_PORT = Number(process.env.CLAMAV_PORT || 3310);

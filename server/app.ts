// server/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { CLIENT_URL } from './config/env';
import { rateLimiter } from './middleware/rateLimiter';

import authRouter from './routes/auth';
import postsRouter from './routes/posts';
import coursesRouter from './routes/courses';
import projectsRouter from './routes/projects';
import communitiesRouter from './routes/communities';
import messagesRouter from './routes/messages';
import notificationsRouter from './routes/notifications';
import uploadRouter from './routes/upload';
import aiRouter from './routes/ai';
import freelancerRouter from './routes/freelancer';
import searchRouter from './routes/search';
import leaderboardRouter from './routes/leaderboard';
import dashboardRouter from './routes/dashboard';
import liveRouter from './routes/live';
import adminRouter from './routes/admin';
import codeRouter from './routes/code';
import bountiesRouter from './routes/bounties';

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: CLIENT_URL || '*', credentials: true }));
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for Vite dev mode compatibility
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));
app.use(rateLimiter);

// Static serving for local uploads
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(UPLOADS_DIR));

// Health check API
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'LearnX API', time: new Date().toISOString() });
});

// Register routes
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/communities', communitiesRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/ai', aiRouter);
app.use('/api/freelancer', freelancerRouter);
app.use('/api/search', searchRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/live', liveRouter);
app.use('/api/admin', adminRouter);
app.use('/api/code', codeRouter);
app.use('/api/bounties', bountiesRouter);

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

export default app;

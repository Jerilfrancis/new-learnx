// server/middleware/rateLimiter.ts
import { Request, Response, NextFunction } from 'express';

// In-memory rate limiter (10 requests per minute per IP)
const requestCounts: Map<string, { count: number; resetAt: number }> = new Map();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

// Endpoints that should be rate limited (auth-related)
const rateLimitedPaths = ['/api/auth/register', '/api/auth/login', '/api/auth/forgot-password', '/api/auth/reset-password'];

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  if (!rateLimitedPaths.some((p) => req.path.startsWith(p))) {
    return next();
  }

  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  entry.count += 1;

  if (entry.count > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again in 1 minute.',
    });
  }

  next();
};

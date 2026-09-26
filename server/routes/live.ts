// server/routes/live.ts
import { Router } from 'express';
import { getLiveClasses, createLiveClass, rsvpLiveClass, createLiveKitToken } from '../controllers/liveClassController';
import { optionalAuth, authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, getLiveClasses);
router.post('/', authenticateToken, createLiveClass);
router.post('/:id/rsvp', authenticateToken, rsvpLiveClass);
router.post('/:id/token', authenticateToken, createLiveKitToken);

export default router;

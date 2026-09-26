// server/routes/leaderboard.ts
import { Router } from 'express';
import { getLeaderboard, claimDailyXP } from '../controllers/leaderboardController';
import { optionalAuth, authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, getLeaderboard);
router.post('/claim-daily', authenticateToken, claimDailyXP);

export default router;

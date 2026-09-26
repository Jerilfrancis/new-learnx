// server/routes/communities.ts
import { Router } from 'express';
import { getCommunities, joinCommunity } from '../controllers/communityController';
import { optionalAuth, authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, getCommunities);
router.post('/:id/join', authenticateToken, joinCommunity);

export default router;

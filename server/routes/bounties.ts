// server/routes/bounties.ts
import { Router } from 'express';
import {
  getBounties,
  createBounty,
  submitSolution,
  acceptSolution,
} from '../controllers/bountyController';
import { optionalAuth, authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, getBounties);
router.post('/', authenticateToken, createBounty);
router.post('/:id/solutions', authenticateToken, submitSolution);
router.post('/:id/solutions/:solutionId/accept', authenticateToken, acceptSolution);

export default router;

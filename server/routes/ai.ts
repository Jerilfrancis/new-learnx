// server/routes/ai.ts
import { Router } from 'express';
import {
  generateMcqs,
  solveDoubt,
  generateRoadmap,
  generateQuiz,
  reviewProfile,
  conductInterviewTurn,
} from '../controllers/aiController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/generate-mcqs', optionalAuth, generateMcqs);
router.post('/solve-doubt', solveDoubt);
router.post('/generate-roadmap', generateRoadmap);
router.post('/generate-quiz', generateQuiz);
router.post('/review-profile', reviewProfile);
router.post('/interview-turn', optionalAuth, conductInterviewTurn);

export default router;

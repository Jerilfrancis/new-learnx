// server/routes/code.ts
import { Router } from 'express';
import { executeCode } from '../controllers/codeController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/execute', authenticateToken, executeCode);

export default router;

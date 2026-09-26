// server/routes/projects.ts
import { Router } from 'express';
import { getProjects, createProject, submitProject, getSubmissions, reviewSubmission } from '../controllers/projectController';
import { optionalAuth, authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, getProjects);
router.post('/', authenticateToken, requireRole('DISTRIBUTOR', 'COURSE_EDUCATOR', 'FREELANCER'), createProject);
router.post('/:id/submit', authenticateToken, submitProject);
router.get('/submissions', optionalAuth, getSubmissions);
router.patch('/submissions/:id/review', authenticateToken, requireRole('DISTRIBUTOR', 'COURSE_EDUCATOR'), reviewSubmission);

export default router;

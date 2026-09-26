import { Router } from 'express';
import {
  getServices,
  createService,
  deleteService,
  getWorkshops,
  createWorkshop,
  getMentoringSlots,
  createMentoringSlot,
  requestMentoring,
  updateMentoringRequestStatus,
  getMentors,
} from '../controllers/freelancerController';
import { authenticateToken, requireRole, optionalAuth } from '../middleware/auth';

const router = Router();

// Mentors
router.get('/mentors', getMentors);

// Services
router.get('/services', getServices);
router.post('/services', authenticateToken, requireRole('FREELANCER', 'EDUCATOR'), createService);
router.delete('/services/:id', authenticateToken, requireRole('FREELANCER', 'EDUCATOR'), deleteService);

// Workshops
router.get('/workshops', getWorkshops);
router.post('/workshops', authenticateToken, requireRole('FREELANCER', 'EDUCATOR'), createWorkshop);

// Mentoring Slots
router.get('/mentoring-slots', getMentoringSlots);
router.post('/mentoring-slots', authenticateToken, requireRole('FREELANCER', 'EDUCATOR'), createMentoringSlot);
router.post('/mentoring-requests', authenticateToken, requestMentoring);
router.patch('/mentoring-requests/:id', authenticateToken, updateMentoringRequestStatus);

export default router;

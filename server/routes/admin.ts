// server/routes/admin.ts
import { Router } from 'express';
import {
  getAdminStats,
  getAdminUsers,
  updateAdminUserRole,
  toggleBanUser,
} from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Protect all admin routes with authentication and ADMIN role check
router.use(authenticateToken);
router.use(requireRole('ADMIN'));

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.patch('/users/:id/role', updateAdminUserRole);
router.patch('/users/:id/ban', toggleBanUser);

export default router;

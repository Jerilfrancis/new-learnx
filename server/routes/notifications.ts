// server/routes/notifications.ts
import { Router } from 'express';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getNotifications);
router.post('/:id/read', authenticateToken, markNotificationRead);
router.post('/read-all', authenticateToken, markAllNotificationsRead);

export default router;

// server/routes/messages.ts
import { Router } from 'express';
import {
  getConversations,
  sendMessage,
  getNotifications,
  markNotificationRead,
} from '../controllers/messageController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/conversations', authenticateToken, getConversations);
router.post('/send', authenticateToken, sendMessage);

export default router;

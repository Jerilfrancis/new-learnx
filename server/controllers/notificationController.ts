import { Response, NextFunction } from 'express';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { isDbConnected, mockNotifications, mockUsers } from '../config/mockStore';
import { sendNotificationEmail } from '../services/notificationEmail';

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required.' });

    if (!isDbConnected()) {
      return res.json({ success: true, notifications: mockNotifications });
    }

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
    return res.json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!isDbConnected()) {
      const n = mockNotifications.find((n: any) => n._id === id || n.id === id);
      if (n) (n as any).read = true;
      return res.json({ success: true, message: 'Notification marked as read' });
    }

    const notification = await Notification.findOneAndUpdate({ _id: id, userId: req.user?.id }, { read: true });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
};

export const markAllNotificationsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required.' });

    if (!isDbConnected()) {
      mockNotifications.forEach((n: any) => (n.read = true));
      return res.json({ success: true, message: 'All notifications marked as read' });
    }

    await Notification.updateMany({ userId, read: false }, { read: true });
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

export const createNotification = async (
  recipientId: string,
  type: string,
  message: string,
  senderId?: string,
  link?: string
) => {
  try {
    const title = type.replace(/_/g, ' ');
    if (!isDbConnected()) {
      const n = { _id: 'notif_' + Date.now(), recipientId, type, message, senderId, read: false, createdAt: new Date() };
      mockNotifications.unshift(n as any);
      const recipient = mockUsers.find((user: any) => user._id === recipientId || user.id === recipientId);
      if (recipient?.email) await sendNotificationEmail(recipient.email, title, message);
      return;
    }
    await Notification.create({
      userId: recipientId,
      title,
      type: ['course', 'social', 'system', 'message', 'project'].includes(type) ? type : 'system',
      message,
      read: false,
      link,
    });
    const recipient = await User.findById(recipientId).select('email').lean();
    if (recipient?.email) await sendNotificationEmail(recipient.email, title, message);
  } catch (_) {
    // Silently fail — notification errors should not block main operations
  }
};

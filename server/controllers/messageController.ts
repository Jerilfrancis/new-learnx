// server/controllers/messageController.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { isDbConnected } from '../config/mockStore';
import { createNotification } from './notificationController';

// Dynamic model imports to avoid crash when DB is offline
const getModels = async () => {
  const { Conversation, Message } = await import('../models/Message');
  const { Notification } = await import('../models/Notification');
  return { Conversation, Message, Notification };
};

export const getConversations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, conversations: [] });
    }
    const { Conversation } = await getModels();
    const conversations = await Conversation.find({ participants: req.user?.id }).sort({ lastMessageTime: -1 }).limit(50);
    return res.json({ success: true, conversations });
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { recipientId, content, attachment } = req.body;
    const senderId = req.user?.id;
    if (!senderId || !recipientId || !content?.trim()) {
      return res.status(400).json({ success: false, message: 'Recipient and message content are required.' });
    }

    if (!isDbConnected()) {
      const newMessage = {
        id: 'msg_' + Date.now(),
        conversationId: 'conv_1',
        senderId,
        text: content,
        attachment: attachment || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSelf: true,
      };
      return res.json({ success: true, message: newMessage });
    }

    const { Conversation, Message } = await getModels();
    const participants = [senderId, recipientId].sort();
    const conversation = await Conversation.findOneAndUpdate(
      { participants: { $all: participants, $size: 2 } },
      { $setOnInsert: { participants } },
      { upsert: true, new: true }
    );
    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      recipientId,
      text: content.trim(),
      attachment,
    });

    conversation.lastMessage = content.trim();
    conversation.lastMessageTime = new Date();
    await conversation.save();
    await createNotification(recipientId, 'message', content.trim().slice(0, 120), senderId, conversation._id.toString());

    return res.json({ success: true, message });
  } catch (err) {
    next(err);
  }
};

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, notifications: [] });
    }
    const { Notification } = await getModels();
    const userId = req.user?.id;
    const query = userId ? { userId } : {};
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    return res.json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!isDbConnected()) {
      return res.json({ success: true });
    }

    const { Notification } = await getModels();
    await Notification.findByIdAndUpdate(id, { read: true });
    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

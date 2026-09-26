// server/controllers/liveClassController.ts
import { Response, NextFunction } from 'express';
import { LiveClass } from '../models/LiveClass';
import { AuthRequest } from '../middleware/auth';
import { isDbConnected } from '../config/mockStore';
import { createNotification } from './notificationController';
import { AccessToken } from 'livekit-server-sdk';
import { LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET } from '../config/env';

export const getLiveClasses = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!isDbConnected()) {
      const mockLiveClasses = [
        {
          id: 'live_1',
          title: 'Building Enterprise Microservices with Node.js & Docker',
          hostName: 'David K.',
          hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          hostTitle: 'Principal Cloud Architect',
          category: 'Cloud & DevOps',
          startTime: 'Today, 6:00 PM',
          duration: '90m',
          viewersCount: 284,
          isLive: true,
          status: 'live',
          thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
          description: 'Live interactive coding session constructing scalable containerized backends.',
          rsvps: ['usr_1'],
        },
        {
          id: 'live_2',
          title: 'Mastering System Design: Real-World Distributed Systems',
          hostName: 'Sarah Jenkins',
          hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          hostTitle: 'VP of Engineering',
          category: 'System Design & DSA',
          startTime: 'Tomorrow, 5:00 PM',
          duration: '60m',
          viewersCount: 140,
          isLive: false,
          status: 'scheduled',
          thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
          description: 'Deep dive into load balancers, caching layers, and database sharding architectures.',
          rsvps: [],
        },
      ];
      return res.json({ success: true, liveClasses: mockLiveClasses });
    }

    const liveClasses = await LiveClass.find().sort({ startTime: 1 });
    return res.json({ success: true, liveClasses });
  } catch (err) {
    next(err);
  }
};

export const createLiveClass = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, category, startTime, duration, thumbnail } = req.body;
    const hostName = req.user?.email ? req.user.email.split('@')[0] : 'Educator';
    const hostAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(hostName)}`;

    const newClassData = {
      title: title || 'Live Interactive Masterclass',
      description: description || '',
      category: category || 'Web Development',
      hostName,
      hostTitle: 'Senior Tech Educator',
      hostAvatar,
      instructorId: req.user?.id,
      startTime: startTime ? new Date(startTime) : new Date(Date.now() + 3600000),
      duration: duration || '60m',
      status: 'scheduled',
      thumbnail:
        thumbnail ||
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      viewersCount: 0,
      rsvps: [],
    };

    if (!isDbConnected()) {
      return res.json({ success: true, liveClass: { id: `live_${Date.now()}`, ...newClassData } });
    }

    const liveClass = new LiveClass(newClassData);
    await liveClass.save();
    return res.json({ success: true, liveClass });
  } catch (err) {
    next(err);
  }
};

export const rsvpLiveClass = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'usr_1';

    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Live class RSVP requires database persistence.' });
    }

    const liveClass = await LiveClass.findById(id);
    if (!liveClass) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    const hasRsvp = liveClass.rsvps.includes(userId);
    if (hasRsvp) {
      liveClass.rsvps = liveClass.rsvps.filter((uid) => uid !== userId);
    } else {
      liveClass.rsvps.push(userId);
    }
    await liveClass.save();
    if (!hasRsvp && liveClass.instructorId) {
      await createNotification(
        liveClass.instructorId.toString(),
        'course',
        `${req.user?.email || 'A student'} RSVPed for ${liveClass.title}.`
      );
    }

    return res.json({
      success: true,
      isRsvped: !hasRsvp,
      rsvpsCount: liveClass.rsvps.length,
      message: hasRsvp ? 'RSVP cancelled.' : 'RSVP confirmed! We will notify you before the class begins.',
    });
  } catch (err) {
    next(err);
  }
};

export const createLiveKitToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required.' });
    if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
      return res.status(503).json({ success: false, message: 'LiveKit is not configured.' });
    }
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'LiveKit rooms require database persistence.' });
    }
    const liveClass = await LiveClass.findById(id);
    if (!liveClass) return res.status(404).json({ success: false, message: 'Live class not found.' });
    if (liveClass.status === 'cancelled' || liveClass.status === 'ended') {
      return res.status(409).json({ success: false, message: 'This live class is no longer available.' });
    }
    const roomName = `live-class-${liveClass._id.toString()}`;
    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: userId,
      name: req.user?.email || userId,
      ttl: '2h',
    });
    token.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
    return res.json({ success: true, url: LIVEKIT_URL, roomName, token: await token.toJwt() });
  } catch (err) {
    next(err);
  }
};

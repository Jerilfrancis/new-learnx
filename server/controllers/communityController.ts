// server/controllers/communityController.ts
import { Response, NextFunction } from 'express';
import { Community } from '../models/Community';
import { AuthRequest } from '../middleware/auth';
import { isDbConnected, mockCommunities } from '../config/mockStore';

export const getCommunities = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, communities: mockCommunities });
    }
    const communities = await Community.find().sort({ membersCount: -1 });
    const userId = _req.user?.id;
    const response = communities.map((community) => ({
      ...community.toObject(),
      isJoined: Boolean(userId && community.members.some((member) => member.toString() === userId)),
    }));
    return res.json({ success: true, communities: response });
  } catch (err) {
    next(err);
  }
};

export const joinCommunity = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!isDbConnected()) {
      const comm = mockCommunities.find((c) => c.id === id || c._id === id);
      if (comm) {
        comm.isJoined = !comm.isJoined;
        comm.membersCount += comm.isJoined ? 1 : -1;
        return res.json({
          success: true,
          isJoined: comm.isJoined,
          membersCount: comm.membersCount,
        });
      }
      return res.json({ success: true, isJoined: true, membersCount: 100 });
    }

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required.' });
    const memberIndex = community.members.findIndex((member) => member.toString() === userId);
    const isJoined = memberIndex === -1;
    if (isJoined) {
      community.members.push(userId as any);
    } else {
      community.members.splice(memberIndex, 1);
    }
    community.membersCount = community.members.length;
    await community.save();

    return res.json({
      success: true,
      isJoined,
      membersCount: community.membersCount,
    });
  } catch (err) {
    next(err);
  }
};

// server/controllers/leaderboardController.ts
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { XPEvent } from '../models/XPEvent';
import { isDbConnected } from '../config/mockStore';
import { awardXP } from '../services/xpService';
import { AuthRequest } from '../middleware/auth';

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const timeframe = req.query.timeframe === 'weekly' ? 'weekly' : 'all-time';

    if (!isDbConnected()) {
      const mockLeaderboard = [
        {
          rank: 1,
          id: 'u1',
          name: 'Alex Vance',
          handle: '@alexvance',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          role: 'Full Stack Architect',
          xp: 8450,
          level: 42,
          streak: 14,
          badges: ['🏆 Grandmaster', '🔥 14-Day Streak', '⚡ Top Solver'],
          change: '+2',
        },
        {
          rank: 2,
          id: 'u2',
          name: 'Sarah Jenkins',
          handle: '@sarahj',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          role: 'AI Research Lead',
          xp: 7920,
          level: 39,
          streak: 21,
          badges: ['🤖 AI Pioneer', '📚 Course Champion'],
          change: '0',
        },
        {
          rank: 3,
          id: 'u3',
          name: 'Elena Rostova',
          handle: '@elena_dev',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
          role: 'Cloud Security Engineer',
          xp: 6810,
          level: 34,
          streak: 9,
          badges: ['🛡️ SecOps Hero', '🌟 Open Source Top Contributor'],
          change: '+1',
        },
        {
          rank: 4,
          id: 'u4',
          name: 'Marcus Chen',
          handle: '@marcus_c',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          role: 'Distributed Systems Dev',
          xp: 5940,
          level: 29,
          streak: 7,
          badges: ['⚙️ Systems Guru'],
          change: '-1',
        },
      ];
      return res.json({ success: true, timeframe, leaderboard: mockLeaderboard });
    }

    let usersWithRank: any[] = [];

    if (timeframe === 'weekly') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const weeklyAgg = await XPEvent.aggregate([
        { $match: { createdAt: { $gte: oneWeekAgo } } },
        { $group: { _id: '$userId', weeklyXP: { $sum: '$xp' } } },
        { $sort: { weeklyXP: -1 } },
        { $limit: 50 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
      ]);

      usersWithRank = weeklyAgg.map((item, idx) => ({
        rank: idx + 1,
        id: item.user._id,
        name: item.user.name || item.user.email.split('@')[0],
        handle: `@${item.user.email.split('@')[0]}`,
        avatar:
          item.user.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.user.email)}`,
        role: item.user.role || 'STUDENT',
        xp: item.weeklyXP,
        level: Math.floor(item.weeklyXP / 100) + 1,
        streak: item.user.streak || 3,
        badges: ['⚡ Weekly Climber'],
        change: idx === 0 ? '+1' : '0',
      }));
    }

    // If weekly has fewer than 5 or timeframe is all-time, fetch top users by total XP
    if (usersWithRank.length === 0 || timeframe === 'all-time') {
      const topUsers = await User.find({ isBanned: { $ne: true } })
        .sort({ xp: -1 })
        .limit(50);

      usersWithRank = topUsers.map((u, idx) => ({
        rank: idx + 1,
        id: u._id,
        name: u.name || u.email.split('@')[0],
        handle: `@${u.email.split('@')[0]}`,
        avatar:
          u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.email)}`,
        role: u.role || 'STUDENT',
        xp: u.xp || 100 * (50 - idx),
        level: Math.floor((u.xp || 100) / 100) + 1,
        streak: u.streak || 5,
        badges:
          idx === 0
            ? ['🏆 Grandmaster', '🔥 Streak Master']
            : idx < 3
            ? ['🌟 Top 3 Contributor']
            : ['⚡ Active Learner'],
        change: '0',
      }));
    }

    return res.json({ success: true, timeframe, leaderboard: usersWithRank });
  } catch (err) {
    next(err);
  }
};

export const claimDailyXP = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const result = await awardXP(userId, 'DAILY_LOGIN');
    if (result.duplicate) {
      return res.json({
        success: false,
        message: "You have already claimed today's daily login bonus! Come back tomorrow.",
      });
    }

    return res.json({
      success: true,
      message: `🎉 Daily login bonus claimed! +${result.xpEarned} XP`,
      xpEarned: result.xpEarned,
      totalXP: result.totalXP,
    });
  } catch (err) {
    next(err);
  }
};

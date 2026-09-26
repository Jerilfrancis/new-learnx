// server/controllers/adminController.ts
import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { Certificate } from '../models/Certificate';
import { Community } from '../models/Community';
import { Post } from '../models/Post';
import { Project } from '../models/Project';
import { AuthRequest } from '../middleware/auth';
import { isDbConnected } from '../config/mockStore';

export const getAdminStats = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!isDbConnected()) {
      return res.json({
        success: true,
        stats: {
          totalUsers: 1420,
          activeUsersDaily: 340,
          totalCourses: 28,
          totalEnrollments: 4890,
          totalCertificates: 642,
          totalCommunities: 14,
          totalProjects: 18,
        },
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const [
      totalUsers,
      activeUsersDaily,
      totalCourses,
      totalEnrollments,
      totalCertificates,
      totalCommunities,
      totalProjects,
      totalPosts,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ updatedAt: { $gte: startOfDay } }),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      Certificate.countDocuments(),
      Community.countDocuments(),
      Project.countDocuments(),
      Post.countDocuments(),
    ]);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsersDaily,
        totalCourses,
        totalEnrollments,
        totalCertificates,
        totalCommunities,
        totalProjects,
        totalPosts,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search, role } = req.query;

    if (!isDbConnected()) {
      return res.json({
        success: true,
        users: [
          { _id: 'u1', name: 'Alex Vance', email: 'alex@codeinfinite.dev', role: 'ADMIN', xp: 8450, isBanned: false, createdAt: new Date() },
          { _id: 'u2', name: 'Sarah Jenkins', email: 'sarah@codeinfinite.dev', role: 'COURSE_EDUCATOR', xp: 7920, isBanned: false, createdAt: new Date() },
          { _id: 'u3', name: 'Elena Rostova', email: 'elena@codeinfinite.dev', role: 'DISTRIBUTOR', xp: 6810, isBanned: false, createdAt: new Date() },
        ],
      });
    }

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: String(search), $options: 'i' } },
        { email: { $regex: String(search), $options: 'i' } },
      ];
    }
    if (role && role !== 'ALL') {
      query.role = role;
    }

    const users = await User.find(query).sort({ createdAt: -1 }).limit(100);
    return res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

export const updateAdminUserRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['STUDENT', 'COURSE_EDUCATOR', 'FREELANCER', 'DISTRIBUTOR', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    if (!isDbConnected()) {
      return res.json({ success: true, message: `User role updated to ${role}` });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.json({ success: true, message: `User role updated to ${role}`, user });
  } catch (err) {
    next(err);
  }
};

export const toggleBanUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!isDbConnected()) {
      return res.json({ success: true, message: 'User ban status toggled' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isBanned = !user.isBanned;
    await user.save();

    return res.json({
      success: true,
      isBanned: user.isBanned,
      message: user.isBanned ? 'User has been banned.' : 'User has been unbanned.',
    });
  } catch (err) {
    next(err);
  }
};

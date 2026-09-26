// server/controllers/dashboardController.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Course } from '../models/Course';
import { Enrollment } from '../models/Enrollment';
import { Certificate } from '../models/Certificate';
import { XPEvent } from '../models/XPEvent';
import { User } from '../models/User';
import { isDbConnected, mockCourses } from '../config/mockStore';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required.' });

    if (!isDbConnected()) {
      return res.json({
        success: true,
        stats: {
          enrolledCoursesCount: 3,
          completedCoursesCount: 1,
          certificatesCount: 1,
          totalXP: 1450,
          currentLevel: 15,
          currentStreak: 7,
          quizPassRate: 85,
          enrolledCourses: mockCourses.slice(0, 3).map((c, idx) => ({
            ...c,
            progress: idx === 0 ? 65 : idx === 1 ? 30 : 100,
            completedLessonsCount: idx === 0 ? 6 : idx === 1 ? 2 : 12,
            totalLessonsCount: 12,
          })),
          xpTimeline: [
            { day: 'Mon', xp: 45 },
            { day: 'Tue', xp: 70 },
            { day: 'Wed', xp: 30 },
            { day: 'Thu', xp: 90 },
            { day: 'Fri', xp: 60 },
            { day: 'Sat', xp: 120 },
            { day: 'Sun', xp: 85 },
          ],
          recentActivities: [
            { id: '1', title: 'Completed Lesson: RESTful API Design', time: '2 hours ago', xp: 10 },
            { id: '2', title: 'Passed Knowledge Quiz with 90%', time: 'Yesterday', xp: 20 },
            { id: '3', title: 'Claimed Daily Login Bonus', time: 'Yesterday', xp: 5 },
          ],
        },
      });
    }

    const user = await User.findById(userId);
    const enrollments = await Enrollment.find({ userId }).populate('courseId');
    const certificates = await Certificate.find({ studentId: userId });

    const totalXP = user?.xp || 0;
    const currentLevel = Math.floor(totalXP / 100) + 1;
    const currentStreak = user?.streak || 1;

    // Enrolled courses details
    const enrolledCourses = enrollments.map((enr: any) => {
      const course = enr.courseId;
      return {
        id: course?._id || enr.courseId,
        title: course?.title || 'Course',
        thumbnail: course?.thumbnail || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        category: course?.category || 'Web Development',
        progress: enr.progress || 0,
        completedLessonsCount: enr.completedLessons?.length || 0,
        completed: enr.completed || false,
      };
    });

    const completedCoursesCount = enrollments.filter((e) => e.completed).length;

    // XP timeline for last 7 days
    const past7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateStr: d.toISOString().split('T')[0],
        xp: 0,
      };
    });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const xpEvents = await XPEvent.find({ userId, createdAt: { $gte: oneWeekAgo } }).sort({ createdAt: -1 });

    xpEvents.forEach((event) => {
      const eventDate = new Date(event.createdAt).toISOString().split('T')[0];
      const dayItem = past7Days.find((d) => d.dateStr === eventDate);
      if (dayItem) {
        dayItem.xp += event.xp;
      }
    });

    // Recent activity
    const recentActivities = xpEvents.slice(0, 5).map((ev, idx) => ({
      id: String(ev._id || idx),
      title: `${ev.action.replace(/_/g, ' ')}`,
      time: new Date(ev.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      xp: ev.xp,
    }));

    return res.json({
      success: true,
      stats: {
        enrolledCoursesCount: enrollments.length,
        completedCoursesCount,
        certificatesCount: certificates.length,
        totalXP,
        currentLevel,
        currentStreak,
        quizPassRate: 85,
        enrolledCourses,
        xpTimeline: past7Days.map(({ day, xp }) => ({ day, xp })),
        recentActivities,
      },
    });
  } catch (err) {
    next(err);
  }
};

import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Community } from '../models/Community';
import { Project } from '../models/Project';
import { Post } from '../models/Post';
import { Service } from '../models/Service';
import { isDbConnected, mockUsers, mockCourses, mockCommunities, mockProjects } from '../config/mockStore';

export const globalSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q) {
      return res.json({
        success: true,
        users: [],
        courses: [],
        communities: [],
        projects: [],
        posts: [],
        services: [],
      });
    }

    const regex = new RegExp(q, 'i');

    if (!isDbConnected()) {
      const users = mockUsers.filter((u) => regex.test(u.name) || regex.test(u.handle) || regex.test(u.bio));
      const courses = mockCourses.filter((c) => regex.test(c.title) || regex.test(c.category) || regex.test(c.description));
      const communities = mockCommunities.filter((cm) => regex.test(cm.name) || regex.test(cm.description));
      const projects = mockProjects.filter((p) => regex.test(p.title) || regex.test(p.description));

      return res.json({
        success: true,
        users,
        courses,
        communities,
        projects,
        posts: [],
        services: [],
      });
    }

    const [users, courses, communities, projects, posts, services] = await Promise.all([
      User.find({ $or: [{ name: regex }, { handle: regex }, { bio: regex }] }).select('name handle avatar role bio totalXp').limit(10),
      Course.find({ $or: [{ title: regex }, { category: regex }, { description: regex }] }).limit(10),
      Community.find({ $or: [{ name: regex }, { description: regex }] }).limit(10),
      Project.find({ $or: [{ title: regex }, { description: regex }, { category: regex }] }).limit(10),
      Post.find({ content: regex }).populate('authorId', 'name avatar handle').limit(10),
      Service.find({ $or: [{ title: regex }, { description: regex }, { category: regex }] }).populate('freelancerId', 'name avatar').limit(10),
    ]);

    return res.json({
      success: true,
      users,
      courses,
      communities,
      projects,
      posts,
      services,
    });
  } catch (err) {
    next(err);
  }
};

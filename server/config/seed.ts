// server/config/seed.ts
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Community } from '../models/Community';
import bcrypt from 'bcryptjs';

export const seedDatabase = async () => {
  if (mongoose.connection.readyState !== 1) {
    console.log('[Seed] Database not connected. Skipping MongoDB seeding (set MONGODB_URI to enable).');
    return;
  }

  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding initial database...');
      const passwordHash = await bcrypt.hash('password123', 10);

      const defaultUser = new User({
        email: 'alex.vance@codeinfinite.dev',
        passwordHash,
        name: 'Alex Vance',
        handle: 'alexvance',
        role: 'STUDENT',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: 'Full-Stack Developer, Open Source Contributor & Lifelong Learner.',
        totalXp: 1250,
        emailVerified: true,
        onboardingCompleted: true,
        skills: ['React', 'TypeScript', 'Node.js', 'Express', 'Tailwind CSS'],
        createdCoursesCount: 0,
        completedCoursesCount: 2,
        followersCount: 128,
        followingCount: 45,
      });

      await defaultUser.save();
      console.log('Default user seeded: alex.vance@codeinfinite.dev');
    }

    const commCount = await Community.countDocuments();
    if (commCount === 0) {
      await Community.insertMany([
        {
          name: 'React & Frontend Masters',
          description: 'Everything React, Next.js, Vite, Web Performance & Modern UI Architecture.',
          membersCount: 4210,
          avatar: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=400&q=80',
          tags: ['React', 'UI/UX', 'JavaScript'],
        },
        {
          name: 'Backend & Systems Engineering',
          description: 'Node.js, Go, Microservices, System Design, PostgreSQL & Redis optimization.',
          membersCount: 2890,
          avatar: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80',
          tags: ['Node.js', 'Databases', 'Distributed Systems'],
        },
        {
          name: 'AI & Machine Learning Engineers',
          description: 'Building GenAI apps, LLM fine-tuning, RAG pipelines & Python data science.',
          membersCount: 5120,
          avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
          tags: ['AI', 'Python', 'LLMs'],
        },
      ]);
      console.log('Initial communities seeded.');
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
};

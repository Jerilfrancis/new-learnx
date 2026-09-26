// server/config/mockStore.ts
import mongoose from 'mongoose';

export const isDbConnected = () => mongoose.connection.readyState === 1;

export const mockUsers = [
  {
    _id: 'usr_1',
    id: 'usr_1',
    email: 'alex.vance@codeinfinite.dev',
    passwordHash: '$2a$10$X8...fake',
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
  },
];

export const mockPosts: any[] = [];

export const mockCommunities = [
  {
    _id: 'comm_1',
    id: 'comm_1',
    name: 'React & Frontend Masters',
    description: 'Everything React, Next.js, Vite, Web Performance & Modern UI Architecture.',
    membersCount: 4210,
    isJoined: true,
    avatar: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=400&q=80',
    tags: ['React', 'UI/UX', 'JavaScript'],
  },
  {
    _id: 'comm_2',
    id: 'comm_2',
    name: 'Backend & Systems Engineering',
    description: 'Node.js, Go, Microservices, System Design, PostgreSQL & Redis optimization.',
    membersCount: 2890,
    isJoined: false,
    avatar: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80',
    tags: ['Node.js', 'Databases', 'Distributed Systems'],
  },
  {
    _id: 'comm_3',
    id: 'comm_3',
    name: 'AI & Machine Learning Engineers',
    description: 'Building GenAI apps, LLM fine-tuning, RAG pipelines & Python data science.',
    membersCount: 5120,
    isJoined: true,
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    tags: ['AI', 'Python', 'LLMs'],
  },
];

export const mockCourses: any[] = [];
export const mockProjects: any[] = [];
export const mockSubmissions: any[] = [];
export const mockConversations: any[] = [];
export const mockNotifications: any[] = [];

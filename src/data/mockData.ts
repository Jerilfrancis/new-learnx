import {
  UserProfile,
  Post,
  Course,
  Community,
  ProjectChallenge,
  Mentor,
  Certificate,
  LiveClass,
  LeaderboardUser,
  NotificationItem,
  DirectMessage,
  ConversationThread,
} from "../types";

export const CURRENT_USER: UserProfile = {
  id: "usr_101",
  name: "Alex Vance",
  handle: "alexvance",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
  role: "STUDENT",
  headline: "Full-Stack & AI Systems Student | Building LearnX",
  bio: "Passionate about Distributed Systems, React 19, and LLM Engineering.",
  companyOrInstitute: "Stanford Computer Science '26",
  location: "San Francisco, CA",
  followersCount: 0,
  followingCount: 0,
  learningStreakDays: 0,
  totalXp: 0,
  level: 1,
  skills: ["TypeScript", "React 19", "Node.js"],
  completedCoursesCount: 0,
  certificatesCount: 0,
  projectsBuiltCount: 0,
  githubUrl: "https://github.com",
  linkedinUrl: "https://linkedin.com",
  websiteUrl: "https://alexvance.dev",
  badges: [],
};

export const MOCK_POSTS: Post[] = [];

export const MOCK_COURSES: Course[] = [];

export const MOCK_COMMUNITIES: Community[] = [];

export const MOCK_PROJECT_CHALLENGES: ProjectChallenge[] = [];

export const MOCK_MENTORS: Mentor[] = [];

export const MOCK_CERTIFICATES: Certificate[] = [];

export const MOCK_LIVE_CLASSES: LiveClass[] = [];

export const MOCK_LEADERBOARD: LeaderboardUser[] = [];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [];

export const MOCK_DIRECT_MESSAGES: DirectMessage[] = [];

export const MOCK_CONVERSATIONS: ConversationThread[] = [];

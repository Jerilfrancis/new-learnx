export type UserRole = "STUDENT" | "COURSE_EDUCATOR" | "FREELANCER";

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bannerUrl?: string;
  role: UserRole;
  headline: string;
  bio: string;
  companyOrInstitute: string;
  location: string;
  followersCount: number;
  followingCount: number;
  learningStreakDays: number;
  totalXp: number;
  level: number;
  badges: Badge[];
  skills: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  completedCoursesCount: number;
  certificatesCount: number;
  projectsBuiltCount: number;
  onboardingCompleted?: boolean;
  email?: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: string;
}

export type PostType =
  | "TEXT"
  | "CODE"
  | "POLL"
  | "PROJECT"
  | "COURSE_PROMO"
  | "CERTIFICATE"
  | "QUESTION"
  | "VIDEO";

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Comment {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    role: UserRole;
    verified?: boolean;
    headline?: string;
  };
  type: PostType;
  content: string;
  timestamp: string;
  likes: number;
  commentsCount: number;
  shares: number;
  isLiked?: boolean;
  isSaved?: boolean;
  communityName?: string;
  communityId?: string;
  commentsList?: Comment[];
  media?: {
    mediaType: "image" | "video" | "file";
    url: string;
    thumbnailUrl?: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  }[];

  // Optional sub-content based on post type
  codeSnippet?: {
    language: string;
    code: string;
  };
  pollData?: {
    question: string;
    options: PollOption[];
    totalVotes: number;
    userVotedOptionId?: string;
  };
  projectData?: {
    title: string;
    description: string;
    tags: string[];
    demoUrl?: string;
    githubUrl?: string;
    imageUrl?: string;
  };
  coursePromoData?: {
    courseId: string;
    title: string;
    rating: number;
    studentsCount: number;
    category: string;
    thumbnail: string;
  };
  certificateData?: {
    title: string;
    issuedBy: string;
    issueDate: string;
    credentialId: string;
    badgeIcon: string;
  };
  questionData?: {
    isSolved: boolean;
    pinnedSolution?: string;
    bountyXp?: number;
  };
}

export interface LessonResource {
  id?: string;
  url: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  resourceType?: string;
  createdAt?: string;
}

export interface MCQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface LessonQuiz {
  id?: string;
  title: string;
  passingScore?: number;
  questions: MCQuestion[];
}

export interface CourseLesson {
  id: string;
  title: string;
  description?: string;
  duration: string;
  type?: "video" | "article" | "quiz" | "coding";
  videoUrl?: string;
  content?: string;
  resources?: LessonResource[];
  quiz?: LessonQuiz;
  order?: number;
  isFreePreview?: boolean;
  completed?: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  order?: number;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  _id?: string;
  title: string;
  category: string;
  instructor: {
    name: string;
    handle: string;
    avatar: string;
    title: string;
  };
  instructorId?: string;
  instructorRole?: string;
  instructorAvatar?: string;
  rating: number;
  reviewsCount: number;
  studentsEnrolled: number;
  studentsCount?: number;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels" | string;
  language?: string;
  thumbnail: string;
  description: string;
  whatYouWillLearn: string[];
  learningObjectives?: string[];
  prerequisites?: string[];
  tags?: string[];
  lessons: CourseLesson[];
  curriculum?: CourseModule[];
  price: string;
  status?: "draft" | "published" | "unpublished" | "archived";
  published?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  icon: string;
  bannerColor: string;
  description: string;
  category: string;
  membersCount: number;
  postsCount: number;
  isJoined?: boolean;
  tags: string[];
}

export interface ProjectChallenge {
  id: string;
  title: string;
  type: "Mini Project" | "Major Capstone" | "Hackathon" | "Open Source" | "Research" | "Paid Learning";
  distributor: {
    name: string;
    company: string;
    avatar: string;
  };
  description: string;
  requirements: string[];
  techStack: string[];
  prizePool?: string;
  deadline: string;
  applicantsCount: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  topics: string[];
  hourlyRate: string;
  bio: string;
  availableDays: string[];
  isTopMentor?: boolean;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  recipientName: string;
  issueDate: string;
  credentialId: string;
  qrCodeUrl: string;
  skillsVerified: string[];
  scorePercent: number;
  signatureName: string;
}

export interface LiveClass {
  id: string;
  title: string;
  hostName: string;
  hostAvatar: string;
  hostTitle: string;
  category: string;
  startTime: string;
  viewersCount: number;
  isLive: boolean;
  thumbnail: string;
  description: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  recipientId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
  imageUrl?: string;
  reactions?: string[];
  isVoiceNote?: boolean;
  voiceDuration?: string;
  isRead?: boolean;
}

export interface ConversationThread {
  id: string;
  indexNumber: number; // #1, #2, #3 receiving index
  participant: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    isOnline: boolean;
    lastActive: string;
    note?: string;
  };
  lastMessageText: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: DirectMessage[];
  category: "primary" | "general" | "requests";
  isPinned?: boolean;
}

export interface NotificationItem {
  id: string;
  type:
    | "like"
    | "comment"
    | "course"
    | "badge"
    | "live"
    | "mentor"
    | "project"
    | "follow_request"
    | "follow_accept"
    | "follow";
  title: string;
  description: string;
  timeAgo: string;
  read: boolean;
  linkUrl?: string;
  user?: {
    id?: string;
    name: string;
    handle: string;
    avatar: string;
    role?: string;
  };
  status?: "pending" | "accepted" | "declined" | "following";
}

export interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  handle: string;
  avatar: string;
  xp: number;
  streakDays: number;
  role: UserRole;
  country: string;
}

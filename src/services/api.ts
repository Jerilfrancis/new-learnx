// API Client for LearnX Fullstack Application

const API_BASE = "/api";

// Attach auth token to headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("ci_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "An error occurred");
  }

  return data as T;
}

// Authentication API
export const authApi = {
  register: (payload: { name: string; email: string; password: string; role: string }) =>
    fetchApi<{ success: boolean; token: string; user: any; message?: string; verificationCode?: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string; role?: string }) =>
    fetchApi<{ success: boolean; token: string; user: any; message?: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  oauthLogin: (provider: "google" | "github", payload: { email: string; name: string; avatar?: string; role?: string }) =>
    fetchApi<{ success: boolean; token: string; user: any }>("/auth/oauth", {
      method: "POST",
      body: JSON.stringify({ provider, ...payload }),
    }),

  verifyEmail: (payload: { email: string; token: string }) =>
    fetchApi<{ success: boolean; token?: string; user: any; message: string }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  forgotPassword: (payload: { email: string }) =>
    fetchApi<{ success: boolean; message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  resendOtp: (payload: { email: string }) =>
    fetchApi<{ success: boolean; message: string }>("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  resetPassword: (payload: { email: string; token: string; newPassword: string }) =>
    fetchApi<{ success: boolean; message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMe: (token?: string) =>
    fetchApi<{ success: boolean; user: any }>("/auth/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),

  updateProfile: (profileData: any) =>
    fetchApi<{ success: boolean; user: any }>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),

  completeOnboarding: (payload: { interests: string[]; goals: string[]; avatar: string }) =>
    fetchApi<{ success: boolean; user: any }>("/auth/onboarding", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// Posts API
export const postsApi = {
  getAll: () => fetchApi<{ success: boolean; posts: any[] }>("/posts"),
  create: (postData: any) =>
    fetchApi<{ success: boolean; post: any }>("/posts", {
      method: "POST",
      body: JSON.stringify(postData),
    }),
  like: (postId: string) =>
    fetchApi<{ success: boolean; likes: number; hasLiked: boolean }>(`/posts/${postId}/like`, {
      method: "POST",
    }),
  comment: (postId: string, text: string) =>
    fetchApi<{ success: boolean; commentsList: any[] }>(`/posts/${postId}/comment`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
  bookmark: (postId: string) =>
    fetchApi<{ success: boolean; isSaved: boolean }>(`/posts/${postId}/bookmark`, {
      method: "POST",
    }),
  delete: (postId: string) =>
    fetchApi<{ success: boolean }>(`/posts/${postId}`, {
      method: "DELETE",
    }),
};

// Courses API
export const coursesApi = {
  getAll: () => fetchApi<{ success: boolean; courses: any[] }>("/courses"),
  getById: (courseId: string) =>
    fetchApi<{ success: boolean; course: any }>(`/courses/${courseId}`),
  create: (courseData: any) =>
    fetchApi<{ success: boolean; course: any }>("/courses", {
      method: "POST",
      body: JSON.stringify(courseData),
    }),
  update: (courseId: string, courseData: any) =>
    fetchApi<{ success: boolean; course: any }>(`/courses/${courseId}`, {
      method: "PUT",
      body: JSON.stringify(courseData),
    }),
  delete: (courseId: string) =>
    fetchApi<{ success: boolean; message: string }>(`/courses/${courseId}`, {
      method: "DELETE",
    }),
  publish: (courseId: string) =>
    fetchApi<{ success: boolean; course: any }>(`/courses/${courseId}/publish`, {
      method: "PATCH",
    }),
  enroll: (courseId: string) =>
    fetchApi<{ success: boolean; message: string; enrollment: any }>(`/courses/${courseId}/enroll`, {
      method: "POST",
    }),
  updateProgress: (courseId: string, lessonId: string, progress?: number, currentPosition?: number, duration?: number) =>
    fetchApi<{ success: boolean; progress: number; enrollment?: any }>(`/courses/${courseId}/progress`, {
      method: "POST",
      body: JSON.stringify({ lessonId, progress, currentPosition, duration }),
    }),
  submitQuiz: (courseId: string, payload: { lessonId: string; answers: Record<number, number> }) =>
    fetchApi<{
      success: boolean;
      score: number;
      totalQuestions: number;
      percentage: number;
      passed: boolean;
      results: Array<{
        questionIndex: number;
        question: string;
        userAnswer: number;
        correctAnswer: number;
        explanation: string;
        isCorrect: boolean;
      }>;
    }>(`/courses/${courseId}/quiz-submit`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  generateCertificate: (courseId: string) =>
    fetchApi<{ success: boolean; certificate: any }>(`/courses/${courseId}/certificate`, {
      method: "POST",
    }),
  getCertificate: (certId: string) =>
    fetchApi<{ success: boolean; certificate: any }>(`/courses/certificate/${certId}`),
  getMyCertificates: () =>
    fetchApi<{ success: boolean; certificates: any[] }>("/courses/my-certificates"),
};

// Projects API
export const projectsApi = {
  getAll: () => fetchApi<{ success: boolean; projects: any[] }>("/projects"),
  create: (projectData: any) =>
    fetchApi<{ success: boolean; project: any }>("/projects", {
      method: "POST",
      body: JSON.stringify(projectData),
    }),
  submitSolution: (projectId: string, solutionData: any) =>
    fetchApi<{ success: boolean; submission: any }>(`/projects/${projectId}/submit`, {
      method: "POST",
      body: JSON.stringify(solutionData),
    }),
  getSubmissions: (projectId?: string) =>
    fetchApi<{ success: boolean; submissions: any[] }>(`/projects/submissions${projectId ? `?projectId=${projectId}` : ""}`),
};

// Communities API
export const communitiesApi = {
  getAll: () => fetchApi<{ success: boolean; communities: any[] }>("/communities"),
  toggleJoin: (communityId: string) =>
    fetchApi<{ success: boolean; isJoined: boolean; membersCount: number }>(`/communities/${communityId}/join`, {
      method: "POST",
    }),
};

// Direct Messages & Notifications
export const messagingApi = {
  getConversations: () => fetchApi<{ success: boolean; conversations: any[] }>("/messages/conversations"),
  sendMessage: (recipientId: string, content: string, attachment?: string) =>
    fetchApi<{ success: boolean; message: any }>("/messages/send", {
      method: "POST",
      body: JSON.stringify({ recipientId, content, attachment }),
    }),
  getNotifications: () => fetchApi<{ success: boolean; notifications: any[] }>("/notifications"),
  markNotificationRead: (id: string) =>
    fetchApi<{ success: boolean }>(`/notifications/${id}/read`, {
      method: "POST",
    }),
};

// File Upload API
export const uploadApi = {
  uploadFile: async (formData: FormData) => {
    const token = localStorage.getItem("ci_token");
    const response = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Upload failed");
    return data as { success: boolean; url: string; fileName: string; fileSize?: number; mimeType?: string; resourceType?: string };
  },
};

// AI API (Groq AI Powered)
export const aiApi = {
  generateMcqs: (payload: { content: string; numberOfQuestions?: number; difficulty?: "easy" | "medium" | "hard" }) =>
    fetchApi<{
      success: boolean;
      model: string;
      count: number;
      questions: Array<{
        id: string;
        question: string;
        options: string[];
        correctAnswer: number;
        explanation: string;
      }>;
    }>("/ai/generate-mcqs", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  solveDoubt: (query: string, codeContext?: string, language?: string) =>
    fetchApi<{ result: string }>("/ai/solve-doubt", {
      method: "POST",
      body: JSON.stringify({ query, codeContext, language }),
    }),
  generateRoadmap: (topic: string, timeframe?: string, experienceLevel?: string) =>
    fetchApi<{ roadmap: any }>("/ai/generate-roadmap", {
      method: "POST",
      body: JSON.stringify({ topic, timeframe, experienceLevel }),
    }),
  generateQuiz: (topic: string) =>
    fetchApi<{ quiz: any }>("/ai/generate-quiz", {
      method: "POST",
      body: JSON.stringify({ topic }),
    }),
  reviewProfile: (bio: string, skills: string[], projectsCount: number) =>
    fetchApi<{ review: string }>("/ai/review-profile", {
      method: "POST",
      body: JSON.stringify({ bio, skills, projectsCount }),
    }),
};

// Courses extended
export const coursesExtendedApi = {
  getById: (courseId: string) => coursesApi.getById(courseId),
  generateCertificate: (courseId: string) => coursesApi.generateCertificate(courseId),
  getCertificate: (certId: string) => coursesApi.getCertificate(certId),
};

// Projects extended
export const projectsExtendedApi = {
  reviewSubmission: (submissionId: string, status: string, feedback: string) =>
    fetchApi<{ success: boolean; message: string }>(`/projects/submissions/${submissionId}/review`, {
      method: "PATCH",
      body: JSON.stringify({ status, feedback }),
    }),
};

// Freelancer API
export const freelancerApi = {
  getMentors: () =>
    fetchApi<{ success: boolean; mentors: any[] }>("/freelancer/mentors"),
  getServices: () =>
    fetchApi<{ success: boolean; services: any[] }>("/freelancer/services"),
  createService: (data: any) =>
    fetchApi<{ success: boolean; service: any }>("/freelancer/services", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteService: (id: string) =>
    fetchApi<{ success: boolean }>(`/freelancer/services/${id}`, { method: "DELETE" }),

  getWorkshops: () =>
    fetchApi<{ success: boolean; workshops: any[] }>("/freelancer/workshops"),
  createWorkshop: (data: any) =>
    fetchApi<{ success: boolean; workshop: any }>("/freelancer/workshops", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMentoringSlots: () =>
    fetchApi<{ success: boolean; slots: any[] }>("/freelancer/mentoring-slots"),
  createMentoringSlot: (data: any) =>
    fetchApi<{ success: boolean; slot: any }>("/freelancer/mentoring-slots", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  requestMentoring: (data: { slotId: string; mentorId: string; message?: string }) =>
    fetchApi<{ success: boolean; mentoringRequest: any }>("/freelancer/mentoring-requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateMentoringStatus: (id: string, status: string) =>
    fetchApi<{ success: boolean }>(`/freelancer/mentoring-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// Search API
export const searchApi = {
  search: (q: string) =>
    fetchApi<{
      success: boolean;
      users: any[];
      courses: any[];
      communities: any[];
      projects: any[];
      posts: any[];
      services: any[];
    }>(`/search?q=${encodeURIComponent(q)}`),
};

// Notifications extended
export const notificationsApi = {
  getAll: () => fetchApi<{ success: boolean; notifications: any[] }>("/notifications"),
  markRead: (id: string) =>
    fetchApi<{ success: boolean }>(`/notifications/${id}/read`, { method: "POST" }),
  markAllRead: () =>
    fetchApi<{ success: boolean }>("/notifications/read-all", { method: "POST" }),
};

// Leaderboard API
export const leaderboardApi = {
  getLeaderboard: (timeframe: "weekly" | "all-time" = "weekly") =>
    fetchApi<{ success: boolean; timeframe: string; leaderboard: any[] }>(`/leaderboard?timeframe=${timeframe}`),
  claimDaily: () =>
    fetchApi<{ success: boolean; message: string; xpEarned: number; totalXP: number }>("/leaderboard/claim-daily", {
      method: "POST",
    }),
};

// Dashboard API
export const dashboardApi = {
  getStats: () =>
    fetchApi<{ success: boolean; stats: any }>("/dashboard/stats"),
};

// Live Classes API
export const liveApi = {
  getAll: () =>
    fetchApi<{ success: boolean; liveClasses: any[] }>("/live"),
  create: (data: any) =>
    fetchApi<{ success: boolean; liveClass: any }>("/live", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  rsvp: (id: string) =>
    fetchApi<{ success: boolean; isRsvped: boolean; rsvpsCount: number; message: string }>(`/live/${id}/rsvp`, {
      method: "POST",
    }),
  getRoomToken: (id: string) =>
    fetchApi<{ success: boolean; url: string; roomName: string; token: string }>(`/live/${id}/token`, {
      method: "POST",
    }),
};

// Admin API
export const adminApi = {
  getStats: () =>
    fetchApi<{ success: boolean; stats: any }>("/admin/stats"),
  getUsers: (search?: string, role?: string) =>
    fetchApi<{ success: boolean; users: any[] }>(
      `/admin/users?${search ? `search=${encodeURIComponent(search)}&` : ""}${role ? `role=${role}` : ""}`
    ),
  updateRole: (userId: string, role: string) =>
    fetchApi<{ success: boolean; message: string; user?: any }>(`/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
  toggleBan: (userId: string) =>
    fetchApi<{ success: boolean; message: string }>(`/admin/users/${userId}/ban`, {
      method: "PATCH",
    }),
};

// Code Runner API
export const codeApi = {
  execute: (language: string, code: string, stdin?: string) =>
    fetchApi<{
      success: boolean;
      output: string;
      stdout?: string;
      stderr?: string;
      exitCode?: number;
      executionTime?: string;
      message?: string;
    }>("/code/execute", {
      method: "POST",
      body: JSON.stringify({ language, code, stdin }),
    }),
};

// AI Mock Interview API
export const interviewApi = {
  interviewTurn: (payload: {
    role: string;
    topic: string;
    history: Array<{ sender: "interviewer" | "candidate"; text: string }>;
    candidateAnswer: string;
  }) =>
    fetchApi<{
      success: boolean;
      interviewerResponse: string;
      scoreCard?: {
        problemSolving: number;
        systemDesign: number;
        communication: number;
        codeQuality: number;
        overallScore: number;
        verdict: "Strong Hire" | "Hire" | "Leaning Hire" | "Needs Practice";
        strengths: string[];
        improvements: string[];
      };
      isComplete?: boolean;
    }>("/ai/interview-turn", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// Bounty & Code Review API
export const bountyApi = {
  getAll: (status?: "open" | "solved") =>
    fetchApi<{ success: boolean; bounties: any[] }>(
      `/bounties${status ? `?status=${status}` : ""}`
    ),
  create: (data: {
    title: string;
    description: string;
    codeSnippet: string;
    language: string;
    bountyXp: number;
  }) =>
    fetchApi<{ success: boolean; bounty: any }>("/bounties", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  submitSolution: (
    bountyId: string,
    data: { reviewText: string; codeSolution?: string }
  ) =>
    fetchApi<{ success: boolean; solution: any }>(
      `/bounties/${bountyId}/solutions`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),
  acceptSolution: (bountyId: string, solutionId: string) =>
    fetchApi<{ success: boolean; message: string }>(
      `/bounties/${bountyId}/solutions/${solutionId}/accept`,
      {
        method: "POST",
      }
    ),
};




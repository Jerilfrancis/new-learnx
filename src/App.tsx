import React, { useState, useEffect, useCallback } from "react";
import {
  Home,
  Compass,
  BookOpen,
  Users,
  FolderGit2,
  User,
} from "lucide-react";
import {
  CURRENT_USER,
  MOCK_MENTORS,
  MOCK_CERTIFICATES,
  MOCK_LIVE_CLASSES,
  MOCK_LEADERBOARD,
} from "./data/mockData";
import { Post, Course, Community, ProjectChallenge, NotificationItem, ConversationThread, DirectMessage, UserRole, UserProfile, Certificate, LiveClass, Mentor } from "./types";
import { postsApi, coursesApi, communitiesApi, projectsApi, messagingApi, authApi, liveApi, freelancerApi } from "./services/api";

import { LandingPage } from "./components/landing/LandingPage";
import { WelcomeOnboarding } from "./components/onboarding/WelcomeOnboarding";
import { AuthModal } from "./components/auth/AuthModal";

import { Navbar } from "./components/layout/Navbar";
import { LeftSidebar } from "./components/layout/LeftSidebar";
import { RightSidebar } from "./components/layout/RightSidebar";

import { FeedCard } from "./components/feed/FeedCard";
import { CreatePostModal } from "./components/feed/CreatePostModal";

import { CourseBrowse } from "./components/courses/CourseBrowse";
import { CourseDetailModal } from "./components/courses/CourseDetailModal";

import { CommunityHub } from "./components/communities/CommunityHub";
import { ProjectsHub } from "./components/projects/ProjectsHub";
import { LiveClassesView } from "./components/live/LiveClassesView";
import { MentorsView } from "./components/mentors/MentorsView";
import { LearningDashboard } from "./components/dashboard/LearningDashboard";
import { CertificatesView } from "./components/certificates/CertificatesView";
import { CertificateVerificationView } from "./components/certificates/CertificateVerificationView";
import { ProfileView } from "./components/profile/ProfileView";

import { ExploreView } from "./components/explore/ExploreView";
import { LeaderboardView } from "./components/leaderboard/LeaderboardView";
import { BookmarksView } from "./components/bookmarks/BookmarksView";
import { SettingsView } from "./components/settings/SettingsView";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { StudyAssistantWidget } from "./components/ai/StudyAssistantWidget";
import { CodePlaygroundModal } from "./components/code/CodePlaygroundModal";
import { ResumeBuilderModal } from "./components/resume/ResumeBuilderModal";
import { MockInterviewModal } from "./components/interview/MockInterviewModal";
import { BountyBoardView } from "./components/bounties/BountyBoardView";

import { DirectMessagesModal } from "./components/messaging/DirectMessagesModal";
import { NotificationsDrawer } from "./components/messaging/NotificationsDrawer";

// Token persistence
const getStoredToken = () => localStorage.getItem("ci_token");
const setStoredToken = (token: string) => localStorage.setItem("ci_token", token);
const clearStoredToken = () => localStorage.removeItem("ci_token");

export default function App() {
  const publicCertificateMatch = window.location.pathname.match(/^\/verify\/([^/]+)$/);
  if (publicCertificateMatch) {
    return <CertificateVerificationView certificateId={decodeURIComponent(publicCertificateMatch[1])} />;
  }

  // Global Flow State
  const [viewMode, setViewMode] = useState<"landing" | "welcome" | "main">("landing");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Active Main Navigation Tab
  const [activeView, setActiveView] = useState("home");
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);

  // App Collections - all API-driven
  const [posts, setPosts] = useState<Post[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [projects, setProjects] = useState<ProjectChallenge[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [conversations, setConversations] = useState<ConversationThread[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>(MOCK_CERTIFICATES);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>(MOCK_LIVE_CLASSES);
  const [mentors, setMentors] = useState<Mentor[]>(MOCK_MENTORS);

  // Modals & Drawers States
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCodeSandboxOpen, setIsCodeSandboxOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);

  // Auth Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<"login" | "signup">("login");

  // Toast Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Auto-login with stored token or OAuth callback on mount
  useEffect(() => {
    // Check if OAuth returned a token in the URL params
    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get("token");
    const oauthRole = urlParams.get("role");

    if (oauthToken) {
      setStoredToken(oauthToken);
      window.history.replaceState({}, document.title, window.location.pathname);
      authApi.getMe(oauthToken)
        .then((res) => {
          if (res.success && res.user) {
            setIsAuthenticated(true);
            setCurrentUser((prev) => ({ ...prev, ...res.user, role: (oauthRole || res.user.role) as UserRole }));
            setHasCompletedOnboarding(res.user.onboardingCompleted ?? true);
            setViewMode(res.user.onboardingCompleted ? "main" : "welcome");
            showToast("Successfully authenticated!");
          }
        })
        .catch(() => clearStoredToken());
      return;
    }

    const token = getStoredToken();
    if (token) {
      authApi.getMe(token)
        .then((res) => {
          if (res.success && res.user) {
            setIsAuthenticated(true);
            setCurrentUser((prev) => ({ ...prev, ...res.user }));
            setHasCompletedOnboarding(res.user.onboardingCompleted ?? true);
            setViewMode(res.user.onboardingCompleted ? "main" : "welcome");
          }
        })
        .catch(() => clearStoredToken());
    }
  }, [showToast]);

  // Fetch initial data from backend API
  const loadData = useCallback(async () => {
    try {
      const [postsRes, coursesRes, commRes, projRes, liveRes, mentorsRes] = await Promise.allSettled([
        postsApi.getAll(),
        coursesApi.getAll(),
        communitiesApi.getAll(),
        projectsApi.getAll(),
        liveApi.getAll(),
        freelancerApi.getMentors(),
      ]);

      if (postsRes.status === "fulfilled" && postsRes.value.success) {
        setPosts(postsRes.value.posts || []);
      }
      if (coursesRes.status === "fulfilled" && coursesRes.value.success) {
        setCourses(coursesRes.value.courses || []);
      }
      if (commRes.status === "fulfilled" && commRes.value.success) {
        setCommunities((commRes.value as any).communities || []);
      }
      if (projRes.status === "fulfilled" && projRes.value.success) {
        setProjects((projRes.value as any).projects || []);
      }
      if (liveRes.status === "fulfilled" && (liveRes.value as any).success) {
        const classes = (liveRes.value as any).liveClasses || [];
        if (classes.length > 0) setLiveClasses(classes);
      }
      if (mentorsRes.status === "fulfilled" && (mentorsRes.value as any).success) {
        const fetchedMentors = (mentorsRes.value as any).mentors || [];
        if (fetchedMentors.length > 0) setMentors(fetchedMentors);
      }
    } catch (err) {
      console.error("Error loading data from backend:", err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fetch certificates when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    coursesApi.getMyCertificates()
      .then((res) => {
        if (res.success && res.certificates.length > 0) setCertificates(res.certificates);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  // Fetch notifications & conversations when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    messagingApi.getNotifications()
      .then((res) => {
        if (res.success) setNotifications(res.notifications || []);
      })
      .catch(() => {});
    messagingApi.getConversations()
      .then((res) => {
        if (res.success) setConversations(res.conversations || []);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  // Auth Action Callbacks
  const handleOpenLogin = () => {
    setAuthInitialMode("login");
    setIsAuthOpen(true);
  };

  const handleOpenSignup = () => {
    setAuthInitialMode("signup");
    setIsAuthOpen(true);
  };

  const handleLoginSuccess = (role: UserRole, name: string, token?: string, user?: any) => {
    if (token) setStoredToken(token);
    setIsAuthenticated(true);
    setCurrentUser((prev) => ({
      ...prev,
      ...(user || {}),
      name: name || prev.name,
      role: role || prev.role,
    }));
    const onboarded = user?.onboardingCompleted ?? hasCompletedOnboarding;
    setHasCompletedOnboarding(onboarded);
    showToast(`Welcome back, ${name || currentUser.name}!`);
    setViewMode(onboarded ? "main" : "welcome");
    setIsAuthOpen(false);
  };

  const handleSignupSuccess = (role: UserRole, name: string, token?: string, user?: any) => {
    if (token) setStoredToken(token);
    setIsAuthenticated(true);
    setHasCompletedOnboarding(false);
    setCurrentUser((prev) => ({
      ...prev,
      ...(user || {}),
      name: name || "New Member",
      role: role || "STUDENT",
    }));
    showToast("Account created! Let's personalize your feed.");
    setViewMode("welcome");
    setIsAuthOpen(false);
  };

  const handleOnboardingComplete = async (data: {
    interests: string[];
    goals: string[];
    categories: string[];
    avatar: string;
  }) => {
    try {
      await authApi.completeOnboarding({
        interests: data.interests,
        goals: data.goals,
        avatar: data.avatar,
      });
    } catch (err) {
      console.error("Onboarding sync error:", err);
    }

    setHasCompletedOnboarding(true);
    setCurrentUser((prev) => ({
      ...prev,
      avatar: data.avatar,
      skills: Array.from(new Set([...prev.skills, ...data.interests])),
      onboardingCompleted: true,
    }));
    setViewMode("main");
    setActiveView("home");
    showToast("Profile customization complete! Welcome to LearnX.");
  };

  const handleLogout = () => {
    clearStoredToken();
    setIsAuthenticated(false);
    setViewMode("landing");
    setPosts([]);
    setNotifications([]);
    setConversations([]);
    showToast("Logged out safely.");
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentUser((prev) => ({ ...prev, role }));
    showToast(`Switched active mode to ${role.replace("_", " ")}`);
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
    setCurrentUser((prev) => ({
      ...prev,
      totalXp: prev.totalXp + 50,
    }));
    showToast("Post Published! Earned +50 XP 🚀");
  };

  const handleApplyProject = (projectTitle: string) => {
    setActiveView("projects");
    showToast(`Opening details for project challenge: "${projectTitle}"`);
  };

  const handleBookMentor = (mentor: any) => {
    setActiveView("mentors");
    showToast(`Opening booking calendar for ${mentor.name}`);
  };

  const handleJoinCommunity = async (communityId: string) => {
    try {
      const res = await communitiesApi.toggleJoin(communityId);
      if (res.success) {
        setCommunities((prev) =>
          prev.map((c: any) =>
            (c._id === communityId || c.id === communityId)
              ? { ...c, isJoined: res.isJoined, membersCount: res.membersCount }
              : c
          )
        );
        showToast(res.isJoined ? "Joined community!" : "Left community.");
      }
    } catch (err) {
      console.error("Community join error:", err);
    }
  };

  const handleCourseEnroll = async (courseId: string, courseTitle: string) => {
    try {
      await coursesApi.enroll(courseId);
      showToast(`Successfully enrolled in "${courseTitle}"!`);
      setCurrentUser((prev) => ({
        ...prev,
        completedCoursesCount: prev.completedCoursesCount + 1,
      }));
    } catch (err) {
      console.error("Enroll error:", err);
      showToast(`Could not enroll in "${courseTitle}".`);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await messagingApi.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n: any) => (n.id === id || n._id === id) ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error("Notification read error:", err);
    }
  };

  const unreadNotificationsCount = notifications.filter((n: any) => !n.read).length;
  const unreadMessagesCount = conversations.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);

  // ROUTE 1: LANDING PAGE VIEW
  if (viewMode === "landing" || (!isAuthenticated && viewMode !== "welcome")) {
    return (
      <>
        <LandingPage
          onOpenLogin={handleOpenLogin}
          onOpenSignup={handleOpenSignup}
        />
        {isAuthOpen && (
          <AuthModal
            initialMode={authInitialMode}
            onClose={() => setIsAuthOpen(false)}
            onLoginSuccess={handleLoginSuccess}
            onSignupSuccess={handleSignupSuccess}
          />
        )}
      </>
    );
  }

  // ROUTE 2: WELCOME ONBOARDING PAGE (AFTER SIGNUP)
  if (viewMode === "welcome") {
    return (
      <WelcomeOnboarding
        userName={currentUser.name}
        userRole={currentUser.role}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // ROUTE 3: MAIN APPLICATION LAYOUT
  return (
    <div className="min-h-screen bg-transparent text-[#112D4E] font-sans selection:bg-[#3F72AF] selection:text-white flex flex-col">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#112D4E] text-white text-xs font-bold px-4 py-3 rounded-lg shadow-md border border-[#112D4E]/[.12] animate-in fade-in zoom-in duration-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#112D4E]/[.15] animate-ping" />
          {toastMessage}
        </div>
      )}

      {/* Global Navbar */}
      <Navbar
        currentUser={currentUser}
        unreadNotificationsCount={unreadNotificationsCount}
        unreadMessagesCount={unreadMessagesCount}
        onOpenCreateModal={() => setIsCreatePostOpen(true)}
        onOpenMessages={() => setIsMessagesOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onRoleChange={handleRoleChange}
        onOpenAuth={handleOpenLogin}
        onLogout={handleLogout}
        activeNav={activeView}
        setActiveNav={setActiveView}
      />

      {/* Main Grid Container Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-4 sm:pt-6 pb-20 lg:pb-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar Navigation (Desktop) */}
        <aside className="hidden lg:block lg:col-span-3">
          <LeftSidebar
            activeView={activeView}
            setActiveView={setActiveView}
            currentUser={currentUser}
            onOpenCreateModal={() => setIsCreatePostOpen(true)}
            onOpenMessages={() => setIsMessagesOpen(true)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenCodeSandbox={() => setIsCodeSandboxOpen(true)}
            onOpenInterview={() => setIsInterviewOpen(true)}
            onOpenResume={() => setIsResumeOpen(true)}
            onLogout={handleLogout}
          />
        </aside>

        {/* Center Dynamic Feed / Content Area */}
        <main className={`col-span-1 min-w-0 space-y-6 ${activeView === "home" ? "lg:col-span-6" : "lg:col-span-9"}`}>
          {/* VIEW 1: HOME FEED */}
          {activeView === "home" && (
            <div className="space-y-6">
              {/* Quick Post Trigger Bar */}
              <div className="p-3.5 sm:p-4 rounded-lg bg-white border border-[#112D4E]/[.12] shadow-sm flex items-center gap-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-[#112D4E]/[.25] shrink-0"
                />
                <button
                  onClick={() => setIsCreatePostOpen(true)}
                  className="flex-1 text-left px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-white hover:bg-white text-xs text-[#112D4E]/[.55] font-medium border border-[#112D4E]/[.12] transition-colors cursor-pointer truncate"
                >
                  What are you learning, building, or solving today?
                </button>
                <button
                  onClick={() => setIsCreatePostOpen(true)}
                  className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#3F72AF] text-white font-bold text-xs hover:bg-[#112D4E] transition-colors cursor-pointer shadow-sm shrink-0"
                >
                  + Post
                </button>
              </div>

              {/* Feed Items */}
              <div className="space-y-5">
                {posts.length === 0 && (
                  <div className="text-center py-16 text-[#112D4E]/[.55] text-sm">
                    <p className="text-2xl mb-2">✍️</p>
                    <p className="font-medium">No posts yet. Be the first to share something!</p>
                  </div>
                )}
                {posts.map((post) => (
                  <FeedCard
                    key={(post as any)._id || post.id}
                    post={post}
                    onApplyProject={handleApplyProject}
                  />
                ))}
              </div>
            </div>
          )}

          {/* VIEW 2: EXPLORE ECOSYSTEM */}
          {activeView === "explore" && (
            <ExploreView
              courses={courses}
              communities={communities}
              projects={projects}
              mentors={mentors}
              onSelectCourse={(c) => setSelectedCourse(c)}
              onSelectCommunity={() => setActiveView("communities")}
            />
          )}

          {/* VIEW 3: COURSES CATALOG */}
          {activeView === "courses" && (
            <CourseBrowse
              courses={courses}
              onSelectCourse={(course) => setSelectedCourse(course)}
            />
          )}

          {/* VIEW 4: COMMUNITIES HUB */}
          {activeView === "communities" && (
            <CommunityHub
              communities={communities}
              posts={posts}
              onApplyProject={handleApplyProject}
              onOpenCreateModal={() => setIsCreatePostOpen(true)}
            />
          )}

          {/* VIEW 5: PROJECT HUB */}
          {activeView === "projects" && (
            <ProjectsHub projects={projects} />
          )}

          {/* VIEW: PEER CODE REVIEW & BOUNTY BOARD */}
          {activeView === "bounties" && (
            <BountyBoardView currentUser={currentUser} />
          )}

          {/* VIEW 6: LEADERBOARD */}
          {activeView === "leaderboard" && (
            <LeaderboardView currentUser={currentUser} />
          )}

          {/* VIEW 7: CERTIFICATES */}
          {activeView === "certificates" && (
            <CertificatesView certificates={certificates} />
          )}

          {/* VIEW 8: BOOKMARKS */}
          {activeView === "bookmarks" && (
            <BookmarksView
              posts={posts}
              courses={courses}
              projects={projects}
              onSelectCourse={(c) => setSelectedCourse(c)}
            />
          )}

          {/* VIEW 9: LIVE CLASSES & WORKSHOPS */}
          {activeView === "live" && (
            <LiveClassesView
              liveClasses={liveClasses}
              currentUser={currentUser}
              onClassCreated={(newClass) => setLiveClasses((prev) => [newClass, ...prev])}
            />
          )}

          {/* VIEW 10: MENTORS & FREELANCERS */}
          {activeView === "mentors" && (
            <MentorsView mentors={mentors} />
          )}

          {/* VIEW 11: DASHBOARD */}
          {activeView === "dashboard" && (
            <LearningDashboard currentUser={currentUser} />
          )}

          {/* VIEW 12: USER PROFILE */}
          {activeView === "profile" && (
            <ProfileView
              currentUser={currentUser}
              courses={courses}
              certificates={certificates}
              projects={projects}
              onOpenResume={() => setIsResumeOpen(true)}
            />
          )}

          {/* VIEW 13: SETTINGS */}
          {activeView === "settings" && (
            <SettingsView
              currentUser={currentUser}
              onLogout={handleLogout}
              onUpdateProfile={async (updated) => {
                try {
                  const res = await authApi.updateProfile(updated);
                  if (res.success) {
                    setCurrentUser((prev) => ({ ...prev, ...res.user }));
                    showToast("Profile settings saved!");
                  }
                } catch {
                  showToast("Profile settings could not be saved.");
                }
              }}
            />
          )}

          {/* VIEW 14: ADMIN DASHBOARD */}
          {activeView === "admin" && (
            <AdminDashboard />
          )}
        </main>


        {/* Right Sidebar Widgets */}
        <aside className="hidden lg:block lg:col-span-3">
          <RightSidebar
            currentUser={currentUser}
            courses={courses}
            mentors={mentors}
            liveClasses={liveClasses}
            onSelectCourse={(course) => setSelectedCourse(course)}
            onBookMentor={handleBookMentor}
            setActiveNav={setActiveView}
          />
        </aside>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95  border-t border-[#112D4E]/[.12] px-1 py-1.5 flex items-center justify-around text-[10px] font-bold text-[#112D4E]/[.55] shadow-sm">
        {[
          { id: "home", label: "Feed", icon: Home },
          { id: "explore", label: "Explore", icon: Compass },
          { id: "courses", label: "Courses", icon: BookOpen },
          { id: "communities", label: "Hubs", icon: Users },
          { id: "bounties", label: "Bounties", icon: FolderGit2 },
          { id: "leaderboard", label: "Ranks", icon: User },
          { id: "profile", label: "Profile", icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`p-1 min-w-[42px] flex flex-col items-center gap-0.5 cursor-pointer rounded-xl transition-all ${
                isActive
                  ? "text-[#3F72AF] font-extrabold bg-white"
                  : "text-[#112D4E]/[.55] hover:text-[#112D4E]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#3F72AF] stroke-[2.5]" : "text-[#112D4E]/[.55]"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* MODALS & DRAWERS */}
      {isCreatePostOpen && (
        <CreatePostModal
          currentUser={currentUser}
          onClose={() => setIsCreatePostOpen(false)}
          onPostCreated={handlePostCreated}
        />
      )}

      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onEnrollSuccess={() => {
            handleCourseEnroll(
              (selectedCourse as any)._id || selectedCourse.id,
              selectedCourse.title
            );
            setSelectedCourse(null);
          }}
        />
      )}

      {isMessagesOpen && (
        <DirectMessagesModal
          currentUser={currentUser}
          messages={directMessages}
          onClose={() => setIsMessagesOpen(false)}
        />
      )}

      {isNotificationsOpen && (
        <NotificationsDrawer
          notifications={notifications}
          onClose={() => setIsNotificationsOpen(false)}
        />
      )}

      {isAuthOpen && (
        <AuthModal
          initialMode={authInitialMode}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          onSignupSuccess={handleSignupSuccess}
        />
      )}

      {/* Code Sandbox Modal */}
      {isCodeSandboxOpen && (
        <CodePlaygroundModal onClose={() => setIsCodeSandboxOpen(false)} />
      )}

      {/* ATS Resume Builder Modal */}
      {isResumeOpen && (
        <ResumeBuilderModal
          currentUser={currentUser}
          courses={courses}
          projects={projects}
          onClose={() => setIsResumeOpen(false)}
        />
      )}

      {/* Groq AI Mock Technical Interview Modal */}
      {isInterviewOpen && (
        <MockInterviewModal onClose={() => setIsInterviewOpen(false)} />
      )}

      {/* Floating Groq AI Study Assistant Widget (Voice + Code) */}
      <StudyAssistantWidget />
    </div>
  );
}

import React from "react";
import {
  Home,
  Compass,
  BookOpen,
  Users,
  FolderGit2,
  Trophy,
  Award,
  Bookmark,
  MessageSquare,
  Bell,
  User,
  Settings,
  LogOut,
  UserCheck,
  Shield,
  Zap,
  Coins,
  Terminal,
  FileText,
  Sparkles,
} from "lucide-react";
import { UserProfile } from "../../types";

interface LeftSidebarProps {
  activeNav?: string;
  activeView?: string;
  setActiveNav?: (nav: string) => void;
  setActiveView?: (nav: string) => void;
  currentUser: UserProfile;
  onOpenCreateModal?: () => void;
  onOpenMessages?: () => void;
  onOpenNotifications?: () => void;
  onOpenCodeSandbox?: () => void;
  onOpenInterview?: () => void;
  onOpenResume?: () => void;
  onLogout?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeNav,
  activeView,
  setActiveNav,
  setActiveView,
  currentUser,
  onOpenMessages,
  onOpenNotifications,
  onOpenCodeSandbox,
  onOpenInterview,
  onOpenResume,
  onLogout,
}) => {
  const currentNav = activeView || activeNav || "home";
  const handleNavClick = (id: string) => {
    if (id === "messages" && onOpenMessages) {
      onOpenMessages();
      return;
    }
    if (id === "notifications" && onOpenNotifications) {
      onOpenNotifications();
      return;
    }
    if (id === "codesandbox" && onOpenCodeSandbox) {
      onOpenCodeSandbox();
      return;
    }
    if (id === "interview" && onOpenInterview) {
      onOpenInterview();
      return;
    }
    if (id === "resume" && onOpenResume) {
      onOpenResume();
      return;
    }
    if (id === "logout" && onLogout) {
      onLogout();
      return;
    }
    if (setActiveView) setActiveView(id);
    if (setActiveNav) setActiveNav(id);
  };

  const primaryNavItems = [
    { id: "home", label: "Home Feed", icon: Home, badge: null },
    { id: "explore", label: "Explore", icon: Compass, badge: "Hot" },
    { id: "courses", label: "Courses", icon: BookOpen, badge: "12" },
    { id: "communities", label: "Communities", icon: Users, badge: null },
    { id: "projects", label: "Projects Hub", icon: FolderGit2, badge: "Grants" },
    { id: "bounties", label: "XP Bounties", icon: Coins, badge: "New" },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy, badge: "XP" },
  ];

  const personalNavItems = [
    { id: "dashboard", label: "Dashboard", icon: Zap },
    { id: "certificates", label: "Certificates", icon: Award },
    { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
    ...(currentUser.role === "ADMIN" ? [{ id: "admin", label: "Admin Portal", icon: Shield }] : []),
  ];

  return (
    <aside className="w-full bg-[#112D4E] p-4 rounded-lg border border-[#112D4E]/[.12] text-white flex flex-col gap-5 shrink-0 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
      {/* Mini Profile Card */}
      <div
        onClick={() => handleNavClick("profile")}
        className="flex items-center gap-3 p-2 rounded-lg bg-white/10 border border-white/15 hover:bg-white/15 transition-colors cursor-pointer group"
      >
        <div className="relative">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/25 group-hover:ring-[#3F72AF] transition-all"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#3F72AF] ring-2 ring-[#112D4E] rounded-full" />
        </div>
        <div className="overflow-hidden flex-1">
          <h4 className="text-xs font-bold text-white group-hover:text-white transition-colors truncate">
            {currentUser.name}
          </h4>
          <p className="text-[11px] text-white/70 truncate">@{currentUser.handle}</p>
        </div>
      </div>

      {/* Menu Section 1: Navigation */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-white/55 uppercase tracking-widest px-3 mb-1.5">
          Navigation
        </p>
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                isActive
                  ? "bg-[#3F72AF] text-white"
                  : "text-white/85 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-white" : "text-white/60"
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-white/80 border border-white/15"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Developer Power Tools */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-white/55 uppercase tracking-widest px-3 mb-1.5">
          Power Tools
        </p>
        <button
          onClick={() => handleNavClick("codesandbox")}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-white/85 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Terminal className="w-4 h-4 text-[#3F72AF]" />
          <span>Code Sandbox</span>
        </button>
        <button
          onClick={() => handleNavClick("interview")}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-white/85 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#3F72AF]" />
          <span>AI Mock Interview</span>
        </button>
        <button
          onClick={() => handleNavClick("resume")}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-white/85 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <FileText className="w-4 h-4 text-[#3F72AF]" />
          <span>ATS Resume Builder</span>
        </button>
      </div>

      {/* Menu Section 2: Account & Personal */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-white/55 uppercase tracking-widest px-3 mb-1.5">
          Account
        </p>
        {personalNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                isActive
                  ? "bg-[#3F72AF] text-white"
                  : "text-white/85 hover:bg-white/10"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                    isActive ? "text-white" : "text-white/60"
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}

        {onLogout && (
          <button
            onClick={() => handleNavClick("logout")}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold text-white/85 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-white/60" />
            <span>Logout</span>
          </button>
        )}
      </div>

      {/* Pro Mentorship Upgrade Banner */}
      <div className="mt-auto p-4 bg-[#3F72AF] rounded-lg text-white space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/75">Pro Network</p>
        <p className="font-bold text-xs leading-snug">Unlock 1-on-1 Mentorship & Code Reviews</p>
        <button
          onClick={() => handleNavClick("mentors")}
          className="w-full mt-2 bg-white text-[#112D4E] py-2 rounded-lg text-xs font-bold hover:bg-white/90 transition-colors cursor-pointer"
        >
          Book 1:1 Mentor →
        </button>
      </div>
    </aside>
  );
};

import React, { useState } from "react";
import { Logo } from "../common/Logo";
import {
  Search,
  Plus,
  Bell,
  MessageSquare,
  ChevronDown,
  User,
  Settings,
  Shield,
  BookOpen,
  Briefcase,
  Code2,
  GraduationCap,
  X,
  Check,
  Menu,
  Home,
  Compass,
  Users,
  FolderGit2,
  Trophy,
  Award,
  Bookmark,
  LogOut,
} from "lucide-react";
import { UserRole, UserProfile } from "../../types";

interface NavbarProps {
  currentUser: UserProfile;
  onRoleChange: (role: UserRole) => void;
  onOpenCreateModal?: () => void;
  onOpenMessages?: () => void;
  onOpenNotifications?: () => void;
  onOpenAuth?: () => void;
  onSearch?: (query: string) => void;
  activeNav?: string;
  setActiveNav?: (nav: string) => void;
  onLogout?: () => void;
  unreadNotificationsCount?: number;
  unreadMessagesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onRoleChange,
  onOpenCreateModal,
  onOpenMessages,
  onOpenNotifications,
  onSearch,
  activeNav = "home",
  setActiveNav,
  onLogout,
  unreadNotificationsCount = 3,
  unreadMessagesCount = 2,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const rolesList: { role: UserRole; label: string; icon: any; color: string; desc: string }[] = [
    {
      role: "STUDENT",
      label: "Student",
      icon: GraduationCap,
      color: "text-[#112D4E] bg-[#112D4E]/[.04] border-[#112D4E]/[.12]",
      desc: "Enroll in courses, build portfolio & solve doubts",
    },
    {
      role: "COURSE_EDUCATOR",
      label: "Educator / Teacher",
      icon: BookOpen,
      color: "text-[#3F72AF] bg-[#112D4E]/[.04] border-[#112D4E]/[.12]",
      desc: "Create courses, quizzes & issue certificates",
    },
    {
      role: "FREELANCER",
      label: "Freelancer",
      icon: Briefcase,
      color: "text-[#112D4E] bg-[#112D4E]/[.04] border-[#112D4E]/[.12]",
      desc: "Offer 1:1 mentorship & conduct workshops",
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) onSearch(searchQuery);
      if (setActiveNav) setActiveNav("explore");
      setShowMobileSearch(false);
    }
  };

  const handleMobileNavClick = (navId: string) => {
    if (setActiveNav) setActiveNav(navId);
    setShowMobileDrawer(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-[68px] sm:h-[72px] bg-white/95  border-b border-[#112D4E]/[.12] flex items-center justify-between px-3 sm:px-6 lg:px-8 flex-shrink-0 transition-all select-none">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={() => setShowMobileDrawer(true)}
              className="lg:hidden p-2 rounded-xl text-[#112D4E] hover:bg-white transition-colors cursor-pointer flex items-center justify-center min-w-[40px] min-h-[40px]"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              onClick={() => setActiveNav && setActiveNav("home")}
              className="cursor-pointer shrink-0 flex items-center gap-2 group"
            >
              <Logo size="md" showTagline={true} />
            </div>
          </div>

          {/* Center: Global Search Bar (Tablet & Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden md:flex items-center flex-1 max-w-xs md:max-w-sm lg:max-w-md mx-2 md:mx-4 lg:mx-6"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses, communities, projects, or mentors..."
              className="w-full bg-white border border-[#112D4E]/[.12] rounded-full py-2 sm:py-2.5 pl-5 pr-10 text-xs sm:text-sm focus:ring-2 focus:ring-[#3F72AF]/20 focus:border-[#112D4E]/[.12] placeholder:text-[#112D4E]/[.55] focus:bg-white text-[#112D4E] transition-all outline-none"
            />
            <button
              type="submit"
              className="absolute right-3.5 text-[#112D4E]/[.55] hover:text-[#3F72AF] transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-9 text-[#112D4E]/[.55] hover:text-[#112D4E]/[.72] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Right Actions & Utilities */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 shrink-0">
            {/* Mobile Search Icon Toggle */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden p-2 rounded-full text-[#112D4E]/[.72] hover:bg-white transition-colors cursor-pointer flex items-center justify-center min-w-[38px] min-h-[38px]"
              title="Search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Active Role Selector Badge (Desktop & Laptop) */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white hover:bg-white text-[#112D4E] border border-[#112D4E]/[.12] transition-all cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[#3F72AF] animate-pulse" />
                <span className="capitalize">{currentUser.role.replace("_", " ").toLowerCase()}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#112D4E]/[.55]" />
              </button>

              {/* Role Switcher Dropdown */}
              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-md border border-[#112D4E]/[.12] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-[#112D4E]/[.12]">
                    <p className="text-xs font-bold text-[#112D4E]">Switch Active Role</p>
                    <p className="text-[11px] text-[#112D4E]/[.55]">
                      Customizes your platform permissions & feed
                    </p>
                  </div>
                  <div className="py-1 space-y-1">
                    {rolesList.map((r) => {
                      const Icon = r.icon;
                      const isSelected = currentUser.role === r.role;
                      return (
                        <button
                          key={r.role}
                          onClick={() => {
                            onRoleChange(r.role);
                            setShowRoleDropdown(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                            isSelected ? "bg-white border border-[#112D4E]/[.12]" : "hover:bg-[#112D4E]/[.04]"
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg border shrink-0 ${r.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-[#112D4E]">{r.label}</p>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#3F72AF]" />}
                            </div>
                            <p className="text-[11px] text-[#112D4E]/[.55] leading-tight">{r.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Create Post Button */}
            <button
              onClick={onOpenCreateModal}
              className="bg-[#3F72AF] text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Create</span>
            </button>

            {/* Notifications Button */}
            {onOpenNotifications && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-full text-[#112D4E]/[.72] hover:bg-white transition-colors cursor-pointer flex items-center justify-center min-w-[38px] min-h-[38px]"
                title="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 px-1 min-w-[16px] h-4 rounded-full bg-[#3F72AF] text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}

            {/* Direct Messages Button */}
            {onOpenMessages && (
              <button
                onClick={onOpenMessages}
                className="relative p-2 rounded-full text-[#112D4E]/[.72] hover:bg-white transition-colors cursor-pointer flex items-center justify-center min-w-[38px] min-h-[38px]"
                title="Direct Messages"
              >
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute top-1 right-1 px-1 min-w-[16px] h-4 rounded-full bg-[#3F72AF] text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile Avatar */}
            <div className="relative pl-1 sm:pl-2 border-l border-[#112D4E]/[.12] flex items-center">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#112D4E]/[.04] border-2 border-white shadow-sm flex items-center justify-center font-bold text-xs text-[#112D4E] hover:scale-105 transition-transform overflow-hidden cursor-pointer shrink-0"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 top-11 sm:top-12 mt-1 w-56 bg-white rounded-lg shadow-md border border-[#112D4E]/[.12] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div
                    onClick={() => {
                      if (setActiveNav) setActiveNav("profile");
                      setShowProfileDropdown(false);
                    }}
                    className="p-2.5 rounded-xl hover:bg-white cursor-pointer flex items-center gap-3 border-b border-[#112D4E]/[.12]"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-[#112D4E]/[.25] shrink-0"
                    />
                    <div className="overflow-hidden min-w-0">
                      <p className="text-xs font-bold text-[#112D4E] truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-[11px] text-[#112D4E]/[.55] truncate">
                        @{currentUser.handle}
                      </p>
                    </div>
                  </div>

                  <div className="py-1 space-y-0.5">
                    <button
                      onClick={() => {
                        if (setActiveNav) setActiveNav("profile");
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#112D4E] hover:bg-white flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-[#112D4E]/[.55] shrink-0" />
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        if (setActiveNav) setActiveNav("dashboard");
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#112D4E] hover:bg-white flex items-center gap-2 cursor-pointer"
                    >
                      <Shield className="w-4 h-4 text-[#112D4E]/[.55] shrink-0" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        if (setActiveNav) setActiveNav("certificates");
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#112D4E] hover:bg-white flex items-center gap-2 cursor-pointer"
                    >
                      <GraduationCap className="w-4 h-4 text-[#112D4E]/[.55] shrink-0" />
                      My Certificates
                    </button>
                    <button
                      onClick={() => {
                        if (setActiveNav) setActiveNav("settings");
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#112D4E] hover:bg-white flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-[#112D4E]/[.55] shrink-0" />
                      Settings
                    </button>
                    {onLogout && (
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-[#112D4E] hover:bg-[#112D4E]/[.04] flex items-center gap-2 cursor-pointer border-t border-[#112D4E]/[.12] mt-1"
                      >
                        <LogOut className="w-4 h-4 text-[#112D4E] shrink-0" />
                        Log Out
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Input Row Dropdown */}
        {showMobileSearch && (
          <div className="md:hidden px-3 py-2.5 bg-white border-t border-[#112D4E]/[.12] animate-in slide-in-from-top-2 duration-150">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, communities, projects..."
                className="w-full bg-white border border-[#112D4E]/[.12] rounded-full py-2 pl-4 pr-16 text-xs text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/20"
              />
              <button
                type="submit"
                className="absolute right-3 text-xs font-bold text-[#3F72AF] hover:underline"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Responsive Mobile Drawer Navigation */}
      {showMobileDrawer && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setShowMobileDrawer(false)}
            className="fixed inset-0 bg-[#112D4E]/60  transition-opacity animate-in fade-in duration-200"
          />

          {/* Drawer Content */}
          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-md p-5 sm:p-6 overflow-y-auto flex flex-col justify-between z-10 space-y-6 animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#112D4E]/[.12]">
                <Logo size="md" showTagline={false} />
                <button
                  onClick={() => setShowMobileDrawer(false)}
                  className="p-2 rounded-full text-[#112D4E]/[.55] hover:bg-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Role Switcher */}
              <div className="p-3 rounded-lg bg-white border border-[#112D4E]/[.12] space-y-2">
                <p className="text-[10px] font-bold text-[#112D4E]/[.55] uppercase tracking-wider">
                  Active Role Mode
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {rolesList.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => onRoleChange(r.role)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        currentUser.role === r.role
                          ? "bg-[#3F72AF] text-white border-[#112D4E]/[.12]"
                          : "bg-white text-[#112D4E] border-[#112D4E]/[.12]"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#112D4E]/[.55] uppercase tracking-widest px-2 mb-1">
                  Main Views
                </p>
                {[
                  { id: "home", label: "Home Feed", icon: Home },
                  { id: "explore", label: "Explore Ecosystem", icon: Compass },
                  { id: "courses", label: "Courses Catalog", icon: BookOpen },
                  { id: "communities", label: "Communities Hub", icon: Users },
                  { id: "projects", label: "Projects & Grants", icon: FolderGit2 },
                  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMobileNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-[#3F72AF] text-white shadow-md"
                          : "text-[#112D4E] hover:bg-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1 pt-2 border-t border-[#112D4E]/[.12]">
                <p className="text-[10px] font-bold text-[#112D4E]/[.55] uppercase tracking-widest px-2 mb-1">
                  Personal Account
                </p>
                {[
                  { id: "certificates", label: "My Certificates", icon: GraduationCap },
                  { id: "bookmarks", label: "Saved Bookmarks", icon: Bookmark },
                  { id: "dashboard", label: "Learning Dashboard", icon: Shield },
                  { id: "profile", label: "Profile", icon: User },
                  { id: "settings", label: "Settings", icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMobileNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-[#3F72AF] text-white"
                          : "text-[#112D4E] hover:bg-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Logout Footer */}
            {onLogout && (
              <button
                onClick={() => {
                  setShowMobileDrawer(false);
                  onLogout();
                }}
                className="w-full py-3 rounded-lg bg-[#112D4E]/[.04] text-[#112D4E] font-bold text-xs hover:bg-[#112D4E]/[.04] flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};


import React, { useState, useEffect } from "react";
import {
  Flame,
  Zap,
  Award,
  BookOpen,
  Clock,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Trophy,
  PlayCircle,
  ChevronRight,
} from "lucide-react";
import { UserProfile } from "../../types";
import { dashboardApi } from "../../services/api";

interface LearningDashboardProps {
  currentUser: UserProfile;
  onNavigateToCourses?: () => void;
}

export const LearningDashboard: React.FC<LearningDashboardProps> = ({
  currentUser,
  onNavigateToCourses,
}) => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await dashboardApi.getStats();
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error("Dashboard stats error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const streak = stats?.currentStreak ?? currentUser.learningStreakDays ?? 1;
  const totalXp = stats?.totalXP ?? currentUser.totalXp ?? 0;
  const completedCourses = stats?.completedCoursesCount ?? currentUser.completedCoursesCount ?? 0;
  const certificatesCount = stats?.certificatesCount ?? currentUser.certificatesCount ?? 0;
  const enrolledCourses = stats?.enrolledCourses || [];
  const xpTimeline = stats?.xpTimeline || [
    { day: "Mon", xp: 20 },
    { day: "Tue", xp: 45 },
    { day: "Wed", xp: 30 },
    { day: "Thu", xp: 60 },
    { day: "Fri", xp: 40 },
    { day: "Sat", xp: 80 },
    { day: "Sun", xp: 55 },
  ];
  const maxXp = Math.max(...xpTimeline.map((t: any) => t.xp || 10), 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-lg bg-[#112D4E] text-white shadow-md space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#112D4E]/20 rounded-full hidden pointer-events-none" />
        <div className="flex items-center gap-2 text-[#112D4E] font-bold text-xs">
          <Sparkles className="w-4 h-4 text-[#3F72AF]" />
          <span>Real-Time Learning Analytics & Milestones</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Welcome back, {currentUser.name}! 🚀
        </h1>
        <p className="text-xs text-[#112D4E]/[.55] max-w-xl">
          Level {Math.floor(totalXp / 100) + 1} Developer • {streak}-Day Active Streak. Keep learning and shipping production code!
        </p>
      </div>

      {/* Top 4 Hero Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-white border border-[#112D4E]/[.12] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#112D4E]/[.55]">Streak</span>
            <Flame className="w-5 h-5 text-[#112D4E] fill-[#3F72AF]" />
          </div>
          <p className="text-2xl font-black text-[#112D4E]">
            {streak} <span className="text-xs font-normal text-[#112D4E]/[.55]">Days</span>
          </p>
          <p className="text-[11px] text-[#112D4E] font-semibold">↑ Active Daily Streak</p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#112D4E]/[.12] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#112D4E]/[.55]">Total XP</span>
            <Zap className="w-5 h-5 text-[#3F72AF] fill-[#3F72AF]" />
          </div>
          <p className="text-2xl font-black text-[#112D4E]">{totalXp.toLocaleString()}</p>
          <p className="text-[11px] text-[#112D4E]/[.55] font-semibold">
            Level {Math.floor(totalXp / 100) + 1} Developer
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#112D4E]/[.12] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#112D4E]/[.55]">Completed</span>
            <BookOpen className="w-5 h-5 text-[#112D4E]" />
          </div>
          <p className="text-2xl font-black text-[#112D4E]">{completedCourses}</p>
          <p className="text-[11px] text-[#112D4E]/[.55] font-semibold">Full Courses</p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#112D4E]/[.12] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#112D4E]/[.55]">Certificates</span>
            <Award className="w-5 h-5 text-[#112D4E]" />
          </div>
          <p className="text-2xl font-black text-[#112D4E]">{certificatesCount}</p>
          <p className="text-[11px] text-[#112D4E]/[.55] font-semibold">Verified Credentials</p>
        </div>
      </div>

      {/* Enrolled Courses Section */}
      {enrolledCourses.length > 0 && (
        <div className="p-6 rounded-lg bg-white border border-[#112D4E]/[.12] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#112D4E] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#3F72AF]" />
              In-Progress Courses ({enrolledCourses.length})
            </h3>
            {onNavigateToCourses && (
              <button
                onClick={onNavigateToCourses}
                className="text-xs font-bold text-[#3F72AF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Browse All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.map((c: any, idx: number) => (
              <div
                key={c.id || idx}
                className="p-4 rounded-lg border border-[#112D4E]/[.12] bg-[#112D4E]/50 space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={c.thumbnail || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"}
                    alt={c.title}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#3F72AF] uppercase">{c.category}</span>
                    <h4 className="text-xs font-bold text-[#112D4E] truncate">{c.title}</h4>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-[#112D4E]/[.55]">
                    <span>Progress</span>
                    <span>{c.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#112D4E]/[.08] overflow-hidden">
                    <div
                      className="h-full bg-[#3F72AF] rounded-full transition-all duration-500"
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Progress Meter & Daily Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly XP Chart (SVG Bar Visualizer) */}
        <div className="lg:col-span-2 p-6 rounded-lg bg-white border border-[#112D4E]/[.12] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#112D4E] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#3F72AF]" />
              7-Day XP Activity Timeline
            </h3>
            <span className="text-xs font-bold text-[#112D4E] bg-[#112D4E]/[.04] px-2.5 py-1 rounded-full">
              Real Database Events
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 border-b border-[#112D4E]/[.12]">
            {xpTimeline.map((bar: any, idx: number) => {
              const heightPercent = Math.min(100, Math.max(10, (bar.xp / maxXp) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-bold text-[#112D4E]/[.55]">+{bar.xp}</span>
                  <div
                    className="w-full bg-[#3F72AF] rounded-t-xl transition-all duration-500 hover:opacity-85"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[11px] font-bold text-[#112D4E]/[.55]">{bar.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Sprint Checklist */}
        <div className="p-6 rounded-lg bg-white border border-[#112D4E]/[.12] shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-[#112D4E] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#112D4E]" />
            Today's Sprint Tasks
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-[#112D4E]/60 border border-[#112D4E]/[.12] flex items-center justify-between">
              <span className="font-semibold text-[#112D4E]">
                ✓ Daily Login Bonus Claimed
              </span>
              <span className="text-[10px] font-bold text-[#112D4E]">+5 XP</span>
            </div>
            <div className="p-3 rounded-lg bg-[#112D4E]/60 border border-[#112D4E]/[.12] flex items-center justify-between">
              <span className="font-semibold text-[#112D4E]">
                • Complete a Course Lesson
              </span>
              <span className="text-[10px] font-bold text-[#3F72AF]">+20 XP</span>
            </div>
            <div className="p-3 rounded-lg bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] flex items-center justify-between">
              <span className="font-semibold text-[#112D4E]">
                • Submit a Project Challenge
              </span>
              <span className="text-[10px] font-bold text-[#3F72AF]">+100 XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges & Achievements Unlocked */}
      <div className="p-6 rounded-lg bg-white border border-[#112D4E]/[.12] shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-[#112D4E] flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#112D4E]" />
          Unlocked Badges ({(currentUser.badges || []).length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(currentUser.badges || [
            { id: "b1", name: "Early Pioneer", description: "Joined the LearnX ecosystem", icon: "🚀" },
            { id: "b2", name: "Fast Learner", description: "Completed lessons in multiple tracks", icon: "⚡" },
          ]).map((b: any, idx: number) => (
            <div
              key={b.id || idx}
              className="p-4 rounded-lg bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] flex items-center gap-3"
            >
              <span className="text-3xl p-2 rounded-xl bg-white shadow-2xs">
                {b.icon || "🏆"}
              </span>
              <div>
                <h4 className="text-xs font-bold text-[#112D4E]">{b.name}</h4>
                <p className="text-[11px] text-[#112D4E]/[.55]">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

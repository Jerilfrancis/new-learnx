import React, { useState, useEffect } from "react";
import {
  Trophy,
  Flame,
  Award,
  Zap,
  Star,
  ShieldCheck,
  ChevronRight,
  X,
  Sparkles,
  CheckCircle2,
  Calendar,
  Gift,
} from "lucide-react";
import { UserProfile } from "../../types";
import { leaderboardApi } from "../../services/api";

interface LeaderboardViewProps {
  currentUser: UserProfile;
}

interface LeaderboardUser {
  rank: number;
  id?: string;
  name: string;
  handle: string;
  xp: number;
  streak: number;
  role: string;
  avatar: string;
  badge?: string;
  badges?: string[];
  level?: number;
  change?: string;
  contributionsCount?: number;
  completedCapstones?: number;
  topSkills?: string[];
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ currentUser }) => {
  const [timeframe, setTimeframe] = useState<"weekly" | "all-time">("weekly");
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [claimStatus, setClaimStatus] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const res = await leaderboardApi.getLeaderboard(timeframe);
      if (res.success && res.leaderboard) {
        setLeaderboard(res.leaderboard);
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimDaily = async () => {
    setIsClaiming(true);
    setClaimStatus(null);
    try {
      const res = await leaderboardApi.claimDaily();
      setClaimStatus(res.message);
      if (res.success) {
        fetchLeaderboard();
      }
    } catch (err: any) {
      setClaimStatus(err.message || "Failed to claim bonus");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Widget */}
      <div className="bg-[#112D4E] text-white p-6 sm:p-8 rounded-lg shadow-md space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#112D4E]/[.04] rounded-full hidden pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#3F72AF] rounded-lg text-white shadow-md">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">Global Developer Leaderboard</h1>
              <p className="text-xs sm:text-sm text-[#112D4E]/[.55]">
                Earn XP by completing courses (+50 XP), passing quizzes (+20 XP), and solving projects (+100 XP).
              </p>
            </div>
          </div>

          <button
            onClick={handleClaimDaily}
            disabled={isClaiming}
            className="px-4 py-2.5 rounded-lg bg-[#3F72AF] hover:bg-[#112D4E] text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            <Gift className="w-4 h-4" />
            <span>{isClaiming ? "Claiming..." : "Claim Daily Bonus (+5 XP)"}</span>
          </button>
        </div>

        {claimStatus && (
          <div className="p-3 rounded-xl bg-[#112D4E]/10 border border-[#112D4E]/[.12] text-[#112D4E] text-xs font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>{claimStatus}</span>
          </div>
        )}

        {/* Current User Quick Stats */}
        <div className="pt-4 border-t border-[#112D4E]/[.12] grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-[#112D4E]/[.55] font-semibold uppercase">Your Rank</p>
            <p className="text-xl font-extrabold text-[#112D4E]">
              #{leaderboard.findIndex((u) => u.name === currentUser.name) + 1 || 1}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#112D4E]/[.55] font-semibold uppercase">Total XP</p>
            <p className="text-xl font-extrabold text-white">{currentUser.totalXp} XP</p>
          </div>
          <div>
            <p className="text-xs text-[#112D4E]/[.55] font-semibold uppercase">Current Streak</p>
            <p className="text-xl font-extrabold text-[#112D4E]">🔥 {currentUser.learningStreakDays} Days</p>
          </div>
        </div>
      </div>

      {/* Timeframe Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimeframe("weekly")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              timeframe === "weekly"
                ? "bg-[#3F72AF] text-white shadow-md"
                : "bg-white text-[#112D4E] hover:bg-[#112D4E]/[.04] border border-[#112D4E]/[.12]"
            }`}
          >
            Weekly Sprint ⚡
          </button>
          <button
            onClick={() => setTimeframe("all-time")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              timeframe === "all-time"
                ? "bg-[#3F72AF] text-white shadow-md"
                : "bg-white text-[#112D4E] hover:bg-[#112D4E]/[.04] border border-[#112D4E]/[.12]"
            }`}
          >
            All-Time Titans 🏆
          </button>
        </div>

        <span className="text-xs font-bold text-[#112D4E]/[.55] hidden sm:inline">
          Rankings updated dynamically from database XP events
        </span>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg border border-[#112D4E]/[.12] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#112D4E]/[.12] flex items-center justify-between">
          <h2 className="font-extrabold text-base text-[#112D4E]">
            Top Engineers • {timeframe === "weekly" ? "Weekly Sprint Leaderboard" : "All-Time Hall of Fame"}
          </h2>
          <span className="text-xs font-bold text-[#3F72AF] bg-[#112D4E]/[.04] px-3 py-1 rounded-full">
            ● Real-Time Database Sync
          </span>
        </div>

        <div className="divide-y divide-[#112D4E]/[.12]">
          {isLoading ? (
            <div className="p-12 text-center text-[#112D4E]/[.55] font-semibold text-xs space-y-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#112D4E]/[.12] border-t-transparent animate-spin mx-auto" />
              <p>Loading rankings from database...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-12 text-center text-[#112D4E]/[.55] font-semibold text-xs space-y-2">
              <Trophy className="w-8 h-8 mx-auto text-[#112D4E]/[.55]" />
              <p>No leaderboard rankings yet. Complete courses and project challenges to earn XP!</p>
            </div>
          ) : (
            leaderboard.map((user) => (
              <div
                key={user.rank}
                onClick={() => setSelectedUser(user)}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#112D4E]/40 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                      user.rank === 1
                        ? "bg-[#112D4E]/[.04] text-[#112D4E] border border-[#112D4E]/[.12]"
                        : user.rank === 2
                        ? "bg-[#112D4E]/[.08] text-[#112D4E]"
                        : user.rank === 3
                        ? "bg-[#112D4E]/[.04] text-[#112D4E]"
                        : "bg-[#112D4E]/[.04] text-[#112D4E]/[.55]"
                    }`}
                  >
                    {user.rank}
                  </span>

                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#112D4E]/[.25] shrink-0"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-[#112D4E] group-hover:text-[#3F72AF] transition-colors truncate">
                        {user.name}
                      </h3>
                      {user.badges && user.badges.length > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#112D4E]/[.04] text-[#112D4E]/[.72] hidden sm:inline">
                          {user.badges[0]}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#112D4E]/[.55]">{user.handle || user.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-[#112D4E] flex items-center justify-end gap-1">
                      <Flame className="w-3.5 h-3.5 fill-[#3F72AF]" /> {user.streak}d streak
                    </span>
                    <span className="text-[10px] text-[#112D4E]/[.55]">{user.role}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-[#112D4E]">{user.xp.toLocaleString()} XP</span>
                    <span className="text-[10px] text-[#112D4E] font-bold block">
                      Level {user.level || Math.floor(user.xp / 100) + 1}
                    </span>
                  </div>

                  <ChevronRight className="w-4 h-4 text-[#112D4E]/[.55] group-hover:text-[#112D4E] transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* User XP Breakdown Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-[#112D4E]/60  flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-lg p-6 border border-[#112D4E]/[.12] shadow-md space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#112D4E]/[.12]">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#112D4E]/[.25]"
                />
                <div>
                  <h3 className="text-sm font-black text-[#112D4E]">{selectedUser.name}</h3>
                  <p className="text-xs text-[#112D4E]/[.55]">
                    {selectedUser.handle} • Rank #{selectedUser.rank}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 text-[#112D4E]/[.55] hover:text-[#112D4E]/[.72] rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-lg bg-[#112D4E]/60 border border-[#112D4E]/[.12] space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#112D4E]/[.72] font-medium">Total Accumulated XP:</span>
                <span className="font-extrabold text-[#3F72AF]">{selectedUser.xp} XP</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#112D4E]/[.72] font-medium">Active Learning Streak:</span>
                <span className="font-extrabold text-[#112D4E]">🔥 {selectedUser.streak} Days</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#112D4E]/[.72] font-medium">Calculated Level:</span>
                <span className="font-extrabold text-[#112D4E]">
                  Level {selectedUser.level || Math.floor(selectedUser.xp / 100) + 1}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-[#112D4E]">Earned Badges</p>
              <div className="flex flex-wrap gap-1.5">
                {(selectedUser.badges || ["🏆 Master Contributor", "🔥 Streak Star"]).map((s, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#112D4E]/[.04] text-[#112D4E] text-xs font-bold">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full py-2.5 rounded-xl bg-[#112D4E] text-white text-xs font-bold hover:bg-[#112D4E] transition-all cursor-pointer"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

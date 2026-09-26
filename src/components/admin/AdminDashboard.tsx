import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Users,
  BookOpen,
  Award,
  Search,
  Filter,
  Ban,
  CheckCircle,
  TrendingUp,
  RefreshCw,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { adminApi } from "../../services/api";

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedRole]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(searchQuery || undefined, selectedRole !== "ALL" ? selectedRole : undefined),
      ]);
      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsers(usersRes.users);
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await adminApi.updateRole(userId, newRole);
      if (res.success) {
        setActionMsg(res.message);
        fetchData();
      }
    } catch (err: any) {
      setActionMsg(err.message || "Failed to update role");
    }
  };

  const handleToggleBan = async (userId: string) => {
    try {
      const res = await adminApi.toggleBan(userId);
      if (res.success) {
        setActionMsg(res.message);
        fetchData();
      }
    } catch (err: any) {
      setActionMsg(err.message || "Failed to toggle ban status");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-lg bg-[#112D4E] text-white shadow-md space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#112D4E]/20 rounded-full hidden pointer-events-none" />
        <div className="flex items-center gap-2 text-[#112D4E] font-bold text-xs">
          <ShieldAlert className="w-4 h-4 text-[#3F72AF]" />
          <span>System Administration & Platform Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          LearnX Executive Portal
        </h1>
        <p className="text-xs text-[#112D4E]/[.55] max-w-xl">
          Supervise user governance, promote verified educators/distributors, review course enrollments, and track live ecosystem analytics.
        </p>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-lg bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] text-[#112D4E] text-xs font-bold flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-[#112D4E] font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Platform Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-white border border-[#112D4E]/[.12] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#112D4E]/[.55]">Total Users</span>
            <Users className="w-5 h-5 text-[#3F72AF]" />
          </div>
          <p className="text-2xl font-black text-[#112D4E]">
            {(stats?.totalUsers ?? 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-[#112D4E] font-semibold">
            ● {stats?.activeUsersDaily ?? 0} Daily Active Users
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#112D4E]/[.12] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#112D4E]/[.55]">Published Courses</span>
            <BookOpen className="w-5 h-5 text-[#112D4E]" />
          </div>
          <p className="text-2xl font-black text-[#112D4E]">{stats?.totalCourses ?? 0}</p>
          <p className="text-[11px] text-[#112D4E]/[.55] font-semibold">
            {(stats?.totalEnrollments ?? 0).toLocaleString()} Total Enrollments
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#112D4E]/[.12] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#112D4E]/[.55]">Certificates Issued</span>
            <Award className="w-5 h-5 text-[#112D4E]" />
          </div>
          <p className="text-2xl font-black text-[#112D4E]">{stats?.totalCertificates ?? 0}</p>
          <p className="text-[11px] text-[#112D4E] font-semibold">100% QR Verifiable</p>
        </div>

      </div>

      {/* User Governance Section */}
      <div className="bg-white rounded-lg border border-[#112D4E]/[.12] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#112D4E]/[.12] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-extrabold text-base text-[#112D4E]">User Governance & Access Control</h2>
            <p className="text-xs text-[#112D4E]/[.55]">Manage user roles, privileges, and ban restrictions</p>
          </div>

          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user name or email..."
                className="text-xs pl-8 pr-4 py-2 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none focus:ring-2 focus:ring-[#3F72AF] w-56"
              />
              <Search className="w-3.5 h-3.5 text-[#112D4E]/[.55] absolute left-2.5 top-3" />
            </form>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="p-2 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] text-xs font-bold focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="COURSE_EDUCATOR">Course Educators</option>
              <option value="FREELANCER">Freelancers</option>
              <option value="DISTRIBUTOR">Distributors</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#112D4E]/[.04] text-[#112D4E]/[.55] font-bold uppercase text-[10px] border-b border-[#112D4E]/[.12]">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Current Role</th>
                <th className="p-4">XP & Level</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#112D4E]/[.12]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#112D4E]/[.55]">
                    <div className="w-6 h-6 rounded-full border-2 border-[#112D4E]/[.12] border-t-transparent animate-spin mx-auto mb-2" />
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#112D4E]/[.55] font-semibold">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id || u.id} className="hover:bg-[#112D4E]/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.email || "user")}`
                          }
                          alt="Avatar"
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-[#112D4E]/[.25]"
                        />
                        <div>
                          <p className="font-bold text-[#112D4E]">{u.name || "Anonymous User"}</p>
                          <p className="text-[11px] text-[#112D4E]/[.55]">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <select
                        value={u.role || "STUDENT"}
                        onChange={(e) => handleRoleChange(u._id || u.id, e.target.value)}
                        className="p-1.5 rounded-lg bg-white border border-[#112D4E]/[.12] text-xs font-bold focus:outline-none"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="COURSE_EDUCATOR">COURSE_EDUCATOR</option>
                        <option value="FREELANCER">FREELANCER</option>
                        <option value="DISTRIBUTOR">DISTRIBUTOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>

                    <td className="p-4 font-semibold text-[#112D4E]">
                      <span>{(u.xp || 100).toLocaleString()} XP</span>
                      <span className="text-[10px] text-[#112D4E] font-bold block">
                        Level {Math.floor((u.xp || 100) / 100) + 1}
                      </span>
                    </td>

                    <td className="p-4">
                      {u.isBanned ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#112D4E]/[.04] text-[#112D4E] font-bold text-[10px]">
                          Banned
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-[#112D4E]/[.04] text-[#112D4E] font-bold text-[10px]">
                          Active
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleBan(u._id || u.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                          u.isBanned
                            ? "bg-[#112D4E]/[.04] text-[#112D4E] hover:bg-[#112D4E]/[.04]"
                            : "bg-[#112D4E]/[.04] text-[#112D4E] hover:bg-[#112D4E]/[.04]"
                        }`}
                      >
                        {u.isBanned ? "Unban User" : "Ban User"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { User, Lock, Bell, Shield, Moon, LogOut, Check, Save, UploadCloud } from "lucide-react";
import { UserProfile } from "../../types";
import { authApi, uploadApi } from "../../services/api";

interface SettingsViewProps {
  currentUser: UserProfile;
  onLogout: () => void;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onLogout,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [handle, setHandle] = useState(currentUser.handle);
  const [bio, setBio] = useState(currentUser.bio || "Full stack developer & learner.");
  const [company, setCompany] = useState(currentUser.companyOrInstitute || "Tech Institute");
  const [email, setEmail] = useState(currentUser.email || "alex.vance@codeinfinite.dev");
  const [avatar, setAvatar] = useState(currentUser.avatar || "");
  const [isUploading, setIsUploading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Notification Toggles
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [courseUpdates, setCourseUpdates] = useState(true);
  const [dmNotifs, setDmNotifs] = useState(true);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData = {
      name,
      handle,
      bio,
      companyOrInstitute: company,
      avatar,
    };

    try {
      await authApi.updateProfile(updatedData);
    } catch (err) {
      console.error("Profile update sync error:", err);
    }

    if (onUpdateProfile) {
      onUpdateProfile(updatedData);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-[#112D4E]/[.12] shadow-sm space-y-2">
        <h1 className="text-2xl font-extrabold text-[#112D4E]">Account Settings</h1>
        <p className="text-xs text-[#112D4E]/[.55]">Manage your profile, security credentials, and preferences.</p>
      </div>

      {/* Profile & Info Settings */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-lg border border-[#112D4E]/[.12] shadow-xs space-y-6">
        <h3 className="font-extrabold text-base text-[#112D4E] flex items-center gap-2 pb-3 border-b border-[#112D4E]/[.12]">
          <User className="w-5 h-5 text-[#3F72AF]" />
          <span>Profile Information</span>
        </h3>

        <div className="flex items-center gap-6 pb-4">
          <img src={avatar || "https://via.placeholder.com/150"} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-[#112D4E]/[.12] shadow-md" />
          <div className="space-y-2">
            <label className="cursor-pointer bg-white border border-[#112D4E]/[.12] px-4 py-2 rounded-xl text-xs font-bold text-[#112D4E] hover:bg-[#112D4E]/[.04] flex items-center gap-2 transition-colors">
              <UploadCloud className="w-4 h-4 text-[#3F72AF]" />
              {isUploading ? "Uploading..." : "Upload Profile Photo"}
              <input type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={async (e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  if (file.size > 5 * 1024 * 1024) return alert("File too large. Max 5MB.");
                  setIsUploading(true);
                  try {
                    const formData = new FormData();
                    formData.append('file', file);
                    const res = await uploadApi.uploadFile(formData);
                    if (res.success) setAvatar(res.url);
                  } catch (err) {
                    alert("Failed to upload image");
                  } finally {
                    setIsUploading(false);
                  }
                }
              }} disabled={isUploading} />
            </label>
            <p className="text-[10px] text-[#112D4E]/[.55] font-semibold">Recommended: Square JPG, PNG, or WEBP, max 5MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
          <div>
            <label className="text-[#112D4E]/[.72] block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-[#112D4E]/[.12] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
            />
          </div>

          <div>
            <label className="text-[#112D4E]/[.72] block mb-1">Username Handle</label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full bg-white border border-[#112D4E]/[.12] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[#112D4E]/[.72] block mb-1">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-white border border-[#112D4E]/[.12] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
            />
          </div>

          <div>
            <label className="text-[#112D4E]/[.72] block mb-1">Company / University</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full bg-white border border-[#112D4E]/[.12] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
            />
          </div>

          <div>
            <label className="text-[#112D4E]/[.72] block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-[#112D4E]/[.12] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <span className="text-xs font-bold text-[#112D4E] flex items-center gap-1">
              <Check className="w-4 h-4" /> Profile Updated Successfully!
            </span>
          ) : <span />}

          <button
            type="submit"
            className="bg-[#3F72AF] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-[#112D4E] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </form>

      {/* Notification Preferences */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-[#112D4E]/[.12] shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-[#112D4E] flex items-center gap-2 pb-3 border-b border-[#112D4E]/[.12]">
          <Bell className="w-5 h-5 text-[#3F72AF]" />
          <span>Notification Preferences</span>
        </h3>

        <div className="space-y-3 text-xs font-semibold text-[#112D4E]">
          <label className="flex items-center justify-between p-3 rounded-xl bg-white cursor-pointer">
            <span>Email digest for new course releases</span>
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="w-4 h-4 accent-[#3F72AF]"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-white cursor-pointer">
            <span>Community replies & mention alerts</span>
            <input
              type="checkbox"
              checked={courseUpdates}
              onChange={(e) => setCourseUpdates(e.target.checked)}
              className="w-4 h-4 accent-[#3F72AF]"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-white cursor-pointer">
            <span>Direct message popup alerts</span>
            <input
              type="checkbox"
              checked={dmNotifs}
              onChange={(e) => setDmNotifs(e.target.checked)}
              className="w-4 h-4 accent-[#3F72AF]"
            />
          </label>
        </div>
      </div>

      {/* Password & Security */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-[#112D4E]/[.12] shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-[#112D4E] flex items-center gap-2 pb-3 border-b border-[#112D4E]/[.12]">
          <Lock className="w-5 h-5 text-[#3F72AF]" />
          <span>Security & Password</span>
        </h3>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as any;
            const currentPassword = form.currentPassword.value;
            const newPassword = form.newPassword.value;
            if (!newPassword || newPassword.length < 6) return alert("New password must be at least 6 chars");
            try {
              const token = localStorage.getItem("ci_token");
              const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: token ? `Bearer ${token}` : "",
                },
                body: JSON.stringify({ currentPassword, newPassword }),
              });
              const data = await res.json();
              if (res.ok) {
                alert("Password updated successfully!");
                form.reset();
              } else {
                alert(data.message || "Failed to update password");
              }
            } catch (err: any) {
              alert(err.message || "Password update error");
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold"
        >
          <div>
            <label className="text-[#112D4E]/[.72] block mb-1">Current Password</label>
            <input
              name="currentPassword"
              type="password"
              placeholder="••••••••"
              className="w-full bg-white border border-[#112D4E]/[.12] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
            />
          </div>
          <div>
            <label className="text-[#112D4E]/[.72] block mb-1">New Password (min 6 characters)</label>
            <input
              name="newPassword"
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-white border border-[#112D4E]/[.12] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              className="bg-[#112D4E] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#112D4E] transition-colors cursor-pointer"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone / Logout & Account Deletion */}
      <div className="bg-[#112D4E]/50 p-6 rounded-lg border border-[#112D4E]/[.12] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-[#3F72AF]">Session & Account Actions</h4>
          <p className="text-xs text-[#112D4E]/[.55]">Sign out of your active session or delete account.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              if (window.confirm("Are you sure you want to permanently delete your LearnX account? This action cannot be undone.")) {
                try {
                  const token = localStorage.getItem("ci_token");
                  await fetch("/api/auth/account", {
                    method: "DELETE",
                    headers: { Authorization: token ? `Bearer ${token}` : "" },
                  });
                  onLogout();
                } catch {
                  onLogout();
                }
              }
            }}
            className="px-4 py-2.5 rounded-xl border border-[#112D4E]/[.12] text-[#112D4E] text-xs font-bold hover:bg-[#112D4E]/[.04] transition-colors cursor-pointer"
          >
            Delete Account
          </button>

          <button
            onClick={onLogout}
            className="bg-[#3F72AF] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#112D4E] transition-colors cursor-pointer flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

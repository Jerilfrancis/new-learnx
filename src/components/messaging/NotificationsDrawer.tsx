import React, { useState } from "react";
import {
  X,
  Bell,
  Heart,
  Award,
  Video,
  FolderGit2,
  Check,
  UserPlus,
  UserCheck,
  UserX,
  Sparkles,
} from "lucide-react";
import { NotificationItem } from "../../types";

interface NotificationsDrawerProps {
  notifications: NotificationItem[];
  onClose: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  notifications: initialNotifications,
  onClose,
}) => {
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<"all" | "follows" | "activity">("all");

  const handleAcceptRequest = (id: string) => {
    setNotificationsList((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              status: "accepted",
              read: true,
              description: `You accepted ${n.user?.name || "this user"}'s follow request. You are now connected!`,
            }
          : n
      )
    );
  };

  const handleDeclineRequest = (id: string) => {
    setNotificationsList((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              status: "declined",
              read: true,
              description: `Follow request declined.`,
            }
          : n
      )
    );
  };

  const handleFollowBack = (id: string) => {
    setNotificationsList((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              status: "following",
              read: true,
              description: `You followed back ${n.user?.name || "this user"}!`,
            }
          : n
      )
    );
  };

  const filteredNotifications = notificationsList.filter((n) => {
    if (activeTab === "follows") {
      return (
        n.type === "follow_request" ||
        n.type === "follow_accept" ||
        n.type === "follow"
      );
    }
    if (activeTab === "activity") {
      return (
        n.type !== "follow_request" &&
        n.type !== "follow_accept" &&
        n.type !== "follow"
      );
    }
    return true;
  });

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "follow_request":
        return <UserPlus className="w-4 h-4 text-[#112D4E]" />;
      case "follow_accept":
        return <UserCheck className="w-4 h-4 text-[#112D4E]" />;
      case "follow":
        return <Sparkles className="w-4 h-4 text-[#112D4E]" />;
      case "like":
        return <Heart className="w-4 h-4 text-[#112D4E] fill-[#3F72AF]" />;
      case "badge":
        return <Award className="w-4 h-4 text-[#112D4E]" />;
      case "live":
        return <Video className="w-4 h-4 text-[#112D4E]" />;
      case "project":
        return <FolderGit2 className="w-4 h-4 text-[#112D4E]" />;
      default:
        return <Bell className="w-4 h-4 text-[#112D4E]/[.55]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#112D4E]/40  flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-md p-5 space-y-4 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#112D4E]/[.12]">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#3F72AF]" />
            <h3 className="text-base font-extrabold text-[#112D4E]">Notifications</h3>
            <span className="px-2 py-0.5 rounded-full bg-[#112D4E]/[.04] text-[#3F72AF] text-[11px] font-bold">
              {notificationsList.filter((n) => !n.read).length} new
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#112D4E]/[.55] hover:text-[#112D4E]/[.72] rounded-full hover:bg-[#112D4E]/[.04] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-[#112D4E]/[.04] p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-white text-[#112D4E] shadow-xs"
                : "text-[#112D4E]/[.55] hover:text-[#112D4E]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("follows")}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === "follows"
                ? "bg-white text-[#3F72AF] shadow-xs"
                : "text-[#112D4E]/[.55] hover:text-[#112D4E]"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Follows
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "activity"
                ? "bg-white text-[#112D4E] shadow-xs"
                : "text-[#112D4E]/[.55] hover:text-[#112D4E]"
            }`}
          >
            Activity
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 space-y-3 overflow-y-auto pr-1 text-xs scrollbar-thin">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-[#112D4E]/[.55] space-y-2">
              <Bell className="w-8 h-8 mx-auto opacity-30" />
              <p>No notifications in this category</p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-lg border transition-all space-y-2.5 ${
                  n.read
                    ? "bg-[#112D4E]/70 border-[#112D4E]/[.12] text-[#112D4E]/[.72]"
                    : "bg-[#112D4E]/40 border-[#112D4E]/[.12] text-[#112D4E] shadow-2xs"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-white shadow-2xs border border-[#112D4E]/[.12]">
                      {getNotificationIcon(n.type)}
                    </div>
                    <h4 className="font-bold text-xs text-[#112D4E]">{n.title}</h4>
                  </div>
                  <span className="text-[10px] text-[#112D4E]/[.55] shrink-0">{n.timeAgo}</span>
                </div>

                {/* User Card inside notification if applicable */}
                {n.user && (
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-[#112D4E]/[.12]">
                    <img
                      src={n.user.avatar}
                      alt={n.user.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-[#112D4E]/[.25] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#112D4E] truncate">{n.user.name}</p>
                      <p className="text-[10px] text-[#112D4E]/[.55] truncate">
                        @{n.user.handle} {n.user.role ? `• ${n.user.role}` : ""}
                      </p>
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-[#112D4E]/[.72] leading-snug">{n.description}</p>

                {/* Interactive Action Buttons for Follow Requests */}
                {n.type === "follow_request" && (
                  <div className="pt-1 flex items-center gap-2">
                    {n.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAcceptRequest(n.id)}
                          className="flex-1 py-1.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white font-bold text-[11px] shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Accept
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(n.id)}
                          className="py-1.5 px-3 rounded-xl bg-[#112D4E]/[.08] hover:bg-[#112D4E]/[.12] text-[#112D4E] font-bold text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <UserX className="w-3.5 h-3.5" /> Decline
                        </button>
                      </>
                    )}
                    {n.status === "accepted" && (
                      <span className="inline-flex items-center gap-1 text-[#112D4E] bg-[#112D4E]/[.04] px-3 py-1 rounded-full font-bold text-[10px]">
                        <Check className="w-3 h-3 stroke-[3]" /> Request Accepted
                      </span>
                    )}
                    {n.status === "declined" && (
                      <span className="text-[#112D4E]/[.55] font-medium text-[10px]">
                        Request declined
                      </span>
                    )}
                  </div>
                )}

                {/* Follow back button for new followers */}
                {n.type === "follow" && (
                  <div className="pt-1">
                    {n.status === "pending" ? (
                      <button
                        onClick={() => handleFollowBack(n.id)}
                        className="py-1.5 px-3 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white font-bold text-[11px] shadow-xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Follow Back
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#112D4E] bg-[#112D4E]/[.04] px-3 py-1 rounded-full font-bold text-[10px]">
                        <UserCheck className="w-3.5 h-3.5" /> Following Back
                      </span>
                    )}
                  </div>
                )}

                {/* Follow Accept Notification Indicator */}
                {n.type === "follow_accept" && (
                  <div className="pt-0.5 flex items-center gap-1 text-[#112D4E] font-bold text-[10px]">
                    <UserCheck className="w-3.5 h-3.5" /> You are connected
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

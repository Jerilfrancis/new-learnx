import React, { useState } from "react";
import {
  Users,
  MessageSquare,
  Plus,
  Check,
  Sparkles,
  TrendingUp,
  Search,
} from "lucide-react";
import { Community, Post } from "../../types";
import { FeedCard } from "../feed/FeedCard";
import { communitiesApi } from "../../services/api";

interface CommunityHubProps {
  communities: Community[];
  posts: Post[];
  onApplyProject?: (title: string) => void;
  onOpenCreateModal: () => void;
}

export const CommunityHub: React.FC<CommunityHubProps> = ({
  communities: initialCommunities,
  posts,
  onApplyProject,
  onOpenCreateModal,
}) => {
  const [communitiesList, setCommunitiesList] = useState<Community[]>(initialCommunities);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleToggleJoin = async (commId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await communitiesApi.toggleJoin(commId);
      if (res.success) {
        setCommunitiesList((prev) =>
          prev.map((c) =>
            c.id === commId
              ? {
                  ...c,
                  isJoined: res.isJoined,
                  membersCount: res.membersCount,
                }
              : c
          )
        );
        return;
      }
    } catch (err) {
      console.error("Error joining community:", err);
    }

    setCommunitiesList((prev) =>
      prev.map((c) =>
        c.id === commId
          ? {
              ...c,
              isJoined: !c.isJoined,
              membersCount: c.isJoined ? c.membersCount - 1 : c.membersCount + 1,
            }
          : c
      )
    );
  };

  const filteredCommunities = communitiesList.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPosts = selectedCommunity
    ? posts.filter((p) => p.communityId === selectedCommunity.id || p.communityName === selectedCommunity.name)
    : posts;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-lg bg-[#112D4E] text-white shadow-sm space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#112D4E]/[.04] rounded-full hidden pointer-events-none" />
        <div className="flex items-center gap-2 text-[#112D4E] font-bold text-xs">
          <Sparkles className="w-4 h-4 text-[#112D4E]" />
          <span>Reddit + Instagram Community Hub</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Join Specialization Hubs & Collaborate
        </h1>
        <p className="text-xs text-[#112D4E]/[.55] max-w-xl">
          Connect with thousands of developers, ask questions, share notes, post open-source challenges, and vote on pinned solutions.
        </p>
      </div>

      {/* Communities Carousel Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[#112D4E] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#3F72AF]" />
            Explore Hubs
          </h2>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#112D4E]/[.55]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter communities..."
              className="text-xs pl-8 pr-3 py-1.5 rounded-full bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none focus:border-[#112D4E]/[.12]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCommunities.map((c) => {
            const isSelected = selectedCommunity?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCommunity(isSelected ? null : c)}
                className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 group ${
                  isSelected
                    ? "bg-[#112D4E]/60 border-[#112D4E]/[.12] ring-2 ring-[#3F72AF]/20 shadow-md"
                    : "bg-white border-[#112D4E]/[.12] hover:border-[#112D4E]/[.12] shadow-xs hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-lg bg-[#112D4E]/[.04] group-hover:scale-110 transition-transform">
                      {c.icon}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-[#112D4E] group-hover:text-[#3F72AF] transition-colors">
                        {c.name}
                      </h3>
                      <p className="text-[11px] text-[#112D4E]/[.55] font-medium">
                        {c.membersCount.toLocaleString()} members • {c.postsCount} posts
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#112D4E]/[.72] line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                <div className="pt-2 border-t border-[#112D4E]/[.12] flex items-center justify-between text-xs">
                  <div className="flex flex-wrap gap-1">
                    {c.tags.slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#112D4E]/[.04] text-[#112D4E]/[.72]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={(e) => handleToggleJoin(c.id, e)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      c.isJoined
                        ? "bg-[#112D4E]/[.04] text-[#112D4E] hover:bg-[#112D4E]/[.08]"
                        : "bg-[#3F72AF] text-white hover:bg-[#112D4E]"
                    }`}
                  >
                    {c.isJoined ? "Joined ✓" : "+ Join Hub"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Community Feed Filter Indicator */}
      {selectedCommunity && (
        <div className="p-3.5 rounded-lg bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] flex items-center justify-between text-xs font-bold text-[#3F72AF]">
          <span>Showing posts inside "{selectedCommunity.name}"</span>
          <button
            onClick={() => setSelectedCommunity(null)}
            className="text-[#112D4E]/[.55] hover:text-[#112D4E] underline cursor-pointer"
          >
            Show All Posts
          </button>
        </div>
      )}

      {/* Community Discussions Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[#112D4E] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#3F72AF]" />
            Community Discussions & Doubts
          </h2>
          <button
            onClick={onOpenCreateModal}
            className="px-3.5 py-1.5 rounded-full bg-[#3F72AF] text-white text-xs font-bold shadow-xs hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Post Question
          </button>
        </div>

        <div className="space-y-5">
          {filteredPosts.map((post) => (
            <FeedCard
              key={post.id}
              post={post}
              onApplyProject={onApplyProject}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

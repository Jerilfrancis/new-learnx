import React, { useState } from "react";
import { Search, Compass, BookOpen, Users, FolderGit2, Trophy, Star, ArrowUpRight, UserPlus, Sparkles, Check } from "lucide-react";
import { Course, Community, ProjectChallenge, Mentor } from "../../types";

interface ExploreViewProps {
  courses: Course[];
  communities: Community[];
  projects: ProjectChallenge[];
  mentors: Mentor[];
  onSelectCourse: (course: Course) => void;
  onSelectCommunity?: (community: Community) => void;
}

const FEATURED_CREATORS: { id: string; name: string; role: string; handle: string; avatar: string; followers: string }[] = [];

export const ExploreView: React.FC<ExploreViewProps> = ({
  courses,
  communities,
  projects,
  mentors,
  onSelectCourse,
  onSelectCommunity,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [followedCreatorIds, setFollowedCreatorIds] = useState<string[]>([]);
  const [followedAllCreators, setFollowedAllCreators] = useState(false);

  const toggleFollowCreator = (id: string) => {
    if (followedCreatorIds.includes(id)) {
      setFollowedCreatorIds(followedCreatorIds.filter((cid) => cid !== id));
      setFollowedAllCreators(false);
    } else {
      const next = [...followedCreatorIds, id];
      setFollowedCreatorIds(next);
      if (next.length === FEATURED_CREATORS.length) {
        setFollowedAllCreators(true);
      }
    }
  };

  const handleFollowEveryoneCreators = () => {
    if (followedAllCreators) {
      setFollowedCreatorIds([]);
      setFollowedAllCreators(false);
    } else {
      setFollowedCreatorIds(FEATURED_CREATORS.map((c) => c.id));
      setFollowedAllCreators(true);
    }
  };

  const categories = ["All", "Web Development", "Python", "React", "Cloud Computing", "Cyber Security", "Data Science"];

  const filteredCourses = courses.filter((c) =>
    (selectedCategory === "All" || c.category === selectedCategory) &&
    (c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredCommunities = communities.filter((com) =>
    com.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    com.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-8 rounded-lg border border-[#112D4E]/[.12] shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-white text-[#3F72AF]">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-[#112D4E] tracking-tight">
              Explore Ecosystem
            </h1>
            <p className="text-xs sm:text-sm text-[#112D4E]/[.55]">
              Discover top-rated courses, active developer communities, and company-sponsored project challenges.
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#112D4E]/[.55]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across courses, communities, projects, or mentors..."
            className="w-full bg-white border border-[#112D4E]/[.12] rounded-full py-3 pl-10 sm:pl-12 pr-6 text-xs sm:text-sm text-[#112D4E] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/20 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#3F72AF] text-white shadow-md"
                  : "bg-white text-[#112D4E] hover:bg-white border border-[#112D4E]/[.12]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Courses Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#112D4E] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#3F72AF]" />
            <span>Featured Courses</span>
          </h2>
          <span className="text-xs font-bold text-[#112D4E]/[.55]">{filteredCourses.length} results</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {filteredCourses.slice(0, 4).map((course) => (
            <div
              key={course.id}
              onClick={() => onSelectCourse(course)}
              className="bg-white rounded-lg border border-[#112D4E]/[.12] shadow-xs hover:shadow-md transition-all p-4 sm:p-5 flex flex-col justify-between gap-4 cursor-pointer group"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shrink-0 border border-[#112D4E]/[.12]"
                />
                <div className="space-y-1 min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#3F72AF] bg-[#112D4E]/[.04] px-2.5 py-0.5 rounded-full">
                    {course.category}
                  </span>
                  <h3 className="font-bold text-xs sm:text-sm text-[#112D4E] group-hover:text-[#3F72AF] transition-colors truncate">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[#112D4E]/[.55] truncate">By {course.instructor.name}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#112D4E]/[.12] text-xs font-bold">
                <span className="text-[#112D4E]">★ {course.rating} ({course.reviewsCount})</span>
                <span className="text-[#3F72AF] flex items-center gap-1">
                  View Course <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Communities Section */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-extrabold text-[#112D4E] flex items-center gap-2">
          <Users className="w-5 h-5 text-[#3F72AF]" />
          <span>Trending Communities</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {filteredCommunities.slice(0, 3).map((com) => (
            <div
              key={com.id}
              onClick={() => onSelectCommunity && onSelectCommunity(com)}
              className="bg-white p-4 sm:p-5 rounded-lg border border-[#112D4E]/[.12] shadow-xs hover:shadow-md transition-all space-y-3 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-xl shrink-0">
                  {com.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs sm:text-sm text-[#112D4E] group-hover:text-[#3F72AF] truncate">
                    {com.name}
                  </h4>
                  <p className="text-[11px] text-[#112D4E]/[.55]">{com.membersCount.toLocaleString()} members</p>
                </div>
              </div>
              <p className="text-xs text-[#112D4E]/[.72] line-clamp-2">{com.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Creators & Developers to Follow */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#112D4E] flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#3F72AF]" />
            <span>Top Developers & Educators to Follow</span>
          </h2>
          <button
            onClick={handleFollowEveryoneCreators}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              followedAllCreators
                ? "bg-[#3F72AF] text-white"
                : "bg-[#3F72AF] hover:bg-[#112D4E] text-white shadow-md hover:scale-105 active:scale-95"
            }`}
          >
            {followedAllCreators ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" /> Following Everyone
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#112D4E]" /> Follow Everyone
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURED_CREATORS.map((creator) => {
            const isFollowing = followedCreatorIds.includes(creator.id);
            return (
              <div
                key={creator.id}
                className="bg-white p-5 rounded-lg border border-[#112D4E]/[.12] shadow-xs hover:shadow-md transition-all flex flex-col justify-between items-center text-center space-y-3"
              >
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-[#112D4E]/[.25] shadow-sm"
                />
                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm text-[#112D4E]">{creator.name}</h4>
                  <p className="text-xs text-[#3F72AF] font-semibold">@{creator.handle}</p>
                  <p className="text-[11px] text-[#112D4E]/[.55]">{creator.role}</p>
                  <p className="text-[10px] text-[#112D4E]/[.55] font-medium pt-1">{creator.followers} followers</p>
                </div>
                <button
                  onClick={() => toggleFollowCreator(creator.id)}
                  className={`w-full py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isFollowing
                      ? "bg-[#112D4E]/[.04] text-[#112D4E] border border-[#112D4E]/[.12]"
                      : "bg-[#3F72AF] hover:bg-[#112D4E] text-white shadow-sm"
                  }`}
                >
                  {isFollowing ? "Following ✓" : "+ Follow"}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

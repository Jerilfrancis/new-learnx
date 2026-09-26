import React, { useState } from "react";
import {
  Flame,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  Video,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Check,
} from "lucide-react";
import { Course, Mentor, Community, LiveClass, UserProfile } from "../../types";

interface RightSidebarProps {
  currentUser?: UserProfile;
  courses?: Course[];
  trendingCourses?: Course[];
  topMentors?: Mentor[];
  mentors?: Mentor[];
  recommendedCommunities?: Community[];
  upcomingLiveClasses?: LiveClass[];
  liveClasses?: LiveClass[];
  setActiveNav?: (nav: string) => void;
  onSelectCourse?: (course: Course) => void;
  onSelectMentor?: (mentor: Mentor) => void;
  onBookMentor?: (mentor: Mentor) => void;
}

const PEOPLE_TO_FOLLOW: { id: string; name: string; handle: string; role: string; avatar: string }[] = [];

export const RightSidebar: React.FC<RightSidebarProps> = ({
  currentUser,
  courses = [],
  trendingCourses = [],
  mentors = [],
  topMentors = [],
  liveClasses = [],
  upcomingLiveClasses = [],
  setActiveNav,
  onSelectCourse,
  onSelectMentor,
  onBookMentor,
}) => {
  const courseList = courses.length > 0 ? courses : trendingCourses;
  const mentorList = mentors.length > 0 ? mentors : topMentors;
  const liveList = liveClasses.length > 0 ? liveClasses : upcomingLiveClasses;

  const [followedUserIds, setFollowedUserIds] = useState<string[]>([]);
  const [followedAll, setFollowedAll] = useState(false);

  const toggleFollow = (id: string) => {
    if (followedUserIds.includes(id)) {
      setFollowedUserIds(followedUserIds.filter((item) => item !== id));
      setFollowedAll(false);
    } else {
      const next = [...followedUserIds, id];
      setFollowedUserIds(next);
      if (next.length === PEOPLE_TO_FOLLOW.length) {
        setFollowedAll(true);
      }
    }
  };

  const handleFollowEveryone = () => {
    if (followedAll) {
      setFollowedUserIds([]);
      setFollowedAll(false);
    } else {
      setFollowedUserIds(PEOPLE_TO_FOLLOW.map((p) => p.id));
      setFollowedAll(true);
    }
  };

  return (
    <aside className="w-full bg-white border border-[#112D4E]/[.12] p-5 flex flex-col gap-5 shrink-0 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-lg shadow-xs">
      {/* 1. Progress Widget */}
      <section className="bg-white p-5 rounded-lg shadow-xs border border-[#112D4E]/[.12]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#112D4E]/[.55]">
            My Progress
          </h3>
          <span className="text-[#3F72AF] font-bold text-xs flex items-center gap-1">
            🔥 {currentUser?.learningStreakDays || 12} Days
          </span>
        </div>
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full border-4 border-[#112D4E]/[.12] flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-[#112D4E]">82%</span>
          </div>
          <div>
            <p className="text-xs font-bold text-[#112D4E]">Weekly Goal</p>
            <p className="text-[11px] text-[#112D4E]/[.55]">2 modules remaining</p>
          </div>
        </div>
      </section>

      {/* 2. Who to Follow / People */}
      <section className="bg-white p-5 rounded-lg shadow-xs border border-[#112D4E]/[.12] space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#112D4E]/[.55] flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5 text-[#3F72AF]" />
            <span>Who To Follow</span>
          </h3>
          <button
            onClick={handleFollowEveryone}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
              followedAll
                ? "bg-[#3F72AF] text-white"
                : "bg-[#3F72AF] hover:bg-[#112D4E] text-white shadow-xs hover:scale-105 active:scale-95"
            }`}
          >
            {followedAll ? (
              <>
                <Check className="w-3 h-3 stroke-[3]" /> Following All
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-[#112D4E]" /> Follow Everyone
              </>
            )}
          </button>
        </div>

        <div className="space-y-3">
          {PEOPLE_TO_FOLLOW.map((person) => {
            const isFollowing = followedUserIds.includes(person.id);
            return (
              <div
                key={person.id}
                className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-white transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-[#112D4E]/[.25] shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#112D4E] truncate">{person.name}</p>
                    <p className="text-[10px] text-[#112D4E]/[.55] truncate">@{person.handle} • {person.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleFollow(person.id)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
                    isFollowing
                      ? "bg-[#112D4E]/[.04] text-[#112D4E] hover:bg-[#112D4E]/[.08]"
                      : "bg-[#3F72AF]/10 text-[#3F72AF] hover:bg-[#3F72AF] hover:text-white"
                  }`}
                >
                  {isFollowing ? "Following ✓" : "+ Follow"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Trending Courses */}
      <section className="bg-white p-5 rounded-lg shadow-xs border border-[#112D4E]/[.12]">
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#112D4E]/[.55] mb-3">
          Trending Courses
        </h3>
        <div className="space-y-3.5">
          {courseList.slice(0, 3).map((course, idx) => (
            <div
              key={course.id || idx}
              onClick={() => onSelectCourse && onSelectCourse(course)}
              className="flex gap-3 group cursor-pointer items-center p-1.5 rounded-xl hover:bg-white transition-colors"
            >
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-11 h-11 rounded-xl object-cover shrink-0 bg-[#112D4E]/[.04] border border-[#112D4E]/[.12]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#112D4E] group-hover:text-[#3F72AF] transition-colors truncate">
                  {course.title}
                </p>
                <p className="text-[11px] text-[#112D4E]/[.55] truncate">
                  {course.studentsEnrolled
                    ? `${(course.studentsEnrolled / 1000).toFixed(1)}k students enrolled`
                    : "Popular choice"}
                </p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setActiveNav && setActiveNav("courses")}
          className="w-full mt-4 text-xs font-bold text-[#3F72AF] hover:underline underline-offset-4 text-left cursor-pointer"
        >
          View All Courses →
        </button>
      </section>

      {/* 3. Featured Mentors */}
      {mentorList.length > 0 && (
        <section className="bg-white p-5 rounded-lg border border-[#112D4E]/[.12] shadow-xs space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#112D4E]/[.55]">
            Featured Mentors
          </h3>
          <div className="space-y-2.5">
            {mentorList.slice(0, 2).map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  if (onBookMentor) onBookMentor(m);
                  if (onSelectMentor) onSelectMentor(m);
                }}
                className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-xl hover:bg-white transition-colors"
              >
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-[#112D4E]/[.25]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#112D4E] group-hover:text-[#3F72AF] truncate">
                    {m.name}
                  </p>
                  <p className="text-[11px] text-[#112D4E]/[.55] truncate">
                    {m.role} @ {m.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Live Session Banner */}
      <section className="mt-auto">
        <div className="bg-[#112D4E] p-5 rounded-lg text-white relative overflow-hidden shadow-md border border-[#112D4E]/[.12]">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-[#112D4E] uppercase tracking-wider">
              Live Now
            </p>
            <p className="text-sm font-bold mt-1.5 leading-snug">
              {liveList[0]?.title || "System Design Mastery"}
            </p>
            <p className="text-[11px] text-[#112D4E]/[.55] mt-1">
              With {liveList[0]?.hostName || "Alex Rivera"} & 234 others
            </p>
            <button
              onClick={() => setActiveNav && setActiveNav("live")}
              className="mt-3.5 w-full bg-white text-[#112D4E] py-2 rounded-xl text-xs font-bold hover:bg-white transition-colors cursor-pointer"
            >
              Join Session
            </button>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#112D4E]/[.04] hidden rounded-full" />
        </div>
      </section>
    </aside>
  );
};

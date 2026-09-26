import React, { useState } from "react";
import {
  BookOpen,
  Sparkles,
  Star,
  Clock,
  Users,
  PlayCircle,
  Award,
  ChevronRight,
  Filter,
  CheckCircle,
} from "lucide-react";
import { Course } from "../../types";
import { CourseBuilderModal } from "./CourseBuilderModal";
import { Plus } from "lucide-react";

interface CourseBrowseProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  onCourseCreated?: () => void;
}

const CATEGORIES = [
  "All Categories",
  "AI & Machine Learning",
  "Web Development",
  "System Design & DSA",
  "Cyber Security",
  "Data Science",
  "Cloud Computing",
  "UI/UX Design",
];

export const CourseBrowse: React.FC<CourseBrowseProps> = ({
  courses,
  onSelectCourse,
  onCourseCreated,
}) => {
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [searchFilter, setSearchFilter] = useState("");
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  const filteredCourses = courses.filter((c) => {
    const matchesCat =
      activeCategory === "All Categories" || c.category === activeCategory;
    const matchesSearch =
      c.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.instructor.name.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const featuredCourses = courses.filter((c) => c.isFeatured);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Banner Section */}
      <div className="relative rounded-lg overflow-hidden bg-[#112D4E] text-white p-6 sm:p-10 shadow-md border border-[#112D4E]/[.12]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3F72AF]/20 rounded-full hidden pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#112D4E]/20 rounded-full hidden pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10  text-xs font-bold text-[#112D4E] border border-white/10">
            <Sparkles className="w-4 h-4 text-[#3F72AF]" />
            <span>Coursera Ecosystem + Netflix Streaming</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Learn From World-Class Engineers & Earn Verified Certificates
          </h1>
          <p className="text-sm text-[#112D4E]/[.55] leading-relaxed">
            Master full-stack engineering, Gemini AI integration, distributed system design, and security through hands-on project challenges.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => courses[0] && onSelectCourse(courses[0])}
              disabled={courses.length === 0}
              className={`px-5 py-2.5 rounded-lg bg-[#3F72AF] text-white font-bold text-xs transition-all flex items-center gap-2 ${
                courses.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:shadow-sm hover:scale-105 cursor-pointer"
              }`}
            >
              <PlayCircle className="w-4 h-4" /> Start Featured Course
            </button>
            <button
              onClick={() => setIsBuilderOpen(true)}
              className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs  transition-all flex items-center gap-1.5 cursor-pointer border border-white/20"
            >
              <Plus className="w-4 h-4 text-[#112D4E] stroke-[3]" /> + Create Course
            </button>
          </div>
        </div>
      </div>

      {isBuilderOpen && (
        <CourseBuilderModal
          onClose={() => setIsBuilderOpen(false)}
          onCourseCreated={() => {
            if (onCourseCreated) onCourseCreated();
            setIsBuilderOpen(false);
          }}
        />
      )}

      {/* Categories Filter Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-[#112D4E]">Browse Learning Paths</h2>
          <div className="relative">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search courses..."
              className="text-xs px-3.5 py-1.5 rounded-full bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none focus:border-[#112D4E]/[.12]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-[#3F72AF] text-white shadow-md"
                  : "bg-white text-[#112D4E] hover:bg-[#112D4E]/[.04] border border-[#112D4E]/[.12]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Netflix-Style Carousel Section */}
      {featuredCourses.length > 0 && activeCategory === "All Categories" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#112D4E] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#3F72AF]" />
              Featured Masterclasses
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredCourses.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectCourse(c)}
                className="group bg-white rounded-lg overflow-hidden border border-[#112D4E]/[.12] shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={c.thumbnail}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-[#112D4E]/[.6]   " />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#112D4E]/80  text-[10px] font-bold text-white uppercase">
                    {c.level}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#112D4E]/[.55]" /> {c.duration}
                    </span>
                    <span className="flex items-center gap-1 text-[#112D4E] font-bold">
                      <Star className="w-3.5 h-3.5 fill-[#112D4E]" /> {c.rating}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#3F72AF] uppercase tracking-wider">
                      {c.category}
                    </span>
                    <h4 className="text-sm font-bold text-[#112D4E] group-hover:text-[#3F72AF] transition-colors line-clamp-2 mt-0.5">
                      {c.title}
                    </h4>
                  </div>

                  <div className="pt-2 border-t border-[#112D4E]/[.12] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={typeof c.instructor === "object" ? c.instructor.avatar : (c.instructorAvatar ?? "")}
                        alt={typeof c.instructor === "object" ? c.instructor.name : String(c.instructor)}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="font-semibold text-[#112D4E] text-[11px]">
                        {typeof c.instructor === "object" ? c.instructor.name : String(c.instructor)}
                      </span>
                    </div>
                    <span className="font-extrabold text-[#3F72AF]">{c.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid Courses List */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-[#112D4E]">
          All Available Courses ({filteredCourses.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCourses.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectCourse(c)}
              className="p-4 rounded-lg bg-white border border-[#112D4E]/[.12] shadow-xs hover:shadow-sm transition-all duration-300 cursor-pointer flex flex-col sm:flex-row gap-4 group"
            >
              <img
                src={c.thumbnail}
                alt={c.title}
                className="w-full sm:w-40 h-32 rounded-lg object-cover shrink-0 group-hover:scale-102 transition-transform"
              />
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#112D4E]/[.55]">
                    <span className="text-[#3F72AF]">{c.category}</span>
                    <span className="text-[#112D4E] font-bold flex items-center gap-0.5">
                      ★ {c.rating} ({c.reviewsCount})
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#112D4E] group-hover:text-[#3F72AF] transition-colors line-clamp-2 mt-1">
                    {c.title}
                  </h4>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-[#112D4E]/[.12]">
                  <span className="text-[#112D4E]/[.55] flex items-center gap-1 text-[11px]">
                    <Users className="w-3.5 h-3.5" /> {(c.studentsEnrolled ?? c.studentsCount ?? 0).toLocaleString()}
                  </span>
                  <span className="font-bold text-[#3F72AF] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Enroll Now <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

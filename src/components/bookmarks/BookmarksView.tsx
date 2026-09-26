import React from "react";
import { Bookmark, Code2, BookOpen, FolderGit2, Trash2, ArrowUpRight } from "lucide-react";
import { Post, Course, ProjectChallenge } from "../../types";

interface BookmarksViewProps {
  posts: Post[];
  courses: Course[];
  projects: ProjectChallenge[];
  onSelectCourse: (course: Course) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  posts,
  courses,
  projects,
  onSelectCourse,
}) => {
  const savedPosts = posts.filter((p) => p.isSaved);
  const savedCourses = courses.slice(0, 2);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-[#112D4E]/[.12] shadow-sm space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#112D4E]/[.04] text-[#3F72AF] rounded-lg">
            <Bookmark className="w-6 h-6 fill-[#3F72AF]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#112D4E]">Saved Bookmarks</h1>
            <p className="text-xs text-[#112D4E]/[.55]">Access saved code snippets, course notes, and project specs.</p>
          </div>
        </div>
      </div>

      {/* Saved Courses Grid */}
      <div className="space-y-4">
        <h2 className="font-extrabold text-lg text-[#112D4E] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#3F72AF]" />
          <span>Saved Courses</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {savedCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => onSelectCourse(course)}
              className="bg-white p-4 rounded-lg border border-[#112D4E]/[.12] shadow-xs hover:shadow-md transition-all flex items-center gap-4 cursor-pointer"
            >
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-[#112D4E] truncate">{course.title}</h4>
                <p className="text-xs text-[#112D4E]/[.55]">Instructor: {course.instructor.name}</p>
                <p className="text-[10px] font-bold text-[#3F72AF] mt-1">★ {course.rating} Rating</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Posts / Code Snippets */}
      <div className="space-y-4">
        <h2 className="font-extrabold text-lg text-[#112D4E] flex items-center gap-2">
          <Code2 className="w-5 h-5 text-[#3F72AF]" />
          <span>Saved Code & Posts</span>
        </h2>
        {savedPosts.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-[#112D4E]/[.12] text-center text-[#112D4E]/[.55] space-y-2">
            <Bookmark className="w-8 h-8 mx-auto text-[#112D4E]/[.55]" />
            <p className="text-sm font-semibold">No bookmarked posts yet.</p>
            <p className="text-xs">Click the bookmark icon on any feed card to save it for later.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-5 rounded-lg border border-[#112D4E]/[.12] shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#112D4E]">{post.author.name}</p>
                      <p className="text-[10px] text-[#112D4E]/[.55]">@{post.author.handle}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#3F72AF] bg-[#112D4E]/[.04] px-2.5 py-0.5 rounded-full">
                    {post.type}
                  </span>
                </div>
                <p className="text-xs text-[#112D4E] leading-relaxed">{post.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

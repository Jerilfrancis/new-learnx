import React, { useState, useRef } from "react";
import {
  X,
  PlayCircle,
  CheckCircle2,
  Star,
  Clock,
  Users,
  Award,
  Check,
  Download,
  FileText,
  HelpCircle,
  BookOpen,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Course, CourseLesson, CourseModule } from "../../types";
import { coursesApi } from "../../services/api";

interface CourseDetailModalProps {
  course: Course;
  onClose: () => void;
  onEnrollSuccess?: () => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  onClose,
  onEnrollSuccess,
}) => {
  // Build flat lesson list from curriculum or legacy lessons field
  const allModules: CourseModule[] =
    course.curriculum && course.curriculum.length > 0
      ? course.curriculum
      : [
          {
            id: "mod_legacy",
            title: "Course Content",
            lessons: course.lessons || [],
          },
        ];

  const firstLesson = allModules[0]?.lessons[0] || null;
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(firstLesson);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isFollowingInstructor, setIsFollowingInstructor] = useState(false);
  const [activeTab, setActiveTab] = useState<"curriculum" | "overview" | "quiz" | "certificate">("curriculum");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const [openModuleIdx, setOpenModuleIdx] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<{
    passed: boolean;
    percentage: number;
    score: number;
    total: number;
    results: any[];
  } | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  const instructorName =
    typeof course.instructor === "object" ? course.instructor.name : String(course.instructor ?? "Course Educator");
  const instructorAvatar =
    typeof course.instructor === "object"
      ? course.instructor.avatar
      : course.instructorAvatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(instructorName)}`;
  const instructorTitle =
    typeof course.instructor === "object"
      ? course.instructor.title ?? "Course Educator"
      : course.instructorRole ?? "Course Educator";

  const handleEnroll = async () => {
    setIsSubmitting(true);
    setEnrollmentError(null);
    try {
      const res = await coursesApi.enroll(course.id || course._id || "");
      if (res.success) {
        setIsEnrolled(true);
        if (onEnrollSuccess) onEnrollSuccess();
      }
    } catch (err: any) {
      setEnrollmentError(err?.message || "Enrollment failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!activeLesson) return;
    try {
      const courseId = course.id || course._id || "";
      await coursesApi.updateProgress(courseId, activeLesson.id, undefined, undefined, undefined);
      // Move to next lesson in same module
      for (const mod of allModules) {
        const idx = mod.lessons.findIndex((l) => l.id === activeLesson.id);
        if (idx !== -1) {
          const nextLesson = mod.lessons[idx + 1];
          if (nextLesson) setActiveLesson(nextLesson);
          break;
        }
      }
    } catch {
      // no-op
    }
  };

  const handleSubmitQuiz = async () => {
    if (!activeLesson?.quiz) return;
    const courseId = course.id || course._id || "";

    setIsSubmittingQuiz(true);
    setQuizError(null);

    try {
      const res = await coursesApi.submitQuiz(courseId, {
        lessonId: activeLesson.id,
        answers: quizAnswers,
      });
      if (res.success) {
        setQuizResult({
          passed: res.passed,
          percentage: res.percentage,
          score: res.score,
          total: res.totalQuestions,
          results: res.results,
        });
      }
    } catch (err: any) {
      setQuizError(err?.message || "Quiz submission failed. Please try again.");
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const currentQuiz = activeLesson?.quiz;

  return (
    <div className="fixed inset-0 z-50 bg-[#112D4E]/60  flex items-center justify-center p-2 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-md border border-[#112D4E]/[.12] overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-[#112D4E]/[.12] bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3F72AF]/10 text-[#3F72AF] uppercase">
              {course.category}
            </span>
            <span className="text-xs font-bold text-[#112D4E]/[.55]">•</span>
            <span className="text-xs font-semibold text-[#112D4E]/[.72]">{course.level}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#112D4E]/[.55] hover:text-[#112D4E]/[.72] rounded-full hover:bg-[#112D4E]/[.04] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Video Player (real if video URL exists, otherwise thumbnail preview) */}
          <div className="relative rounded-lg overflow-hidden bg-[#112D4E] shadow-md">
            {activeLesson?.videoUrl ? (
              <video
                ref={videoRef}
                key={activeLesson.id}
                src={activeLesson.videoUrl}
                controls
                className="w-full aspect-video object-contain"
                onEnded={handleMarkCompleted}
              />
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center gap-2 bg-[#112D4E]/[.6]  ">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover opacity-40 absolute inset-0"
                />
                <div className="relative z-10 text-center">
                  <PlayCircle className="w-14 h-14 text-white/60 mx-auto mb-2" />
                  <p className="text-xs text-[#112D4E]/[.55] font-semibold">
                    {activeLesson
                      ? `"${activeLesson.title}" — No video uploaded`
                      : "Select a lesson to watch"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Active Lesson title + Mark Completed CTA */}
          {activeLesson && (
            <div className="p-4 rounded-lg bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-[#112D4E]/[.55] uppercase">Now Watching</p>
                <p className="text-sm font-bold text-[#112D4E] mt-0.5">{activeLesson.title}</p>
                {activeLesson.description && (
                  <p className="text-xs text-[#112D4E]/[.55] mt-0.5">{activeLesson.description}</p>
                )}
              </div>
              <button
                onClick={handleMarkCompleted}
                className="px-4 py-2 rounded-xl bg-[#112D4E] hover:bg-[#112D4E] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
              </button>
            </div>
          )}

          {/* Title + Enrollment Action */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-lg bg-[#112D4E]/[.04] border border-[#112D4E]/[.12]">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-2xl font-black text-[#112D4E] leading-tight">{course.title}</h2>
              <div className="flex items-center gap-3 text-xs text-[#112D4E]/[.72] flex-wrap">
                <span className="flex items-center gap-1 text-[#112D4E] font-bold">
                  <Star className="w-4 h-4 fill-[#3F72AF]" /> {course.rating} ({course.reviewsCount ?? 0} reviews)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-[#112D4E]/[.55]" />{" "}
                  {(course.studentsEnrolled ?? course.studentsCount ?? 0).toLocaleString()} enrolled
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-[#112D4E]/[.55]" /> {course.duration}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleEnroll}
                disabled={isEnrolled || isSubmitting}
                className={`px-6 py-3 rounded-lg font-extrabold text-xs shadow-md transition-all cursor-pointer ${
                  isEnrolled
                    ? "bg-[#112D4E] text-white flex items-center gap-1.5"
                    : "bg-[#3F72AF] text-white hover:scale-105"
                }`}
              >
                {isEnrolled ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" /> Enrolled! Resume Learning
                  </>
                ) : (
                  isSubmitting ? "Enrolling..." : "Enroll Now — FREE Access"
                )}
              </button>
            </div>
          </div>
          {enrollmentError && (
            <p className="text-xs font-semibold text-[#112D4E] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> {enrollmentError}
            </p>
          )}

          {/* Instructor Profile */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-white border border-[#112D4E]/[.12] shadow-2xs">
            <div className="flex items-center gap-4">
              <img
                src={instructorAvatar}
                alt={instructorName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#3F72AF]/20"
              />
              <div>
                <p className="text-xs text-[#112D4E]/[.55] font-semibold uppercase">Taught by</p>
                <h4 className="text-sm font-bold text-[#112D4E]">{instructorName}</h4>
                <p className="text-xs text-[#112D4E]/[.55]">{instructorTitle}</p>
              </div>
            </div>
            <button
              onClick={() => setIsFollowingInstructor(!isFollowingInstructor)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                isFollowingInstructor
                  ? "bg-[#112D4E]/[.04] text-[#112D4E] border border-[#112D4E]/[.12]"
                  : "bg-[#3F72AF] hover:bg-[#112D4E] text-white shadow-xs"
              }`}
            >
              {isFollowingInstructor ? "Following ✓" : "+ Follow Instructor"}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-[#112D4E]/[.12] overflow-x-auto pb-0">
            {[
              { id: "curriculum", label: "Curriculum" },
              { id: "overview", label: "Overview" },
              { id: "quiz", label: "Take Quiz" },
              { id: "certificate", label: "Certificate" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#112D4E]/[.12] text-[#3F72AF]"
                    : "border-transparent text-[#112D4E]/[.55] hover:text-[#112D4E]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB: Curriculum */}
          {activeTab === "curriculum" && (
            <div className="space-y-3">
              {allModules.map((mod, mIdx) => (
                <div key={mod.id || mIdx} className="rounded-lg border border-[#112D4E]/[.12] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenModuleIdx(openModuleIdx === mIdx ? -1 : mIdx)}
                    className="w-full flex items-center justify-between p-3.5 bg-[#112D4E]/[.04] hover:bg-[#112D4E]/[.04] cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-[#112D4E]">
                      <BookOpen className="w-4 h-4 text-[#3F72AF]" />
                      {mod.title}
                      <span className="text-[#112D4E]/[.55] font-normal">({mod.lessons.length} lessons)</span>
                    </div>
                    {openModuleIdx === mIdx ? (
                      <ChevronDown className="w-4 h-4 text-[#112D4E]/[.55]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#112D4E]/[.55]" />
                    )}
                  </button>

                  {openModuleIdx === mIdx && (
                    <div className="divide-y divide-[#112D4E]/[.12]">
                      {mod.lessons.map((lesson) => {
                        const isSelected = activeLesson?.id === lesson.id;
                        return (
                          <div
                            key={lesson.id}
                            onClick={() => {
                              setActiveLesson(lesson);
                              setQuizResult(null);
                              setQuizAnswers({});
                              if (lesson.quiz) setActiveTab("quiz");
                              else setActiveTab("curriculum");
                            }}
                            className={`p-3.5 flex items-center justify-between text-xs transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#112D4E]/[.04] border-l-2 border-[#112D4E]/[.12] font-bold"
                                : "bg-white hover:bg-[#112D4E]/[.04]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-xl ${
                                  lesson.completed
                                    ? "bg-[#112D4E]/[.04] text-[#112D4E]"
                                    : lesson.quiz
                                    ? "bg-[#112D4E]/[.04] text-[#112D4E]"
                                    : "bg-[#112D4E]/[.04] text-[#112D4E]/[.72]"
                                }`}
                              >
                                {lesson.completed ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : lesson.quiz ? (
                                  <HelpCircle className="w-4 h-4" />
                                ) : lesson.videoUrl ? (
                                  <PlayCircle className="w-4 h-4" />
                                ) : (
                                  <FileText className="w-4 h-4" />
                                )}
                              </div>
                              <div>
                                <p className="text-[#112D4E] font-semibold">{lesson.title}</p>
                                {/* Show resource count badge */}
                                {lesson.resources && lesson.resources.length > 0 && (
                                  <p className="text-[10px] text-[#112D4E] font-bold mt-0.5">
                                    {lesson.resources.length} PDF resource(s) attached
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-[#112D4E]/[.55] shrink-0">
                              <span>{lesson.duration}</span>
                              {lesson.isFreePreview && (
                                <span className="px-2 py-0.5 rounded-full bg-[#112D4E]/[.04] text-[#112D4E] text-[10px] font-bold">
                                  Free
                                </span>
                              )}
                              {lesson.quiz?.questions && lesson.quiz.questions.length > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-[#112D4E]/[.04] text-[#112D4E] text-[10px] font-bold">
                                  Quiz
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {/* PDF Resources for active lesson */}
              {activeLesson?.resources && activeLesson.resources.length > 0 && (
                <div className="p-4 rounded-lg border border-[#112D4E]/[.12] bg-[#112D4E]/50 space-y-3">
                  <h4 className="text-xs font-bold text-[#112D4E] uppercase tracking-wider flex items-center gap-2">
                    <Download className="w-4 h-4 text-[#112D4E]" /> Downloadable Resources
                  </h4>
                  {activeLesson.resources.map((res, rIdx) => (
                    <a
                      key={res.id || rIdx}
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#112D4E]/[.12] hover:border-[#112D4E]/[.12] transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-[#112D4E]/[.04] text-[#112D4E]">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-[#112D4E] truncate">{res.fileName}</p>
                          <p className="text-[10px] text-[#112D4E]/[.55]">
                            {res.fileSize ? `${Math.round(res.fileSize / 1024)} KB` : "PDF Document"}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#3F72AF] group-hover:underline shrink-0">
                        Open PDF →
                      </span>
                    </a>
                  ))}
                </div>
              )}

              {/* Lesson article/note content */}
              {activeLesson?.content && (
                <div className="p-4 rounded-lg bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] space-y-2">
                  <h4 className="text-xs font-bold text-[#112D4E] uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#112D4E]/[.55]" /> Lesson Notes
                  </h4>
                  <pre className="text-xs text-[#112D4E] whitespace-pre-wrap font-sans leading-relaxed">
                    {activeLesson.content}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB: Overview */}
          {activeTab === "overview" && (
            <div className="space-y-4 text-xs text-[#112D4E]">
              <p className="leading-relaxed text-sm">{course.description}</p>
              {(course.whatYouWillLearn?.length > 0 || course.learningObjectives?.length > 0) && (
                <div className="p-4 rounded-lg bg-[#112D4E]/50 border border-[#112D4E]/[.12] space-y-2">
                  <h4 className="font-bold text-[#112D4E] text-xs">Key Skills You Will Master:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(course.whatYouWillLearn ?? course.learningObjectives ?? []).map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#112D4E] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {course.prerequisites && course.prerequisites.length > 0 && (
                <div className="p-4 rounded-lg bg-[#112D4E]/50 border border-[#112D4E]/[.12]">
                  <h4 className="font-bold text-[#112D4E] text-xs mb-2">Prerequisites</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-[#112D4E]/[.72]">
                    {course.prerequisites.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB: Quiz */}
          {activeTab === "quiz" && (
            <div className="space-y-5">
              {currentQuiz && currentQuiz.questions?.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-[#112D4E]">
                      {currentQuiz.title || "Knowledge Check Quiz"}
                    </h3>
                    <span className="text-[11px] font-bold text-[#112D4E]/[.55]">
                      {currentQuiz.questions.length} Questions
                    </span>
                  </div>

                  {quizError && (
                    <div className="p-3 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] text-[#112D4E] text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {quizError}
                    </div>
                  )}

                  {quizResult ? (
                    <div className="space-y-4">
                      {/* Score Summary */}
                      <div
                        className={`p-5 rounded-lg text-center ${quizResult.passed ? "bg-[#112D4E]/[.04] border border-[#112D4E]/[.12]" : "bg-[#112D4E]/[.04] border border-[#112D4E]/[.12]"}`}
                      >
                        <div className={`text-3xl font-black mb-1 ${quizResult.passed ? "text-[#112D4E]" : "text-[#112D4E]"}`}>
                          {quizResult.percentage}%
                        </div>
                        <p className="text-xs font-bold text-[#112D4E]">
                          {quizResult.score}/{quizResult.total} correct •{" "}
                          {quizResult.passed ? "🎉 Passed! Well done!" : "Keep studying and try again!"}
                        </p>
                      </div>

                      {/* Detailed Per-Question Breakdown */}
                      <div className="space-y-3">
                        {quizResult.results.map((r: any, idx: number) => (
                          <div
                            key={idx}
                            className={`p-3.5 rounded-xl border text-xs ${
                              r.isCorrect ? "bg-[#112D4E]/[.04] border-[#112D4E]/[.12]" : "bg-[#112D4E]/[.04] border-[#112D4E]/[.12]"
                            }`}
                          >
                            <p className="font-bold text-[#112D4E] mb-1.5">
                              Q{idx + 1}: {r.question}
                            </p>
                            <div className="space-y-0.5">
                              {currentQuiz.questions[idx]?.options.map((opt: string, oIdx: number) => (
                                <div
                                  key={oIdx}
                                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${
                                    oIdx === r.correctAnswer
                                      ? "bg-[#112D4E]/[.04] font-bold text-[#112D4E]"
                                      : oIdx === r.userAnswer && !r.isCorrect
                                      ? "bg-[#112D4E]/[.04] text-[#112D4E]"
                                      : "text-[#112D4E]/[.72]"
                                  }`}
                                >
                                  {oIdx === r.correctAnswer ? (
                                    <Check className="w-3.5 h-3.5 text-[#112D4E] shrink-0" />
                                  ) : (
                                    <span className="w-3.5 h-3.5 shrink-0" />
                                  )}
                                  {opt}
                                </div>
                              ))}
                            </div>
                            {r.explanation && (
                              <p className="text-[#112D4E]/[.55] mt-2 border-t border-[#112D4E]/[.12] pt-1.5">
                                💡 {r.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => { setQuizResult(null); setQuizAnswers({}); }}
                        className="px-4 py-2 rounded-xl bg-[#112D4E]/[.04] text-[#112D4E] font-bold text-xs hover:bg-[#112D4E]/[.08] cursor-pointer"
                      >
                        Retake Quiz
                      </button>
                    </div>
                  ) : (
                    <>
                      {currentQuiz.questions.map((q, qIdx) => (
                        <div key={q.id || qIdx} className="p-4 rounded-lg bg-white border border-[#112D4E]/[.12] space-y-3">
                          <p className="text-xs font-bold text-[#112D4E]">
                            {qIdx + 1}. {q.question}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, optIdx) => (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
                                className={`text-left p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                  quizAnswers[qIdx] === optIdx
                                    ? "bg-[#3F72AF] text-white border-[#112D4E]/[.12] shadow-md"
                                    : "bg-[#112D4E]/[.04] text-[#112D4E] border-[#112D4E]/[.12] hover:border-[#112D4E]/[.12] hover:bg-[#112D4E]/[.04]"
                                }`}
                              >
                                <span className="font-black mr-1.5">{String.fromCharCode(65 + optIdx)}.</span>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        disabled={isSubmittingQuiz || Object.keys(quizAnswers).length < currentQuiz.questions.length}
                        onClick={handleSubmitQuiz}
                        className="w-full py-3 rounded-lg bg-[#3F72AF] hover:bg-[#112D4E] text-white font-bold text-xs shadow-md hover:scale-[1.01] active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        {isSubmittingQuiz
                          ? "Evaluating Your Answers..."
                          : `Submit Quiz (${Object.keys(quizAnswers).length}/${currentQuiz.questions.length} answered)`}
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-10 text-[#112D4E]/[.55]">
                  <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-xs font-semibold">
                    No quiz attached to this lesson yet.
                    <br />
                    Select a lesson that includes a quiz, or ask the instructor.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB: Certificate */}
          {activeTab === "certificate" && (
            <div className="p-6 rounded-lg bg-[#112D4E] text-white space-y-4 shadow-md text-center">
              <Award className="w-12 h-12 text-[#112D4E] mx-auto" />
              <h3 className="text-lg font-bold">Verifiable Course Certificate</h3>
              <p className="text-xs text-[#112D4E]/[.55] max-w-md mx-auto">
                Upon completing all modules and passing the final assessment, you will earn a QR-authenticated
                verifiable credential backed by LearnX.
              </p>
              {isEnrolled && (
                <button
                  onClick={async () => {
                    const courseId = course.id || course._id || "";
                    await coursesApi.generateCertificate(courseId);
                  }}
                  className="px-6 py-2.5 rounded-lg bg-[#3F72AF] hover:bg-[#112D4E] text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Generate My Certificate
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

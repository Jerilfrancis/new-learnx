import React, { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  BookOpen,
  Video,
  Upload,
  Sparkles,
  CheckCircle,
  FileText,
  HelpCircle,
  Play,
  Download,
  AlertCircle,
  RefreshCw,
  File,
  Layers,
  ChevronDown,
  ChevronUp,
  Check,
  Eye,
} from "lucide-react";
import { Course, CourseModule, CourseLesson, MCQuestion } from "../../types";
import { coursesApi, uploadApi, aiApi } from "../../services/api";

interface CourseBuilderModalProps {
  courseToEdit?: Course | null;
  onClose: () => void;
  onCourseCreated: () => void;
}

export const CourseBuilderModal: React.FC<CourseBuilderModalProps> = ({
  courseToEdit,
  onClose,
  onCourseCreated,
}) => {
  // Main Course Metadata
  const [title, setTitle] = useState(courseToEdit?.title || "");
  const [description, setDescription] = useState(courseToEdit?.description || "");
  const [category, setCategory] = useState(courseToEdit?.category || "Web Development");
  const [level, setLevel] = useState(courseToEdit?.level || "Intermediate");
  const [language, setLanguage] = useState(courseToEdit?.language || "English");
  const [duration, setDuration] = useState(courseToEdit?.duration || "10 Hours");
  const [price, setPrice] = useState(courseToEdit?.price || "Free");
  const [thumbnail, setThumbnail] = useState(
    courseToEdit?.thumbnail ||
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
  );
  const [learningObjectives, setLearningObjectives] = useState<string[]>(
    courseToEdit?.whatYouWillLearn || [
      "Master modern full-stack development patterns",
      "Build production-grade APIs and database schemas",
      "Deploy scalable applications with automated CI/CD",
    ]
  );
  const [prerequisites, setPrerequisites] = useState<string[]>(
    courseToEdit?.prerequisites || ["Basic understanding of JavaScript and HTML"]
  );

  // Curriculum State
  const [modules, setModules] = useState<CourseModule[]>(
    courseToEdit?.curriculum && courseToEdit.curriculum.length > 0
      ? courseToEdit.curriculum
      : [
          {
            id: `mod_${Date.now()}_1`,
            title: "Module 1: Foundations & Architecture",
            description: "Core setup and conceptual architecture",
            lessons: [
              {
                id: `les_${Date.now()}_1`,
                title: "Introduction & Environment Setup",
                description: "Getting development dependencies installed",
                duration: "12m",
                type: "video",
                videoUrl: "",
                content:
                  "# Introduction\n\nWelcome to this comprehensive masterclass. In this lesson, we will cover the initial environment setup and project layout.",
                isFreePreview: true,
                resources: [],
              },
            ],
          },
        ]
  );

  // Active Selected Lesson in Editor
  const [selectedModIndex, setSelectedModIndex] = useState(0);
  const [selectedLesIndex, setSelectedLesIndex] = useState(0);
  const currentLesson: CourseLesson | undefined =
    modules[selectedModIndex]?.lessons[selectedLesIndex];

  // Upload Progress States
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadStatusMsg, setUploadStatusMsg] = useState<{ [key: string]: string }>({});

  // AI MCQ Generator States
  const [mcqContentInput, setMcqContentInput] = useState("");
  const [mcqNumQuestions, setMcqNumQuestions] = useState(5);
  const [mcqDifficulty, setMcqDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [isGeneratingMcq, setIsGeneratingMcq] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // General Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "video" | "pdf" | "quiz" | "settings">("video");

  // Thumbnail Upload Handler
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadApi.uploadFile(formData);
      if (res.url) setThumbnail(res.url);
    } catch (_) {
      setThumbnail(URL.createObjectURL(file));
    }
  };

  // Video Upload Handler with Visual Simulation Progress
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileKey = `video_${selectedModIndex}_${selectedLesIndex}`;
    setUploadProgress((prev) => ({ ...prev, [fileKey]: 15 }));
    setUploadStatusMsg((prev) => ({ ...prev, [fileKey]: "Uploading course video..." }));

    try {
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => {
          const curr = prev[fileKey] || 15;
          if (curr >= 85) return curr;
          return curr + 15;
        });
      }, 400);

      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadApi.uploadFile(formData);

      clearInterval(progressTimer);
      setUploadProgress((prev) => ({ ...prev, [fileKey]: 100 }));
      setUploadStatusMsg((prev) => ({ ...prev, [fileKey]: "Video uploaded successfully!" }));

      // Update current lesson videoUrl
      const updatedModules = [...modules];
      updatedModules[selectedModIndex].lessons[selectedLesIndex].videoUrl = res.url;
      setModules(updatedModules);

      setTimeout(() => {
        setUploadProgress((prev) => {
          const next = { ...prev };
          delete next[fileKey];
          return next;
        });
      }, 3000);
    } catch (err: any) {
      setUploadStatusMsg((prev) => ({
        ...prev,
        [fileKey]: err.message || "Video upload failed. Please try again.",
      }));
    }
  };

  // PDF Resource Upload Handler
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileKey = `pdf_${selectedModIndex}_${selectedLesIndex}`;
    setUploadProgress((prev) => ({ ...prev, [fileKey]: 30 }));
    setUploadStatusMsg((prev) => ({ ...prev, [fileKey]: "Uploading PDF resource..." }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadApi.uploadFile(formData);

      setUploadProgress((prev) => ({ ...prev, [fileKey]: 100 }));
      setUploadStatusMsg((prev) => ({ ...prev, [fileKey]: "Resource attached successfully!" }));

      const newResource = {
        id: `res_${Date.now()}`,
        url: res.url,
        fileName: res.fileName || file.name,
        fileSize: res.fileSize || file.size,
        mimeType: res.mimeType || file.type,
        resourceType: "pdf",
        createdAt: new Date().toISOString(),
      };

      const updatedModules = [...modules];
      const existing = updatedModules[selectedModIndex].lessons[selectedLesIndex].resources || [];
      updatedModules[selectedModIndex].lessons[selectedLesIndex].resources = [...existing, newResource];
      setModules(updatedModules);

      setTimeout(() => {
        setUploadProgress((prev) => {
          const next = { ...prev };
          delete next[fileKey];
          return next;
        });
      }, 2500);
    } catch (err: any) {
      setUploadStatusMsg((prev) => ({
        ...prev,
        [fileKey]: err.message || "PDF upload failed.",
      }));
    }
  };

  // Remove Resource
  const removeResource = (resIdx: number) => {
    const updatedModules = [...modules];
    const existing = updatedModules[selectedModIndex].lessons[selectedLesIndex].resources || [];
    updatedModules[selectedModIndex].lessons[selectedLesIndex].resources = existing.filter(
      (_, i) => i !== resIdx
    );
    setModules(updatedModules);
  };

  // Module & Lesson Manipulations
  const addModule = () => {
    const newMod: CourseModule = {
      id: `mod_${Date.now()}`,
      title: `Module ${modules.length + 1}: Untitled Module`,
      description: "",
      lessons: [
        {
          id: `les_${Date.now()}_0`,
          title: "Lesson 1",
          duration: "15m",
          type: "video",
          videoUrl: "",
          content: "",
          isFreePreview: false,
          resources: [],
        },
      ],
    };
    setModules([...modules, newMod]);
    setSelectedModIndex(modules.length);
    setSelectedLesIndex(0);
  };

  const removeModule = (mIdx: number) => {
    if (modules.length <= 1) return;
    const next = modules.filter((_, idx) => idx !== mIdx);
    setModules(next);
    setSelectedModIndex(Math.max(0, mIdx - 1));
    setSelectedLesIndex(0);
  };

  const addLesson = (mIdx: number) => {
    const next = [...modules];
    const newLessonNum = next[mIdx].lessons.length + 1;
    next[mIdx].lessons.push({
      id: `les_${Date.now()}_${newLessonNum}`,
      title: `Lesson ${newLessonNum}`,
      duration: "15m",
      type: "video",
      videoUrl: "",
      content: "",
      isFreePreview: false,
      resources: [],
    });
    setModules(next);
    setSelectedModIndex(mIdx);
    setSelectedLesIndex(next[mIdx].lessons.length - 1);
  };

  const removeLesson = (mIdx: number, lIdx: number) => {
    const next = [...modules];
    if (next[mIdx].lessons.length <= 1) return;
    next[mIdx].lessons = next[mIdx].lessons.filter((_, idx) => idx !== lIdx);
    setModules(next);
    setSelectedLesIndex(Math.max(0, lIdx - 1));
  };

  // Groq AI MCQ Generation
  const handleGenerateMcqsWithGroq = async () => {
    const textToUse = mcqContentInput.trim() || currentLesson?.content || description;
    if (!textToUse || textToUse.length < 10) {
      setAiError("Please provide or paste at least 10 characters of educational lesson content.");
      return;
    }

    setIsGeneratingMcq(true);
    setAiError(null);

    try {
      const res = await aiApi.generateMcqs({
        content: textToUse,
        numberOfQuestions: mcqNumQuestions,
        difficulty: mcqDifficulty,
      });

      if (res.success && res.questions) {
        const updatedModules = [...modules];
        updatedModules[selectedModIndex].lessons[selectedLesIndex].quiz = {
          id: `quiz_${Date.now()}`,
          title: `${currentLesson?.title || "Lesson"} Knowledge Check`,
          passingScore: 70,
          questions: res.questions,
        };
        setModules(updatedModules);
      }
    } catch (err: any) {
      setAiError(err.message || "Failed to generate MCQs using Groq AI.");
    } finally {
      setIsGeneratingMcq(false);
    }
  };

  // Manual Quiz Editing Handlers
  const addManualQuestion = () => {
    const updatedModules = [...modules];
    const currentQuiz = updatedModules[selectedModIndex].lessons[selectedLesIndex].quiz || {
      id: `quiz_${Date.now()}`,
      title: `${currentLesson?.title || "Lesson"} Quiz`,
      passingScore: 70,
      questions: [],
    };

    currentQuiz.questions.push({
      id: `q_${Date.now()}`,
      question: "New Multiple Choice Question",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 0,
      explanation: "Add explanation for why this option is correct.",
    });

    updatedModules[selectedModIndex].lessons[selectedLesIndex].quiz = currentQuiz;
    setModules(updatedModules);
  };

  const removeQuestion = (qIdx: number) => {
    const updatedModules = [...modules];
    const currentQuiz = updatedModules[selectedModIndex].lessons[selectedLesIndex].quiz;
    if (!currentQuiz) return;
    currentQuiz.questions = currentQuiz.questions.filter((_, idx) => idx !== qIdx);
    setModules(updatedModules);
  };

  const updateQuestionField = (qIdx: number, field: keyof MCQuestion, val: any) => {
    const updatedModules = [...modules];
    const currentQuiz = updatedModules[selectedModIndex].lessons[selectedLesIndex].quiz;
    if (!currentQuiz || !currentQuiz.questions[qIdx]) return;
    (currentQuiz.questions[qIdx] as any)[field] = val;
    setModules(updatedModules);
  };

  const updateOptionText = (qIdx: number, optIdx: number, text: string) => {
    const updatedModules = [...modules];
    const currentQuiz = updatedModules[selectedModIndex].lessons[selectedLesIndex].quiz;
    if (!currentQuiz || !currentQuiz.questions[qIdx]) return;
    currentQuiz.questions[qIdx].options[optIdx] = text;
    setModules(updatedModules);
  };

  // Final Course Save & Publish
  const handleSaveCourse = async (published: boolean) => {
    if (!title.trim() || !description.trim()) {
      setError("Please fill in course title and description.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Flatten all lessons for top-level lessons catalog compatibility
    const flattenedLessons = modules.flatMap((mod, mIdx) =>
      mod.lessons.map((les, lIdx) => ({
        ...les,
        id: les.id || `m${mIdx}_l${lIdx}`,
      }))
    );

    const payload = {
      title,
      description,
      category,
      level,
      language,
      duration,
      price,
      thumbnail,
      status: published ? "published" : "draft",
      published,
      curriculum: modules,
      lessons: flattenedLessons,
      whatYouWillLearn: learningObjectives,
      prerequisites,
      tags: [category, level, "Full Stack"],
    };

    try {
      if (courseToEdit?.id) {
        await coursesApi.update(courseToEdit.id, payload);
      } else {
        await coursesApi.create(payload);
      }
      onCourseCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#112D4E]/60  flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-lg shadow-md border border-[#112D4E]/[.12] p-5 sm:p-7 space-y-5 my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#112D4E]/[.12] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-lg bg-[#112D4E]/[.04] text-[#3F72AF]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#112D4E]">
                {courseToEdit ? "Edit Course & Curriculum" : "Course Creator Studio"}
              </h2>
              <p className="text-xs text-[#112D4E]/[.55]">
                Design modules, upload HD videos & PDFs, and generate AI Quizzes with Groq
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#112D4E]/[.55] hover:text-[#112D4E]/[.72] rounded-full hover:bg-[#112D4E]/[.04] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] text-[#112D4E] text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Studio Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0 overflow-y-auto pr-1">
          {/* Left Column: Module & Lesson Tree Sidebar (4 cols) */}
          <div className="lg:col-span-4 bg-[#112D4E]/[.04] p-4 rounded-lg border border-[#112D4E]/[.12] space-y-4 flex flex-col max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#112D4E]/[.12]">
              <span className="text-xs font-black text-[#112D4E] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#3F72AF]" />
                Curriculum Structure
              </span>
              <button
                type="button"
                onClick={addModule}
                className="px-2.5 py-1 rounded-lg bg-[#3F72AF] text-white font-bold text-[11px] hover:bg-[#112D4E] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Module
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {modules.map((mod, mIdx) => (
                <div
                  key={mod.id || mIdx}
                  className="bg-white rounded-xl border border-[#112D4E]/[.12] p-2.5 space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <input
                      type="text"
                      value={mod.title}
                      onChange={(e) => {
                        const next = [...modules];
                        next[mIdx].title = e.target.value;
                        setModules(next);
                      }}
                      className="text-xs font-bold text-[#112D4E] bg-transparent border-b border-dashed border-[#112D4E]/[.12] focus:outline-none focus:border-[#112D4E]/[.12] w-full"
                    />
                    {modules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeModule(mIdx)}
                        className="text-[#112D4E]/[.55] hover:text-[#112D4E] p-1"
                        title="Delete Module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Lessons list */}
                  <div className="space-y-1.5 pl-2 border-l-2 border-[#112D4E]/[.12]">
                    {mod.lessons.map((les, lIdx) => {
                      const isSelected = selectedModIndex === mIdx && selectedLesIndex === lIdx;
                      return (
                        <div
                          key={les.id || lIdx}
                          onClick={() => {
                            setSelectedModIndex(mIdx);
                            setSelectedLesIndex(lIdx);
                          }}
                          className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? "bg-[#112D4E]/[.04] border border-[#3F72AF] text-[#3F72AF] font-bold"
                              : "text-[#112D4E]/[.72] hover:bg-[#112D4E]/[.04]"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Video className="w-3.5 h-3.5 shrink-0 text-[#112D4E]/[.55]" />
                            <span className="truncate">{les.title}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {les.videoUrl && (
                              <span className="w-2 h-2 rounded-full bg-[#112D4E]/[.04]" title="Video Attached" />
                            )}
                            {les.resources && les.resources.length > 0 && (
                              <span className="w-2 h-2 rounded-full bg-[#112D4E]/[.04]" title="PDF Attached" />
                            )}
                            {les.quiz?.questions && les.quiz.questions.length > 0 && (
                              <span className="w-2 h-2 rounded-full bg-[#112D4E]/[.04]" title="Quiz Attached" />
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => addLesson(mIdx)}
                      className="text-[11px] font-bold text-[#3F72AF] hover:underline flex items-center gap-1 pt-1"
                    >
                      <Plus className="w-3 h-3" /> Add Lesson
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Selected Lesson Detailed Editor (8 cols) */}
          <div className="lg:col-span-8 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {currentLesson ? (
              <div className="space-y-4">
                {/* Lesson Header Inputs */}
                <div className="p-4 rounded-lg bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-[#112D4E]/[.72] block mb-1">Lesson Title</label>
                      <input
                        type="text"
                        value={currentLesson.title}
                        onChange={(e) => {
                          const next = [...modules];
                          next[selectedModIndex].lessons[selectedLesIndex].title = e.target.value;
                          setModules(next);
                        }}
                        className="w-full text-xs font-bold p-2.5 rounded-xl bg-white border border-[#112D4E]/[.12] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-[#112D4E]/[.72] block mb-1">Duration</label>
                      <input
                        type="text"
                        value={currentLesson.duration}
                        onChange={(e) => {
                          const next = [...modules];
                          next[selectedModIndex].lessons[selectedLesIndex].duration = e.target.value;
                          setModules(next);
                        }}
                        placeholder="15m"
                        className="w-full text-xs p-2.5 rounded-xl bg-white border border-[#112D4E]/[.12] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#112D4E] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentLesson.isFreePreview || false}
                        onChange={(e) => {
                          const next = [...modules];
                          next[selectedModIndex].lessons[selectedLesIndex].isFreePreview = e.target.checked;
                          setModules(next);
                        }}
                        className="w-4 h-4 accent-[#3F72AF]"
                      />
                      <span>Mark as Free Preview Lesson</span>
                    </label>

                    {modules[selectedModIndex].lessons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLesson(selectedModIndex, selectedLesIndex)}
                        className="text-xs font-bold text-[#112D4E] hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Lesson
                      </button>
                    )}
                  </div>
                </div>

                {/* Lesson Sub-Tabs: Video / Article / PDF Resources / AI Quiz / Settings */}
                <div className="flex items-center gap-2 border-b border-[#112D4E]/[.12] pb-1">
                  {[
                    { id: "video", label: "Video Upload", icon: Video },
                    { id: "content", label: "Article / Notes", icon: FileText },
                    { id: "pdf", label: "PDFs & Resources", icon: Download },
                    { id: "quiz", label: "Groq AI Quiz", icon: Sparkles },
                    { id: "settings", label: "Course Details", icon: BookOpen },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#3F72AF] text-white shadow-sm"
                            : "bg-[#112D4E]/[.04] text-[#112D4E]/[.72] hover:bg-[#112D4E]/[.08]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* TAB 1: VIDEO UPLOAD */}
                {activeTab === "video" && (
                  <div className="p-4 rounded-lg bg-white border border-[#112D4E]/[.12] space-y-4">
                    <h4 className="text-xs font-black text-[#112D4E] uppercase tracking-wider flex items-center gap-2">
                      <Video className="w-4 h-4 text-[#3F72AF]" /> Lesson Video Media
                    </h4>

                    {currentLesson.videoUrl ? (
                      <div className="space-y-3">
                        <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-md">
                          <video
                            src={currentLesson.videoUrl}
                            controls
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#112D4E] font-bold flex items-center gap-1">
                            <Check className="w-4 h-4 stroke-[3]" /> Video Attached ({currentLesson.videoUrl.slice(0, 35)}...)
                          </span>
                          <div className="flex gap-2">
                            <label className="px-3 py-1.5 rounded-xl bg-[#112D4E]/[.04] text-[#112D4E] font-bold hover:bg-[#112D4E]/[.08] cursor-pointer">
                              <span>Replace Video</span>
                              <input
                                type="file"
                                accept="video/mp4,video/webm,video/quicktime"
                                onChange={handleVideoUpload}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...modules];
                                next[selectedModIndex].lessons[selectedLesIndex].videoUrl = "";
                                setModules(next);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#112D4E]/[.04] text-[#112D4E] font-bold hover:bg-[#112D4E]/[.04]"
                            >
                              Remove Video
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-[#112D4E]/[.12] rounded-lg p-6 text-center space-y-3 hover:border-[#112D4E]/[.12] transition-all bg-[#112D4E]/[.04]">
                        <div className="w-12 h-12 rounded-full bg-[#112D4E]/[.04] text-[#3F72AF] flex items-center justify-center mx-auto">
                          <Video className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#112D4E]">
                            Upload Lesson Video from Local Computer
                          </p>
                          <p className="text-[11px] text-[#112D4E]/[.55]">
                            Supported: MP4, WebM, QuickTime MOV (Up to 100MB)
                          </p>
                        </div>

                        <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3F72AF] text-white font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <span>Choose Video File</span>
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime"
                            onChange={handleVideoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}

                    {/* Video Progress Bar */}
                    {uploadProgress[`video_${selectedModIndex}_${selectedLesIndex}`] !== undefined && (
                      <div className="space-y-1.5 p-3 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12]">
                        <div className="flex justify-between text-xs font-bold text-[#3F72AF]">
                          <span>{uploadStatusMsg[`video_${selectedModIndex}_${selectedLesIndex}`]}</span>
                          <span>{uploadProgress[`video_${selectedModIndex}_${selectedLesIndex}`]}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#112D4E]/[.08] overflow-hidden">
                          <div
                            className="h-full bg-[#3F72AF] transition-all duration-300"
                            style={{
                              width: `${uploadProgress[`video_${selectedModIndex}_${selectedLesIndex}`]}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: ARTICLE / NOTES CONTENT */}
                {activeTab === "content" && (
                  <div className="p-4 rounded-lg bg-white border border-[#112D4E]/[.12] space-y-3">
                    <h4 className="text-xs font-black text-[#112D4E] uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#3F72AF]" /> Lesson Text / Markdown Notes
                    </h4>
                    <p className="text-[11px] text-[#112D4E]/[.55]">
                      Provide rich lecture notes, explanations, or code snippets for students.
                    </p>
                    <textarea
                      rows={10}
                      value={currentLesson.content || ""}
                      onChange={(e) => {
                        const next = [...modules];
                        next[selectedModIndex].lessons[selectedLesIndex].content = e.target.value;
                        setModules(next);
                      }}
                      placeholder="Write your lesson text, code snippets, or lecture outline here..."
                      className="w-full text-xs font-mono p-3.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                    />
                  </div>
                )}

                {/* TAB 3: PDFS & RESOURCES */}
                {activeTab === "pdf" && (
                  <div className="p-4 rounded-lg bg-white border border-[#112D4E]/[.12] space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-[#112D4E] uppercase tracking-wider flex items-center gap-2">
                        <Download className="w-4 h-4 text-[#3F72AF]" /> PDFs, Slide Decks & Code Attachments
                      </h4>
                      <label className="px-3 py-1.5 rounded-xl bg-[#3F72AF] text-white font-bold text-xs hover:bg-[#112D4E] cursor-pointer flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add PDF Resource</span>
                        <input
                          type="file"
                          accept="application/pdf,.pdf,.zip,.docx"
                          onChange={handlePdfUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Resources list */}
                    {currentLesson.resources && currentLesson.resources.length > 0 ? (
                      <div className="space-y-2">
                        {currentLesson.resources.map((res, rIdx) => (
                          <div
                            key={res.id || rIdx}
                            className="flex items-center justify-between p-3 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <File className="w-4 h-4 text-[#112D4E] shrink-0" />
                              <div className="truncate">
                                <p className="font-bold text-[#112D4E] truncate">{res.fileName}</p>
                                <p className="text-[10px] text-[#112D4E]/[.55]">
                                  {res.fileSize ? `${Math.round(res.fileSize / 1024)} KB` : "PDF Resource"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-[#112D4E]/[.04] text-[#3F72AF] font-bold text-[11px] hover:underline flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" /> View
                              </a>
                              <button
                                type="button"
                                onClick={() => removeResource(rIdx)}
                                className="p-1 text-[#112D4E]/[.55] hover:text-[#112D4E]"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#112D4E]/[.55] text-center py-6">
                        No PDF resources attached to this lesson yet. Click "+ Add PDF Resource" above.
                      </p>
                    )}
                  </div>
                )}

                {/* TAB 4: GROQ AI MCQ GENERATION & QUIZ BUILDER */}
                {activeTab === "quiz" && (
                  <div className="p-4 rounded-lg bg-white border border-[#112D4E]/[.12] space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[#112D4E]/[.12]">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#3F72AF]" />
                        <h4 className="text-xs font-black text-[#112D4E] uppercase tracking-wider">
                          Groq AI Multiple Choice Generator
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={addManualQuestion}
                        className="px-2.5 py-1 rounded-lg bg-[#112D4E]/[.04] text-[#112D4E] font-bold text-[11px] hover:bg-[#112D4E]/[.08] cursor-pointer"
                      >
                        + Add Manual Question
                      </button>
                    </div>

                    {aiError && (
                      <div className="p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] text-[#112D4E] text-xs font-bold">
                        {aiError}
                      </div>
                    )}

                    {/* Prompt Content Input */}
                    <div className="space-y-3 p-3.5 rounded-lg bg-[#112D4E]/50 border border-[#112D4E]/[.12]">
                      <div>
                        <label className="text-[11px] font-bold text-[#112D4E] block mb-1">
                          Source Content for Groq AI Assessment
                        </label>
                        <textarea
                          rows={3}
                          value={mcqContentInput}
                          onChange={(e) => setMcqContentInput(e.target.value)}
                          placeholder="Paste lesson text, key concepts, or leave blank to automatically use current lesson content..."
                          className="w-full text-xs p-2.5 rounded-xl bg-white border border-[#112D4E]/[.12] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-xs">
                          <label className="font-bold text-[#112D4E]">Questions:</label>
                          <select
                            value={mcqNumQuestions}
                            onChange={(e) => setMcqNumQuestions(Number(e.target.value))}
                            className="p-1.5 rounded-lg bg-white border border-[#112D4E]/[.12] text-xs font-bold"
                          >
                            <option value={3}>3 Questions</option>
                            <option value={5}>5 Questions</option>
                            <option value={10}>10 Questions</option>
                          </select>

                          <label className="font-bold text-[#112D4E] ml-2">Difficulty:</label>
                          <select
                            value={mcqDifficulty}
                            onChange={(e) => setMcqDifficulty(e.target.value as any)}
                            className="p-1.5 rounded-lg bg-white border border-[#112D4E]/[.12] text-xs font-bold"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          disabled={isGeneratingMcq}
                          onClick={handleGenerateMcqsWithGroq}
                          className="px-4 py-2 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{isGeneratingMcq ? "Generating with Groq AI..." : "Generate MCQs with Groq"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Quiz Questions List / Editor */}
                    <div className="space-y-4 pt-2">
                      {currentLesson.quiz?.questions && currentLesson.quiz.questions.length > 0 ? (
                        currentLesson.quiz.questions.map((q, qIdx) => (
                          <div
                            key={q.id || qIdx}
                            className="p-4 rounded-lg bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 space-y-1">
                                <label className="text-[10px] font-black text-[#112D4E]/[.55] uppercase">
                                  Question {qIdx + 1}
                                </label>
                                <input
                                  type="text"
                                  value={q.question}
                                  onChange={(e) => updateQuestionField(qIdx, "question", e.target.value)}
                                  className="w-full text-xs font-bold p-2 rounded-lg bg-white border border-[#112D4E]/[.12] focus:outline-none"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeQuestion(qIdx)}
                                className="p-1 text-[#112D4E]/[.55] hover:text-[#112D4E]"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* 4 Options */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-[#112D4E]/[.55] uppercase">
                                4 Options (Click radio button to mark correct answer)
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.options.map((opt, optIdx) => (
                                  <div
                                    key={optIdx}
                                    className={`flex items-center gap-2 p-2 rounded-xl border transition-colors ${
                                      q.correctAnswer === optIdx
                                        ? "bg-[#112D4E]/[.04] border-[#3F72AF] font-bold"
                                        : "bg-white border-[#112D4E]/[.12]"
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`correct_${qIdx}`}
                                      checked={q.correctAnswer === optIdx}
                                      onChange={() => updateQuestionField(qIdx, "correctAnswer", optIdx)}
                                      className="accent-[#112D4E] cursor-pointer"
                                    />
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                                      className="w-full text-xs bg-transparent focus:outline-none"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Explanation */}
                            <div>
                              <label className="text-[10px] font-bold text-[#112D4E]/[.55] uppercase block mb-1">
                                Explanation
                              </label>
                              <input
                                type="text"
                                value={q.explanation}
                                onChange={(e) => updateQuestionField(qIdx, "explanation", e.target.value)}
                                placeholder="Why is this answer correct?"
                                className="w-full text-xs p-2 rounded-lg bg-white border border-[#112D4E]/[.12] focus:outline-none"
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[#112D4E]/[.55] text-center py-4">
                          No quiz questions generated yet. Click "Generate MCQs with Groq" above.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 5: GENERAL COURSE METADATA SETTINGS */}
                {activeTab === "settings" && (
                  <div className="p-4 rounded-lg bg-white border border-[#112D4E]/[.12] space-y-4 text-xs font-semibold text-[#112D4E]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-[#112D4E] mb-1">Course Title</label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. Modern Full-Stack Web Development"
                          className="w-full p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#112D4E] mb-1">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none"
                        >
                          <option value="Web Development">Web Development</option>
                          <option value="AI & Machine Learning">AI & Machine Learning</option>
                          <option value="System Design & DSA">System Design & DSA</option>
                          <option value="Cyber Security">Cyber Security</option>
                          <option value="Data Science">Data Science</option>
                          <option value="Cloud Computing">Cloud Computing</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#112D4E] mb-1">Course Overview & Description</label>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Comprehensive summary of the curriculum and target outcomes..."
                        className="w-full p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-[#112D4E] mb-1">Level</label>
                        <select
                          value={level}
                          onChange={(e) => setLevel(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-[#112D4E] mb-1">Language</label>
                        <input
                          type="text"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#112D4E] mb-1">Access</label>
                        <p className="p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] text-[#112D4E] font-bold">Free for everyone</p>
                      </div>
                    </div>

                    {/* Thumbnail */}
                    <div>
                      <label className="block font-bold text-[#112D4E] mb-1">Course Thumbnail</label>
                      <div className="flex items-center gap-4">
                        <img
                          src={thumbnail}
                          alt="Thumbnail"
                          className="w-24 h-14 rounded-xl object-cover border border-[#112D4E]/[.12] shadow-2xs"
                        />
                        <label className="px-4 py-2 rounded-xl bg-[#112D4E]/[.04] hover:bg-[#112D4E]/[.08] text-[#112D4E] font-bold text-xs cursor-pointer flex items-center gap-2 transition-all">
                          <Upload className="w-4 h-4" />
                          <span>Upload from Computer</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-[#112D4E]/[.55] py-12">
                Select a module lesson from the left column to begin editing.
              </p>
            )}
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="pt-3 border-t border-[#112D4E]/[.12] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#112D4E]/[.72] hover:bg-[#112D4E]/[.04] cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSaveCourse(false)}
              className="px-4 py-2.5 rounded-xl border border-[#112D4E]/[.12] text-[#112D4E] font-bold text-xs hover:bg-[#112D4E]/[.04] cursor-pointer disabled:opacity-50"
            >
              Save as Draft
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSaveCourse(true)}
              className="px-6 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? "Publishing Course..." : "Publish Course Publicly"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

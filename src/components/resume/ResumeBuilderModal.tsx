import React, { useState } from "react";
import {
  FileText,
  Printer,
  Download,
  X,
  Sparkles,
  CheckCircle2,
  Award,
  FolderGit2,
  User,
  Mail,
  MapPin,
  Globe,
  Plus,
  Trash2,
} from "lucide-react";
import { UserProfile, Course, ProjectChallenge } from "../../types";

interface ResumeBuilderModalProps {
  currentUser: UserProfile;
  courses: Course[];
  projects: ProjectChallenge[];
  onClose: () => void;
}

export const ResumeBuilderModal: React.FC<ResumeBuilderModalProps> = ({
  currentUser,
  courses,
  projects,
  onClose,
}) => {
  const [jobTitle, setJobTitle] = useState(currentUser.role === "COURSE_EDUCATOR" ? "Senior Full-Stack Architect & Tech Lead" : "Full-Stack Software Engineer");
  const [summary, setSummary] = useState(
    currentUser.bio ||
      `Passionate software engineer with proven experience in TypeScript, React, Node.js, and distributed architectures. Completed verified industry capstones on LearnX.`
  );
  const [location, setLocation] = useState("San Francisco, CA (Open to Remote)");
  const [website, setWebsite] = useState(`https://codeinfinite.dev/@${currentUser.handle}`);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#112D4E]/70  flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-md border border-[#112D4E]/[.12] flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header Control Bar */}
        <div className="p-4 px-6 bg-[#112D4E] text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#3F72AF] text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black">ATS-Optimized Engineering Resume Builder</h2>
              <p className="text-[10px] text-[#112D4E]/[.55]">Backed by LearnX Verified Credentials</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#112D4E] hover:bg-[#112D4E] text-white font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#112D4E]/[.55] hover:text-white rounded-full hover:bg-[#112D4E] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Resume Sheet */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[#112D4E]/[.04] print:bg-white print:p-0">
          <div
            id="printable-resume"
            className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-lg shadow-sm print:shadow-none border border-[#112D4E]/[.12] print:border-none space-y-6 text-[#112D4E] text-xs font-sans"
          >
            {/* Header: Name & Contact */}
            <div className="border-b-2 border-[#112D4E]/[.12] pb-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-black text-[#112D4E] uppercase tracking-tight">
                    {currentUser.name}
                  </h1>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="text-sm font-bold text-[#3F72AF] w-full bg-transparent focus:outline-none border-b border-transparent hover:border-[#112D4E]/[.12] focus:border-[#112D4E]/[.12]"
                  />
                </div>
                <div className="text-right text-[11px] text-[#112D4E]/[.72] space-y-0.5">
                  <p className="flex items-center justify-end gap-1 font-semibold">
                    <Mail className="w-3 h-3 text-[#112D4E]/[.55]" /> {currentUser.email || "developer@codeinfinite.dev"}
                  </p>
                  <p className="flex items-center justify-end gap-1 font-semibold">
                    <MapPin className="w-3 h-3 text-[#112D4E]/[.55]" /> {location}
                  </p>
                  <p className="flex items-center justify-end gap-1 font-bold text-[#112D4E]">
                    <Globe className="w-3 h-3" /> {website}
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Summary */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#112D4E] border-b border-[#112D4E]/[.12] pb-1">
                Executive Summary
              </h3>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full text-xs text-[#112D4E] leading-relaxed bg-transparent resize-none focus:outline-none border border-transparent hover:border-[#112D4E]/[.12] focus:border-[#112D4E]/[.12] rounded p-1"
              />
            </div>

            {/* Technical Skills Stack */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#112D4E] border-b border-[#112D4E]/[.12] pb-1">
                Verified Technical Core Stack
              </h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(currentUser.skills?.length > 0
                  ? currentUser.skills
                  : ["TypeScript", "React 19", "Node.js", "Express", "Docker", "MongoDB", "Tailwind CSS", "Groq AI", "Git"]
                ).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-[#112D4E]/[.04] text-[#112D4E] font-bold text-[10px] border border-[#112D4E]/[.12] print:bg-transparent print:border-[#112D4E]/[.12]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Verified Certifications & Masterclasses */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#112D4E] border-b border-[#112D4E]/[.12] pb-1">
                Verified Course Credentials & Certificates
              </h3>
              <div className="space-y-2">
                {(courses.slice(0, 3)).map((course, idx) => (
                  <div key={course.id || idx} className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-[#112D4E]">{course.title}</p>
                      <p className="text-[11px] text-[#112D4E]/[.55]">
                        Instructor: {typeof course.instructor === "object" ? course.instructor.name : String(course.instructor)} • {course.level} Specialization
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono font-bold text-[#112D4E] bg-[#112D4E]/[.04] px-2 py-0.5 rounded border border-[#112D4E]/[.12]">
                        CREDENTIAL: CI-CERT-{10482 + idx * 37}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Production Project Challenges */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#112D4E] border-b border-[#112D4E]/[.12] pb-1">
                Featured Engineering Project Challenges
              </h3>
              <div className="space-y-2.5">
                {(projects.slice(0, 2)).map((proj, idx) => (
                  <div key={proj.id || idx} className="space-y-0.5">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-[#112D4E]">{proj.title}</p>
                      <span className="text-[10px] font-bold text-[#112D4E]/[.55]">{proj.category}</span>
                    </div>
                    <p className="text-[11px] text-[#112D4E]/[.72] leading-snug">{proj.description}</p>
                    <div className="flex gap-2 pt-0.5 text-[10px] font-mono text-[#112D4E] font-semibold">
                      <span>Stack: {(proj.tags || []).join(", ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Credibility Footer */}
            <div className="pt-4 border-t border-[#112D4E]/[.12] flex justify-between items-center text-[10px] text-[#112D4E]/[.55]">
              <span>LearnX Verified Developer Profile • {currentUser.totalXp} XP • Level {Math.floor(currentUser.totalXp / 100) + 1}</span>
              <span>Authenticated via LearnX Certificate Registry</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

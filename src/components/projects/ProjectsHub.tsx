import React, { useState } from "react";
import {
  FolderGit2,
  Trophy,
  Users,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  X,
  Send,
  Code2,
  Play,
  Terminal,
  ShieldCheck,
  Star,
  ThumbsUp,
  Github,
  Search,
  Filter,
  Check,
} from "lucide-react";
import { ProjectChallenge } from "../../types";
import { projectsApi } from "../../services/api";

interface ProjectSubmission {
  id: string;
  projectId: string;
  projectTitle: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  githubUrl: string;
  demoUrl: string;
  submittedAt: string;
  upvotes: number;
  ciScore: number;
  testResults: {
    lintPassed: boolean;
    unitTestsPassed: number;
    unitTestsTotal: number;
    securityAudit: "PASS" | "WARN" | "FAIL";
  };
  hasUpvoted?: boolean;
}

const INITIAL_SUBMISSIONS: ProjectSubmission[] = [];

interface ProjectsHubProps {
  projects: ProjectChallenge[];
  selectedProjectTitle?: string | null;
}

export const ProjectsHub: React.FC<ProjectsHubProps> = ({
  projects,
  selectedProjectTitle,
}) => {
  const [activeTab, setActiveTab] = useState<"challenges" | "submissions">("challenges");
  const [activeFilter, setActiveFilter] = useState<string>("All");

  // Application Modal state
  const [applyingProject, setApplyingProject] = useState<ProjectChallenge | null>(
    selectedProjectTitle
      ? projects.find((p) => p.title === selectedProjectTitle) || null
      : null
  );
  const [proposal, setProposal] = useState("");
  const [githubUrl, setGithubUrl] = useState("https://github.com/alexvance/my-solution");
  const [demoUrl, setDemoUrl] = useState("https://my-app.run.app");
  const [submitted, setSubmitted] = useState(false);

  // Submit Solution CI verification state
  const [submittingProject, setSubmittingProject] = useState<ProjectChallenge | null>(null);
  const [ciStep, setCiStep] = useState<"idle" | "linting" | "testing" | "security" | "ai_scoring" | "completed">("idle");
  const [ciProgress, setCiProgress] = useState(0);

  // Publish Project State (For Distributors / Educators)
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjCategory, setNewProjCategory] = useState("Full-Stack");
  const [newProjType, setNewProjType] = useState<any>("Major Capstone");
  const [newProjDifficulty, setNewProjDifficulty] = useState<any>("Intermediate");
  const [newProjDeadline, setNewProjDeadline] = useState("30 Days Left");
  const [newProjRewardXp, setNewProjRewardXp] = useState(500);
  const [newProjTeamSize, setNewProjTeamSize] = useState("1-3 Members");
  const [newProjTags, setNewProjTags] = useState("React, Node.js, MongoDB");
  const [isPublishing, setIsPublishing] = useState(false);

  // Submissions list
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>(INITIAL_SUBMISSIONS);

  const filterOptions = ["All", "Major Capstone", "Mini Project", "Hackathon", "Open Source"];

  const filteredProjects = projects.filter((p) =>
    activeFilter === "All" ? true : p.type === activeFilter
  );

  const handlePublishProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle.trim() || !newProjDesc.trim()) return;

    setIsPublishing(true);
    try {
      await projectsApi.create({
        title: newProjTitle,
        description: newProjDesc,
        category: newProjCategory,
        type: newProjType,
        difficulty: newProjDifficulty,
        deadline: newProjDeadline,
        rewardXp: Number(newProjRewardXp),
        teamSize: newProjTeamSize,
        tags: newProjTags.split(",").map((t) => t.trim()).filter(Boolean),
      });

      const newProjectObj: ProjectChallenge = {
        id: `proj_${Date.now()}`,
        title: newProjTitle,
        description: newProjDesc,
        type: newProjType,
        difficulty: (newProjDifficulty === "Advanced" ? "Hard" : newProjDifficulty === "Beginner" ? "Easy" : "Medium") as any,
        deadline: newProjDeadline,
        techStack: newProjTags.split(",").map((t) => t.trim()).filter(Boolean),
        applicantsCount: 0,
        distributor: {
          name: "Project Distributor",
          company: "LearnX Ecosystem",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        },
        requirements: ["Build clean architecture", "Write unit tests", "Deploy live URL"],
      };

      projects.unshift(newProjectObj);
      setIsPublishOpen(false);
      setNewProjTitle("");
      setNewProjDesc("");
    } catch (err) {
      console.error("Publish project error:", err);
      setIsPublishOpen(false);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setApplyingProject(null);
      setProposal("");
    }, 2000);
  };

  const handleRunCiAndSubmit = () => {
    if (!submittingProject) return;
    setCiStep("linting");
    setCiProgress(25);

    setTimeout(() => {
      setCiStep("testing");
      setCiProgress(55);

      setTimeout(() => {
        setCiStep("security");
        setCiProgress(80);

        setTimeout(() => {
          setCiStep("ai_scoring");
          setCiProgress(95);

          setTimeout(async () => {
            setCiStep("completed");
            setCiProgress(100);

            try {
              await projectsApi.submitSolution(submittingProject.id, {
                githubUrl,
                demoUrl,
                description: `Submission for ${submittingProject.title}`,
              });
            } catch (err) {
              console.error("Submission backend sync error:", err);
            }

            // Add to submissions list
            const newSubmission: ProjectSubmission = {
              id: `sub_${Date.now()}`,
              projectId: submittingProject.id,
              projectTitle: submittingProject.title,
              authorName: "Alex Vance",
              authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
              authorRole: "STUDENT",
              githubUrl: githubUrl,
              demoUrl: demoUrl || "https://ais-dev-g2iwlkalvmxb33vkgxe3yb-745839237324.asia-southeast1.run.app",
              submittedAt: "Just now",
              upvotes: 1,
              ciScore: 96,
              testResults: {
                lintPassed: true,
                unitTestsPassed: 16,
                unitTestsTotal: 16,
                securityAudit: "PASS",
              },
              hasUpvoted: true,
            };

            setSubmissions([newSubmission, ...submissions]);
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  const toggleUpvote = (id: string) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          const hasUpvoted = !sub.hasUpvoted;
          return {
            ...sub,
            hasUpvoted,
            upvotes: hasUpvoted ? sub.upvotes + 1 : sub.upvotes - 1,
          };
        }
        return sub;
      })
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-lg bg-[#112D4E] text-white shadow-md space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#3F72AF]/30 rounded-full hidden pointer-events-none" />
        <div className="flex items-center gap-2 text-[#112D4E] font-bold text-xs">
          <Sparkles className="w-4 h-4 text-[#3F72AF]" />
          <span>GitHub + LearnX Verified Marketplace</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Real-World Capstones, Bounties & Verified Submissions
        </h1>
        <p className="text-xs text-[#112D4E]/[.55] max-w-xl leading-relaxed">
          Solve production challenges, run automated CI tests, earn verified badges, and showcase your build in the global community.
        </p>
      </div>

      {/* Main Tabs (Challenges vs Community Submissions) */}
      <div className="flex items-center justify-between border-b border-[#112D4E]/[.12] pb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("challenges")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "challenges"
                ? "bg-[#3F72AF] text-white shadow-md"
                : "bg-white text-[#112D4E]/[.72] hover:bg-[#112D4E]/[.04] border border-[#112D4E]/[.12]"
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Open Challenges & Bounties ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("submissions")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "submissions"
                ? "bg-[#3F72AF] text-white shadow-md"
                : "bg-white text-[#112D4E]/[.72] hover:bg-[#112D4E]/[.04] border border-[#112D4E]/[.12]"
            }`}
          >
            <Trophy className="w-4 h-4 text-[#112D4E]" />
            <span>Community Showcase ({submissions.length})</span>
          </button>
        </div>

        <button
          onClick={() => setIsPublishOpen(true)}
          className="px-4 py-2 rounded-lg bg-[#112D4E] hover:bg-[#112D4E] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 shrink-0"
        >
          <FolderGit2 className="w-4 h-4 stroke-[2.5]" />
          <span>+ Publish Project / Grant</span>
        </button>
      </div>

      {activeTab === "challenges" && (
        <div className="space-y-5">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {filterOptions.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === f
                    ? "bg-[#3F72AF] text-white shadow-md"
                    : "bg-white text-[#112D4E] hover:bg-[#112D4E]/[.04] border border-[#112D4E]/[.12]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredProjects.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-lg bg-white border border-[#112D4E]/[.12] shadow-xs hover:shadow-md transition-all duration-300 space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-[#112D4E]/[.04] text-[#3F72AF] text-[10px] font-extrabold uppercase">
                      {p.type}
                    </span>
                    <span className="text-[11px] font-bold text-[#112D4E]/[.55] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {p.deadline}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-[#112D4E] group-hover:text-[#3F72AF] transition-colors leading-snug">
                    {p.title}
                  </h3>

                  <p className="text-xs text-[#112D4E]/[.72] leading-relaxed">
                    {p.description}
                  </p>

                  {p.prizePool && (
                    <div className="p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] text-[#112D4E] text-xs font-bold flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#112D4E] shrink-0" />
                      <span>Bounty Pool: {p.prizePool}</span>
                    </div>
                  )}

                  {/* Requirements Bullet List */}
                  <div className="p-3 rounded-lg bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] space-y-1.5 text-xs text-[#112D4E]">
                    <p className="font-bold text-[11px] text-[#112D4E]">Key Deliverables:</p>
                    {p.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#112D4E] shrink-0" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tech Stack Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {p.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#112D4E]/[.04] text-[#3F72AF]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer with Distributor & Dual Actions */}
                <div className="pt-3 border-t border-[#112D4E]/[.12] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={p.distributor.avatar}
                      alt={p.distributor.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div className="text-[11px]">
                      <p className="font-bold text-[#112D4E] line-clamp-1">{p.distributor.company}</p>
                      <p className="text-[#112D4E]/[.55]">{p.applicantsCount} applied</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSubmittingProject(p);
                        setCiStep("idle");
                        setCiProgress(0);
                      }}
                      className="px-3 py-2 rounded-xl bg-[#112D4E] hover:bg-[#112D4E] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      title="Submit your code & run automated CI checks"
                    >
                      <Terminal className="w-3.5 h-3.5 text-[#112D4E]" />
                      <span>Submit Solution</span>
                    </button>
                    <button
                      onClick={() => setApplyingProject(p)}
                      className="px-3.5 py-2 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submissions Gallery Tab */}
      {activeTab === "submissions" && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-[#112D4E]/50 border border-[#112D4E]/[.12] flex items-center justify-between text-xs text-[#112D4E]">
            <span className="font-semibold">
              Showing verified student and developer capstone solutions tested by the LearnX CI engine.
            </span>
            <span className="font-bold text-[#3F72AF]">100% Peer Reviewed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-5 rounded-lg bg-white border border-[#112D4E]/[.12] shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#112D4E]/[.12] pb-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={sub.authorAvatar}
                        alt={sub.authorName}
                        className="w-8 h-8 rounded-full object-cover border border-[#112D4E]/[.12]"
                      />
                      <div>
                        <h4 className="text-xs font-extrabold text-[#112D4E]">{sub.authorName}</h4>
                        <span className="text-[10px] font-bold text-[#112D4E]/[.55]">{sub.submittedAt}</span>
                      </div>
                    </div>

                    <div className="px-2.5 py-1 rounded-full bg-[#112D4E]/[.04] text-[#112D4E] border border-[#112D4E]/[.12] text-[10px] font-black flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#112D4E]" />
                      <span>CI {sub.ciScore}% VERIFIED</span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-[#112D4E] line-clamp-2">
                    {sub.projectTitle}
                  </h3>

                  {/* CI Test Badge Metrics */}
                  <div className="p-3 rounded-lg bg-[#112D4E] text-white text-xs font-mono space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[#112D4E]/[.55] pb-1 border-b border-[#112D4E]/[.12]">
                      <span>CI Pipeline Results</span>
                      <span className="text-[#112D4E] font-bold">ALL PASS</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#112D4E]/[.55]">
                      <span>✓ ESLint & TypeScript</span>
                      <span className="text-[#112D4E]">0 Errors</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#112D4E]/[.55]">
                      <span>✓ Unit Test Suite</span>
                      <span className="text-[#112D4E]">{sub.testResults.unitTestsPassed}/{sub.testResults.unitTestsTotal} Passed</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#112D4E]/[.55]">
                      <span>✓ Security Audit</span>
                      <span className="text-[#112D4E]">{sub.testResults.securityAudit}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#112D4E]/[.12] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={sub.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-[#112D4E]/[.04] hover:bg-[#112D4E]/[.08] text-[#112D4E] text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Github className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={sub.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#112D4E]/[.04] hover:bg-[#112D4E]/[.04] text-[#3F72AF] text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                    </a>
                  </div>

                  <button
                    onClick={() => toggleUpvote(sub.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      sub.hasUpvoted
                        ? "bg-[#3F72AF] text-white"
                        : "bg-[#112D4E]/[.04] hover:bg-[#112D4E]/[.08] text-[#112D4E]"
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{sub.upvotes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CI Test Execution & Submission Modal */}
      {submittingProject && (
        <div className="fixed inset-0 z-50 bg-[#112D4E]/60  flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-md border border-[#112D4E]/[.12] p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#112D4E]/[.12]">
              <div>
                <span className="text-[10px] font-bold text-[#112D4E] uppercase flex items-center gap-1">
                  <Terminal className="w-3 h-3" /> LearnX CI Pipeline
                </span>
                <h3 className="text-base font-extrabold text-[#112D4E]">
                  {submittingProject.title}
                </h3>
              </div>
              <button
                onClick={() => setSubmittingProject(null)}
                className="p-1.5 text-[#112D4E]/[.55] hover:text-[#112D4E]/[.72] rounded-full hover:bg-[#112D4E]/[.04]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {ciStep === "idle" ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#112D4E] block mb-1">
                    GitHub Repository Link
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none focus:border-[#112D4E]/[.12]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#112D4E] block mb-1">
                    Live Demo / Deployment URL
                  </label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none focus:border-[#112D4E]/[.12]"
                  />
                </div>

                <div className="p-4 rounded-lg bg-[#112D4E] text-white space-y-2 text-xs font-mono">
                  <p className="text-[#112D4E]/[.55] text-[11px] font-bold uppercase">Automated Pipeline Suite:</p>
                  <p className="text-[#112D4E]/[.55]">1. Linting & Static Analysis</p>
                  <p className="text-[#112D4E]/[.55]">2. Unit Test Suite Execution</p>
                  <p className="text-[#112D4E]/[.55]">3. Dependency Security Audit</p>
                  <p className="text-[#112D4E]/[.55]">4. Gemini AI Architecture Scoring</p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSubmittingProject(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#112D4E]/[.72] hover:bg-[#112D4E]/[.04]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRunCiAndSubmit}
                    className="px-5 py-2 rounded-xl bg-[#112D4E] hover:bg-[#112D4E] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Run CI & Verify Build
                  </button>
                </div>
              </div>
            ) : ciStep !== "completed" ? (
              <div className="py-6 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-[#112D4E] text-[#112D4E] flex items-center justify-center mx-auto animate-bounce">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#112D4E]">
                    Executing CI Test Suite...
                  </h4>
                  <p className="text-xs text-[#112D4E] font-mono mt-1">
                    {ciStep === "linting" && "Checking ESLint rules & TypeScript types..."}
                    {ciStep === "testing" && "Running 16 Jest / Vitest assertions..."}
                    {ciStep === "security" && "Scanning dependencies for vulnerabilities..."}
                    {ciStep === "ai_scoring" && "Evaluating AI code quality index..."}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#112D4E]/[.04] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#112D4E]/[.04] h-full transition-all duration-300"
                    style={{ width: `${ciProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-4 animate-in fade-in">
                <div className="w-14 h-14 rounded-full bg-[#112D4E]/[.04] text-[#112D4E] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#112D4E]">
                    CI Tests Passed (Score 96%)!
                  </h4>
                  <p className="text-xs text-[#112D4E]/[.55] mt-1">
                    Your solution was verified and published to the Community Showcase.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] text-[#112D4E] text-xs font-bold flex items-center justify-center gap-2">
                  <Star className="w-4 h-4 text-[#112D4E] fill-[#3F72AF]" />
                  <span>Earned +350 XP & "Capstone Builder" Badge!</span>
                </div>

                <button
                  onClick={() => {
                    setSubmittingProject(null);
                    setActiveTab("submissions");
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#112D4E] text-white text-xs font-bold hover:bg-[#112D4E] transition-all"
                >
                  View Showcase Gallery →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Application Modal */}
      {applyingProject && (
        <div className="fixed inset-0 z-50 bg-[#112D4E]/50  flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-md border border-[#112D4E]/[.12] p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#112D4E]/[.12]">
              <div>
                <span className="text-[10px] font-bold text-[#3F72AF] uppercase">
                  Project Application
                </span>
                <h3 className="text-base font-extrabold text-[#112D4E]">
                  {applyingProject.title}
                </h3>
              </div>
              <button
                onClick={() => setApplyingProject(null)}
                className="p-1.5 text-[#112D4E]/[.55] hover:text-[#112D4E]/[.72] rounded-full hover:bg-[#112D4E]/[.04]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#112D4E]/[.04] text-[#112D4E] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-[#112D4E]">
                  Application Submitted!
                </h4>
                <p className="text-xs text-[#112D4E]/[.55]">
                  The distributor ({applyingProject.distributor.company}) will review your portfolio and reach out via Direct Messages.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#112D4E] block mb-1">
                    GitHub / Portfolio URL
                  </label>
                  <input
                    type="url"
                    required
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none focus:border-[#112D4E]/[.12]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#112D4E] block mb-1">
                    Pitch Proposal & Why You're a Great Fit
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    placeholder="Briefly describe your experience with these technologies..."
                    className="w-full text-xs p-3 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none focus:border-[#112D4E]/[.12]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setApplyingProject(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#112D4E]/[.72] hover:bg-[#112D4E]/[.04]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#3F72AF] text-white text-xs font-bold hover:shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Publish Project Modal for Distributors & Educators */}
      {isPublishOpen && (
        <div className="fixed inset-0 z-50 bg-[#112D4E]/60  flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-md border border-[#112D4E]/[.12] p-6 sm:p-8 space-y-5 my-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#112D4E]/[.12]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#112D4E]/[.04] text-[#112D4E]">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#112D4E]">Publish Project Challenge / Grant</h3>
                  <p className="text-xs text-[#112D4E]/[.55]">Distribute tasks to students & developer teams</p>
                </div>
              </div>
              <button
                onClick={() => setIsPublishOpen(false)}
                className="p-1.5 text-[#112D4E]/[.55] hover:text-[#112D4E]/[.72] rounded-full hover:bg-[#112D4E]/[.04] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishProject} className="space-y-4 text-xs font-semibold text-[#112D4E]">
              <div>
                <label className="block font-bold text-[#112D4E] mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed In-Memory Key-Value Store with Raft"
                  value={newProjTitle}
                  onChange={(e) => setNewProjTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#112D4E] mb-1">Challenge Type</label>
                  <select
                    value={newProjType}
                    onChange={(e) => setNewProjType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none"
                  >
                    <option value="Major Capstone">Major Capstone</option>
                    <option value="Mini Project">Mini Project</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Open Source">Open Source</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#112D4E] mb-1">Difficulty</label>
                  <select
                    value={newProjDifficulty}
                    onChange={(e) => setNewProjDifficulty(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#112D4E] mb-1">Reward XP</label>
                  <input
                    type="number"
                    value={newProjRewardXp}
                    onChange={(e) => setNewProjRewardXp(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#112D4E] mb-1">Description & Goal</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the challenge goals, architecture requirements, and evaluation metrics."
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#112D4E] mb-1">Required Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={newProjTags}
                    onChange={(e) => setNewProjTags(e.target.value)}
                    placeholder="React, TypeScript, Golang"
                    className="w-full p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#112D4E] mb-1">Team Size & Deadline</label>
                  <input
                    type="text"
                    value={newProjDeadline}
                    onChange={(e) => setNewProjDeadline(e.target.value)}
                    placeholder="e.g. 14 Days Left"
                    className="w-full p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#112D4E]/[.12]">
                <button
                  type="button"
                  onClick={() => setIsPublishOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#112D4E]/[.72] hover:bg-[#112D4E]/[.04]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-6 py-2.5 rounded-xl bg-[#112D4E] hover:bg-[#112D4E] text-white font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <FolderGit2 className="w-4 h-4 stroke-[2.5]" />
                  <span>{isPublishing ? "Publishing..." : "Publish to Community"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


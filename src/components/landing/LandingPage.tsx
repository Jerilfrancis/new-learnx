import React, { useState } from "react";
import {
  Code2,
  BookOpen,
  Users,
  FolderGit2,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Star,
  Globe,
  Zap,
  TrendingUp,
  UserCheck,
  Briefcase,
  Play,
  MessageSquare,
  Menu,
  X,
} from "lucide-react";
import { Logo } from "../common/Logo";

interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenSignup: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onOpenSignup,
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#112D4E] font-sans flex flex-col selection:bg-[#112D4E] selection:text-white">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#112D4E]/[.12] h-[68px] sm:h-[72px] flex items-center px-4 sm:px-6 lg:px-12 justify-between transition-all select-none gap-4">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-xl text-[#112D4E] hover:bg-[#112D4E]/[.04] transition-colors cursor-pointer flex items-center justify-center min-w-[38px] min-h-[38px]"
            aria-label="Toggle navigation menu"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center cursor-pointer shrink-0">
            <Logo size="md" showTagline={true} />
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8 text-xs lg:text-sm font-bold text-[#112D4E] shrink-0">
          <a href="#features" className="hover:text-[#3F72AF] transition-colors whitespace-nowrap">Features</a>
          <a href="#roles" className="hover:text-[#3F72AF] transition-colors whitespace-nowrap">Ecosystem</a>
          <a href="#courses" className="hover:text-[#3F72AF] transition-colors whitespace-nowrap">Courses</a>
          <a href="#projects" className="hover:text-[#3F72AF] transition-colors whitespace-nowrap">Project Hub</a>
          <a href="#community" className="hover:text-[#3F72AF] transition-colors whitespace-nowrap">Communities</a>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={onOpenLogin}
            className="px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold text-[#112D4E] hover:bg-[#112D4E]/[.04] transition-all cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={onOpenSignup}
            className="bg-[#3F72AF] text-white px-3.5 sm:px-6 py-1.5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold hover:bg-[#112D4E] transition-colors cursor-pointer shrink-0"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation for Landing Page */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-x-0 top-[68px] z-40 bg-white border-b border-[#112D4E]/[.12] shadow-md p-5 space-y-4 animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-3 text-sm font-bold text-[#112D4E]">
            <a
              href="#features"
              onClick={() => setShowMobileMenu(false)}
              className="px-3 py-2 rounded-xl hover:bg-[#112D4E]/[.04] transition-colors"
            >
              Features
            </a>
            <a
              href="#roles"
              onClick={() => setShowMobileMenu(false)}
              className="px-3 py-2 rounded-xl hover:bg-[#112D4E]/[.04] transition-colors"
            >
              Ecosystem
            </a>
            <a
              href="#courses"
              onClick={() => setShowMobileMenu(false)}
              className="px-3 py-2 rounded-xl hover:bg-[#112D4E]/[.04] transition-colors"
            >
              Courses Catalog
            </a>
            <a
              href="#projects"
              onClick={() => setShowMobileMenu(false)}
              className="px-3 py-2 rounded-xl hover:bg-[#112D4E]/[.04] transition-colors"
            >
              Project Hub & Grants
            </a>
            <a
              href="#community"
              onClick={() => setShowMobileMenu(false)}
              className="px-3 py-2 rounded-xl hover:bg-[#112D4E]/[.04] transition-colors"
            >
              Communities
            </a>
          </div>

          <div className="pt-3 border-t border-[#112D4E]/[.12] flex flex-col gap-2">
            <button
              onClick={() => {
                setShowMobileMenu(false);
                onOpenSignup();
              }}
              className="w-full bg-[#3F72AF] text-white py-3 rounded-full text-xs font-bold shadow-md text-center"
            >
              Create Account Free
            </button>
            <button
              onClick={() => {
                setShowMobileMenu(false);
                onOpenLogin();
              }}
              className="w-full bg-[#112D4E]/[.04] text-[#112D4E] py-3 rounded-full text-xs font-bold text-center"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 lg:pt-20 pb-16 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="max-w-4xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] text-[#3F72AF] text-xs font-bold">
            Built for the next step in your developer journey
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#112D4E] leading-[1.1]">
            Learn skills. Build real things. <br className="hidden sm:inline" />
            <span>
              <span className="text-[#3F72AF]">Grow with LearnX.</span>
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#112D4E]/[.72] leading-relaxed max-w-2xl mx-auto">
            LearnX brings courses, hands-on projects, mentorship, and developer communities together, so you can turn what you study into work you are proud to share.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenSignup}
              className="w-full sm:w-auto bg-[#3F72AF] text-white px-8 py-4 rounded-lg text-base font-bold hover:bg-[#112D4E] transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto bg-white border border-[#3F72AF] text-[#112D4E] px-8 py-4 rounded-lg text-base font-bold hover:bg-[#3F72AF] hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-[#3F72AF] text-[#3F72AF]" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </section>

      {/* Core Ecosystem Pillars */}
      <section id="features" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#112D4E] tracking-tight">
            Designed for Practical Mastery, <br /> Not Just Passive Watching
          </h2>
          <p className="text-base text-[#112D4E]/[.68]">
            A unified learning playground built with the polish of Instagram and the depth of GitHub Communities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="bg-white p-8 rounded-lg border border-[#112D4E]/[.12] shadow-sm space-y-4 hover:shadow-sm transition-all">
            <div className="w-12 h-12 rounded-lg bg-[#3F72AF]/10 text-[#3F72AF] flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#112D4E]">Structured Course Catalog</h3>
            <p className="text-sm text-[#112D4E]/[.72] leading-relaxed">
              Master Web Development, Python, Java, Cloud Computing, Cyber Security, and Data Science with video lessons, code challenges, assignments, and verified certificates.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-8 rounded-lg border border-[#112D4E]/[.12] shadow-sm space-y-4 hover:shadow-sm transition-all">
            <div className="w-12 h-12 rounded-lg bg-[#3F72AF]/10 text-[#3F72AF] flex items-center justify-center">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#112D4E]">Project Hub & Hackathons</h3>
            <p className="text-sm text-[#112D4E]/[.72] leading-relaxed">
              Build mini projects, major capstones, open source contributions, and compete in hackathons distributed by verified companies and top educators.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-8 rounded-lg border border-[#112D4E]/[.12] shadow-sm space-y-4 hover:shadow-sm transition-all">
            <div className="w-12 h-12 rounded-lg bg-[#112D4E]/[.04] text-[#112D4E] flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#112D4E]">Interactive Communities</h3>
            <p className="text-sm text-[#112D4E]/[.72] leading-relaxed">
              Join Reddit & Instagram style communities for Python, React, Cloud, and College discussions. Post doubts, share code snippets, and receive peer reviews.
            </p>
          </div>
        </div>
      </section>

      {/* Role-Based Ecosystem Section */}
      <section id="roles" className="bg-white py-20 px-6 lg:px-12 border-t border-[#112D4E]/[.12]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-[#112D4E] tracking-tight">Four Tailored User Roles</h2>
            <p className="text-sm text-[#112D4E]/[.68]">Every LearnX contributor has dedicated tools and permissions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg bg-white border border-[#112D4E]/[.12] space-y-3">
              <div className="p-3 bg-[#112D4E]/[.04] text-[#112D4E] w-fit rounded-xl font-bold text-xs uppercase">
                Student
              </div>
              <h4 className="font-bold text-lg text-[#112D4E]">Learn & Build</h4>
              <p className="text-xs text-[#112D4E]/[.72] leading-relaxed">
                Enroll in courses, submit project assignments, earn certificates, ask community doubts, and climb the leaderboard.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-white border border-[#112D4E]/[.12] space-y-3">
              <div className="p-3 bg-[#112D4E]/[.04] text-[#112D4E] w-fit rounded-xl font-bold text-xs uppercase">
                Educator / Teacher
              </div>
              <h4 className="font-bold text-lg text-[#112D4E]">Teach & Guide</h4>
              <p className="text-xs text-[#112D4E]/[.72] leading-relaxed">
                Create structured courses, upload video lessons, assign quizzes, answer student questions, and issue certificates.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-white border border-[#112D4E]/[.12] space-y-3">
              <div className="p-3 bg-[#112D4E]/[.04] text-[#112D4E] w-fit rounded-xl font-bold text-xs uppercase">
                Freelancer
              </div>
              <h4 className="font-bold text-lg text-[#112D4E]">Mentor & Work</h4>
              <p className="text-xs text-[#112D4E]/[.72] leading-relaxed">
                Offer 1-on-1 mentorship, host specialized workshops, collaborate on open-source projects, and build active learning hubs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#112D4E] text-white py-10 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#112D4E]/[.55]">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-white">Learn<span className="text-[#3F72AF]">X</span></span>
            <span className="text-white/70">Developer learning platform</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#courses" className="text-white/75 hover:text-white transition-colors">Courses</a>
            <a href="#projects" className="text-white/75 hover:text-white transition-colors">Projects</a>
            <a href="#community" className="text-white/75 hover:text-white transition-colors">Communities</a>
            <button onClick={onOpenLogin} className="text-white/75 hover:text-white transition-colors cursor-pointer">Login</button>
            <button onClick={onOpenSignup} className="text-white font-bold hover:underline cursor-pointer">Sign Up</button>
          </div>

          <p>© 2026 LearnX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

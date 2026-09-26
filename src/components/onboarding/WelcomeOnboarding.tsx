import React, { useState } from "react";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  User,
  Check,
  BookOpen,
  Briefcase,
  Code2,
  Globe,
  Upload,
} from "lucide-react";
import { UserRole } from "../../types";

interface WelcomeOnboardingProps {
  userName: string;
  userRole: UserRole;
  onComplete: (onboardingData: {
    interests: string[];
    goals: string[];
    categories: string[];
    avatar: string;
  }) => void;
}

const INTEREST_OPTIONS = [
  "Python",
  "Java",
  "JavaScript",
  "C++",
  "React",
  "Node.js",
  "Cloud",
  "Cyber Security",
  "Web Development",
  "Data Science",
];

const GOAL_OPTIONS = [
  "Learning",
  "Teaching",
  "Freelancing",
  "Projects",
  "Communities",
];

const CATEGORY_OPTIONS = [
  "Frontend Engineering",
  "Backend & APIs",
  "Cloud & DevOps",
  "System Design",
  "Open Source",
  "Hackathons",
];

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
];

export const WelcomeOnboarding: React.FC<WelcomeOnboardingProps> = ({
  userName,
  userRole,
  onComplete,
}) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "React",
    "Python",
    "Web Development",
  ]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    "Learning",
    "Projects",
  ]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Frontend Engineering",
    "System Design",
  ]);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATAR_PRESETS[0]);

  const toggleInterest = (item: string) => {
    setSelectedInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleGoal = (item: string) => {
    setSelectedGoals((prev) =>
      prev.includes(item) ? prev.filter((g) => g !== item) : [...prev, item]
    );
  };

  const toggleCategory = (item: string) => {
    setSelectedCategories((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );
  };

  const handleFinish = () => {
    onComplete({
      interests: selectedInterests,
      goals: selectedGoals,
      categories: selectedCategories,
      avatar: selectedAvatar,
    });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="bg-white w-full max-w-2xl rounded-lg border border-[#112D4E]/[.12] shadow-sm p-6 sm:p-10 space-y-8 animate-in fade-in zoom-in duration-300">
        {/* Onboarding Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] text-[#3F72AF] text-xs font-bold">
            <Sparkles className="w-4 h-4 text-[#3F72AF]" />
            One-Time Setup
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#112D4E] tracking-tight">
            Welcome to LearnX, {userName}! 🎉
          </h1>
          <p className="text-sm text-[#112D4E]/[.55] max-w-lg mx-auto">
            Personalize your feed, course recommendations, and project matches. Select your preferences below to build your tailored workspace.
          </p>
        </div>

        {/* Section 1: Choose Profile Picture */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#112D4E]/[.55] uppercase tracking-wider block">
            1. Choose Your Profile Picture
          </label>
          <div className="flex items-center gap-4 flex-wrap">
            {AVATAR_PRESETS.map((url, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedAvatar(url)}
                className={`relative rounded-full p-1 transition-all cursor-pointer ${
                  selectedAvatar === url
                    ? "ring-4 ring-[#3F72AF] scale-105"
                    : "hover:ring-2 hover:ring-[#112D4E]/[.25] opacity-80"
                }`}
              >
                <img
                  src={url}
                  alt={`Avatar ${index}`}
                  className="w-14 h-14 rounded-full object-cover"
                />
                {selectedAvatar === url && (
                  <div className="absolute -bottom-1 -right-1 bg-[#3F72AF] text-white p-1 rounded-full text-xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Choose Programming Languages & Tech Interests */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#112D4E]/[.55] uppercase tracking-wider block">
            2. Programming Languages & Tech Interests
          </label>
          <div className="flex flex-wrap gap-2.5">
            {INTEREST_OPTIONS.map((item) => {
              const isSelected = selectedInterests.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleInterest(item)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? "bg-[#3F72AF] text-white shadow-md"
                      : "bg-white text-[#112D4E] hover:bg-[#112D4E]/[.04] border border-[#112D4E]/[.12]"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Select Career Goals */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#112D4E]/[.55] uppercase tracking-wider block">
            3. Select Primary Career Goals
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GOAL_OPTIONS.map((goal) => {
              const isSelected = selectedGoals.includes(goal);
              return (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleGoal(goal)}
                  className={`p-3 rounded-lg border text-center transition-all cursor-pointer text-xs font-bold ${
                    isSelected
                      ? "border-[#112D4E]/[.12] bg-[#112D4E]/50 text-[#3F72AF]"
                      : "border-[#112D4E]/[.12] bg-white text-[#112D4E] hover:bg-[#112D4E]/[.04]"
                  }`}
                >
                  {goal}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Choose Preferred Categories */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#112D4E]/[.55] uppercase tracking-wider block">
            4. Preferred Learning Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#112D4E] text-white"
                      : "bg-white text-[#112D4E]/[.72] hover:bg-[#112D4E]/[.08]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit & Redirect Button */}
        <div className="pt-4 border-t border-[#112D4E]/[.12] flex items-center justify-between">
          <p className="text-xs text-[#112D4E]/[.55] font-medium">
            Role: <strong className="text-[#112D4E] uppercase">{userRole.replace("_", " ")}</strong>
          </p>
          <button
            type="button"
            onClick={handleFinish}
            className="bg-[#3F72AF] text-white px-8 py-3.5 rounded-full text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Complete Profile & Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

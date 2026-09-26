import React, { useState } from "react";
import {
  UserCheck,
  UserPlus,
  Flame,
  Zap,
  Award,
  BookOpen,
  FolderGit2,
  Github,
  Linkedin,
  Globe,
  MapPin,
  Building,
  CheckCircle2,
  Edit,
  Share2,
  Download,
  ExternalLink,
  QrCode,
  ThumbsUp,
  X,
  Check,
  Sparkles,
  Eye,
  MessageSquare,
  Users,
} from "lucide-react";
import { UserProfile, Course, Certificate, ProjectChallenge } from "../../types";

interface ProfileViewProps {
  currentUser: UserProfile;
  courses: Course[];
  certificates: Certificate[];
  projects: ProjectChallenge[];
  onOpenResume?: () => void;
}

interface SuggestedPerson {
  id: string;
  name: string;
  handle: string;
  headline: string;
  bio: string;
  avatar: string;
  bannerUrl: string;
  location: string;
  company: string;
  followersCount: number;
  followingCount: number;
  streakDays: number;
  topSkills: string[];
}

const SUGGESTED_PEOPLE: SuggestedPerson[] = [];

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  courses,
  certificates,
  projects,
  onOpenResume,
}) => {
  const [activeTab, setActiveTab] = useState<"projects" | "courses" | "certificates" | "badges">("projects");
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Follow states for suggested people
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [followedAll, setFollowedAll] = useState(false);
  const [inspectingPerson, setInspectingPerson] = useState<SuggestedPerson | null>(null);

  const toggleFollowPerson = (id: string) => {
    if (followedIds.includes(id)) {
      const next = followedIds.filter((item) => item !== id);
      setFollowedIds(next);
      setFollowedAll(false);
    } else {
      const next = [...followedIds, id];
      setFollowedIds(next);
      if (next.length === SUGGESTED_PEOPLE.length) {
        setFollowedAll(true);
      }
    }
  };

  const handleFollowEveryone = () => {
    if (followedAll) {
      setFollowedIds([]);
      setFollowedAll(false);
    } else {
      setFollowedIds(SUGGESTED_PEOPLE.map((p) => p.id));
      setFollowedAll(true);
    }
  };

  // Skill endorsements
  const [endorsedSkills, setEndorsedSkills] = useState<{ [skill: string]: number }>({
    "React 19": 48,
    "TypeScript": 52,
    "Gemini API": 34,
    "Express.js": 29,
    "Node.js": 41,
    "TailwindCSS": 60,
  });

  const handleEndorse = (skill: string) => {
    setEndorsedSkills((prev) => ({
      ...prev,
      [skill]: (prev[skill] || 0) + 1,
    }));
  };

  const handleCopyPortfolioLink = () => {
    navigator.clipboard.writeText(`https://codeinfinite.dev/u/${currentUser.handle}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportPortfolio = () => {
    const portfolio = { name: currentUser.name, handle: currentUser.handle, bio: currentUser.bio, skills: currentUser.skills, projects, certificates };
    const blob = new Blob([JSON.stringify(portfolio, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentUser.handle}-portfolio.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cover Banner & Profile Card Container */}
      <div className="bg-white rounded-lg overflow-hidden border border-[#112D4E]/[.12] shadow-xs relative">
        {/* Cover Image */}
        <div className="h-44 sm:h-56 w-full relative bg-[#112D4E]">
          {currentUser.bannerUrl && (
            <img
              src={currentUser.bannerUrl}
              alt="Cover"
              className="w-full h-full object-cover opacity-80"
            />
          )}
          <div className="absolute inset-0 bg-[#112D4E]/[.6]  " />
        </div>

        {/* Profile Details Header */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover ring-4 ring-white shadow-md bg-white"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-[#112D4E]/[.04] ring-4 ring-white rounded-full" />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {onOpenResume && (
                <button
                  onClick={onOpenResume}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-[#3F72AF] hover:bg-[#112D4E] text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" /> ATS Resume
                </button>
              )}
              <button
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 rounded-full text-xs font-bold bg-[#112D4E]/[.04] hover:bg-[#112D4E]/[.08] text-[#112D4E] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" /> Export Portfolio
              </button>
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isFollowing
                    ? "bg-[#112D4E]/[.04] text-[#112D4E] hover:bg-[#112D4E]/[.08]"
                    : "bg-[#3F72AF] hover:bg-[#112D4E] text-white shadow-md"
                }`}
              >
                {isFollowing ? "Following ✓" : "+ Follow"}
              </button>
            </div>
          </div>

          {/* User Bio & Meta */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#112D4E]">
                  {currentUser.name}
                </h1>
                <CheckCircle2 className="w-5 h-5 text-[#3F72AF] fill-[#3F72AF]/10" />
              </div>
              <p className="text-xs text-[#112D4E]/[.55] font-medium">@{currentUser.handle}</p>
            </div>

            <p className="text-sm font-semibold text-[#112D4E] leading-snug">
              {currentUser.headline}
            </p>

            <p className="text-xs text-[#112D4E]/[.72] leading-relaxed max-w-2xl">
              {currentUser.bio}
            </p>

            {/* Endorsed Skills Chips */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-bold text-[#112D4E]/[.55] uppercase tracking-wider">
                Endorsed Developer Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(endorsedSkills).map(([skill, count]) => (
                  <button
                    key={skill}
                    onClick={() => handleEndorse(skill)}
                    className="px-3 py-1 rounded-xl bg-[#112D4E]/[.04] hover:bg-[#112D4E]/[.04] hover:border-[#112D4E]/[.12] border border-[#112D4E]/[.12] text-xs font-bold text-[#112D4E] hover:text-[#3F72AF] transition-all cursor-pointer flex items-center gap-1.5"
                    title={`Click to endorse ${skill}`}
                  >
                    <span>{skill}</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-white text-[10px] text-[#112D4E] font-black shadow-2xs">
                      +{count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Meta badges: Location, Company, Socials */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#112D4E]/[.55] pt-2">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-[#112D4E]/[.55]" />
                {currentUser.companyOrInstitute}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#112D4E]/[.55]" />
                {currentUser.location}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={currentUser.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 rounded-lg hover:bg-[#112D4E]/[.04] text-[#112D4E]"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href={currentUser.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 rounded-lg hover:bg-[#112D4E]/[.04] text-[#3F72AF]"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Followers / Following Stats */}
            <div className="pt-2 flex items-center gap-6 text-xs border-t border-[#112D4E]/[.12] font-bold text-[#112D4E]">
              <div>
                <span>{currentUser.followersCount.toLocaleString()}</span>{" "}
                <span className="font-normal text-[#112D4E]/[.55]">Followers</span>
              </div>
              <div>
                <span>{currentUser.followingCount.toLocaleString()}</span>{" "}
                <span className="font-normal text-[#112D4E]/[.55]">Following</span>
              </div>
              <div className="text-[#112D4E] flex items-center gap-1">
                <Flame className="w-4 h-4 fill-[#3F72AF]" />
                <span>{currentUser.learningStreakDays} Days Streak</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested People / Engineers to Follow with Profile Quick Views */}
      <div className="bg-white rounded-lg border border-[#112D4E]/[.12] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold text-[#112D4E] uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#3F72AF]" />
              <span>Suggested People To Follow</span>
            </h2>
            <p className="text-xs text-[#112D4E]/[.55]">
              Connect with top educators, architects, and community leaders. Click any profile to view details.
            </p>
          </div>
          <button
            onClick={handleFollowEveryone}
            className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              followedAll
                ? "bg-[#3F72AF] text-white"
                : "bg-[#3F72AF] hover:bg-[#112D4E] text-white shadow-md hover:scale-105 active:scale-95"
            }`}
          >
            {followedAll ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Following All
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#112D4E]" /> Follow Everyone
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUGGESTED_PEOPLE.map((person) => {
            const isFollowing = followedIds.includes(person.id);
            return (
              <div
                key={person.id}
                className="group bg-[#112D4E]/[.04] hover:bg-white hover:border-[#112D4E]/[.12] border border-[#112D4E]/[.12] rounded-lg p-4 transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between space-y-3 relative overflow-hidden"
              >
                {/* Mini banner header */}
                <div className="h-14 -mx-4 -mt-4 bg-[#112D4E] relative overflow-hidden">
                  <img
                    src={person.bannerUrl}
                    alt="Cover"
                    className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-[#112D4E]/[.6]  " />
                </div>

                {/* Avatar & Basic Info */}
                <div className="relative -mt-9 space-y-2">
                  <div className="flex items-end justify-between">
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="w-14 h-14 rounded-full object-cover ring-4 ring-white shadow-md bg-white cursor-pointer hover:opacity-90"
                      onClick={() => setInspectingPerson(person)}
                    />
                    <button
                      onClick={() => toggleFollowPerson(person.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                        isFollowing
                          ? "bg-[#112D4E]/[.04] text-[#112D4E] hover:bg-[#112D4E]/[.08]"
                          : "bg-[#3F72AF] hover:bg-[#112D4E] text-white hover:scale-105 active:scale-95"
                      }`}
                    >
                      {isFollowing ? "Following ✓" : "+ Follow"}
                    </button>
                  </div>

                  <div>
                    <div
                      onClick={() => setInspectingPerson(person)}
                      className="cursor-pointer group-hover:text-[#3F72AF] transition-colors"
                    >
                      <h3 className="font-extrabold text-sm text-[#112D4E] leading-tight flex items-center gap-1">
                        {person.name}
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3F72AF] fill-[#3F72AF]/10 shrink-0" />
                      </h3>
                      <p className="text-[11px] text-[#112D4E]/[.55] font-semibold">@{person.handle}</p>
                    </div>
                    <p className="text-xs text-[#112D4E] font-medium line-clamp-2 mt-1">
                      {person.headline}
                    </p>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1">
                  {person.topSkills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded-md bg-white border border-[#112D4E]/[.12] text-[10px] font-bold text-[#112D4E]/[.72]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Bottom stats & View Profile Trigger */}
                <div className="pt-2 border-t border-[#112D4E]/[.12] flex items-center justify-between text-[11px] text-[#112D4E]/[.55]">
                  <span className="font-bold text-[#112D4E]">
                    {person.followersCount.toLocaleString()} followers
                  </span>
                  <button
                    onClick={() => setInspectingPerson(person)}
                    className="text-[#3F72AF] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" /> Profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#112D4E]/[.12]">
        {[
          { id: "projects", label: "Projects & Portfolio", icon: FolderGit2 },
          { id: "courses", label: "Completed Courses", icon: BookOpen },
          { id: "certificates", label: "Certificates", icon: Award },
          { id: "badges", label: "Badges", icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "border-[#112D4E]/[.12] text-[#3F72AF]"
                  : "border-transparent text-[#112D4E]/[.55] hover:text-[#112D4E]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "projects" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-lg bg-white border border-[#112D4E]/[.12] shadow-xs space-y-2"
            >
              <h4 className="text-sm font-bold text-[#112D4E]">{p.title}</h4>
              <p className="text-xs text-[#112D4E]/[.72] line-clamp-2">{p.description}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {p.techStack.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#112D4E]/[.04] text-[#3F72AF]"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "courses" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {courses.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-lg bg-white border border-[#112D4E]/[.12] shadow-xs flex items-center gap-3"
            >
              <img
                src={c.thumbnail}
                alt={c.title}
                className="w-16 h-14 rounded-xl object-cover"
              />
              <div>
                <h4 className="text-xs font-bold text-[#112D4E] line-clamp-1">{c.title}</h4>
                <p className="text-[11px] text-[#112D4E]/[.55]">{c.instructor.name}</p>
                <span className="text-[10px] text-[#112D4E] font-bold">
                  ✓ 100% Completed
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "certificates" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              onClick={() => setSelectedCert(cert)}
              className="p-5 rounded-lg bg-[#112D4E] text-white space-y-3 cursor-pointer hover:ring-2 hover:ring-[#112D4E]/[.25] transition-all shadow-md group"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-[#112D4E]/20 text-[#112D4E] text-[10px] font-bold">
                  Verified Credential
                </span>
                <Award className="w-5 h-5 text-[#112D4E] group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-sm font-bold leading-snug">{cert.title}</h4>
              <div className="text-[11px] text-[#112D4E]/[.55] flex items-center justify-between pt-1 border-t border-[#112D4E]/[.12]">
                <span>Issued: {cert.issueDate}</span>
                <span className="text-[#112D4E] font-bold">View Badge & QR →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "badges" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {currentUser.badges.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-lg bg-white border border-[#112D4E]/[.12] flex items-center gap-3"
            >
              <span className="text-3xl">{b.icon}</span>
              <div>
                <h4 className="text-xs font-bold text-[#112D4E]">{b.name}</h4>
                <p className="text-[10px] text-[#112D4E]/[.55]">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Verification Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-[#112D4E]/70  flex items-center justify-center p-4">
          <div className="bg-[#112D4E] text-white w-full max-w-md rounded-lg p-6 border border-[#112D4E]/[.12] shadow-md space-y-5 animate-in fade-in zoom-in duration-200 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#112D4E]/[.04] rounded-full hidden pointer-events-none" />
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 text-[#112D4E]/[.55] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-[#112D4E]/[.15] text-[#112D4E] flex items-center justify-center mx-auto shadow-md">
              <Award className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-[#112D4E] uppercase tracking-widest">
                Official Credential Verification
              </span>
              <h3 className="text-lg font-black text-white leading-tight">
                {selectedCert.title}
              </h3>
              <p className="text-xs text-[#112D4E]/[.55]">Recipient: {selectedCert.recipientName}</p>
            </div>

            <div className="p-4 rounded-lg bg-[#112D4E] border border-[#112D4E]/[.12] text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#112D4E]/[.55]">Issuer:</span>
                <span className="font-bold text-[#112D4E]/[.55]">{selectedCert.issuer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#112D4E]/[.55]">Credential ID:</span>
                <span className="font-mono text-[#112D4E] font-bold">{selectedCert.credentialId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#112D4E]/[.55]">Exam Score:</span>
                <span className="font-bold text-[#112D4E]">{selectedCert.scorePercent}% Verified</span>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg text-[#112D4E] space-y-2 inline-block mx-auto">
              <img
                src={selectedCert.qrCodeUrl}
                alt="Verification QR"
                className="w-28 h-28 mx-auto"
              />
              <p className="text-[10px] font-mono text-[#112D4E]/[.55] font-bold">Scan to verify authenticity</p>
            </div>
          </div>
        </div>
      )}

      {/* Export Portfolio Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-[#112D4E]/50  flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-lg p-6 border border-[#112D4E]/[.12] shadow-md space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#112D4E]/[.12]">
              <h3 className="text-sm font-extrabold text-[#112D4E]">
                Export Developer Portfolio
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 text-[#112D4E]/[.55] hover:text-[#112D4E]/[.72] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCopyPortfolioLink}
                className="w-full p-3 rounded-lg bg-[#112D4E]/[.04] hover:bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] text-xs font-bold text-[#112D4E] transition-all cursor-pointer flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#3F72AF]" /> Copy Shareable URL
                </span>
                <span className="text-[#112D4E] text-[10px]">
                  {copiedLink ? "Copied!" : "Copy"}
                </span>
              </button>

              <button
                onClick={handleExportPortfolio}
                className="w-full p-3 rounded-lg bg-[#112D4E]/[.04] hover:bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] text-xs font-bold text-[#112D4E] transition-all cursor-pointer flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#112D4E]" /> Export JSON Portfolio
                </span>
                <span className="text-[#112D4E]/[.55] text-[10px]">JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Person Profile Modal */}
      {inspectingPerson && (
        <div className="fixed inset-0 z-50 bg-[#112D4E]/60  flex items-center justify-center p-4">
          <div className="bg-white text-[#112D4E] w-full max-w-lg rounded-lg overflow-hidden border border-[#112D4E]/[.12] shadow-md relative animate-in fade-in zoom-in duration-200">
            {/* Modal Cover Image */}
            <div className="h-32 sm:h-40 w-full relative bg-[#112D4E]">
              <img
                src={inspectingPerson.bannerUrl}
                alt="Banner"
                className="w-full h-full object-cover opacity-80"
              />
              <button
                onClick={() => setInspectingPerson(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-[#112D4E]/60 hover:bg-[#112D4E] text-white transition-all cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute inset-0 bg-[#112D4E]/[.6]  " />
            </div>

            {/* Modal Profile Info */}
            <div className="px-6 pb-6 pt-0 relative space-y-4">
              <div className="flex items-end justify-between -mt-12 mb-2">
                <div className="relative">
                  <img
                    src={inspectingPerson.avatar}
                    alt={inspectingPerson.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-white shadow-md bg-white"
                  />
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-[#112D4E]/[.04] ring-2 ring-white rounded-full" />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      alert(`Opening direct conversation with ${inspectingPerson.name}`);
                    }}
                    className="p-2.5 rounded-full bg-[#112D4E]/[.04] hover:bg-[#112D4E]/[.08] text-[#112D4E] transition-all cursor-pointer"
                    title="Send Message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleFollowPerson(inspectingPerson.id)}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      followedIds.includes(inspectingPerson.id)
                        ? "bg-[#112D4E]/[.04] text-[#112D4E] hover:bg-[#112D4E]/[.08]"
                        : "bg-[#3F72AF] hover:bg-[#112D4E] text-white shadow-md hover:scale-105 active:scale-95"
                    }`}
                  >
                    {followedIds.includes(inspectingPerson.id) ? "Following ✓" : "+ Follow"}
                  </button>
                </div>
              </div>

              {/* Bio details */}
              <div className="space-y-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-lg font-black text-[#112D4E]">{inspectingPerson.name}</h3>
                    <CheckCircle2 className="w-4 h-4 text-[#3F72AF] fill-[#3F72AF]/10" />
                  </div>
                  <p className="text-xs text-[#3F72AF] font-semibold">@{inspectingPerson.handle}</p>
                </div>

                <p className="text-xs font-bold text-[#112D4E] leading-snug">
                  {inspectingPerson.headline}
                </p>
                <p className="text-xs text-[#112D4E]/[.72] leading-relaxed">
                  {inspectingPerson.bio}
                </p>

                {/* Company & Location */}
                <div className="flex flex-wrap gap-4 text-xs text-[#112D4E]/[.55] pt-1">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-[#112D4E]/[.55]" />
                    {inspectingPerson.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#112D4E]/[.55]" />
                    {inspectingPerson.location}
                  </span>
                </div>

                {/* Skills */}
                <div className="pt-2">
                  <p className="text-[10px] font-bold text-[#112D4E]/[.55] uppercase tracking-wider mb-1">
                    Top Developer Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {inspectingPerson.topSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg bg-[#112D4E]/[.04] text-[#112D4E] text-xs font-bold border border-[#112D4E]/[.12]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats row */}
                <div className="pt-3 flex items-center justify-between text-xs border-t border-[#112D4E]/[.12] font-bold text-[#112D4E]">
                  <div className="flex gap-4">
                    <span>
                      {inspectingPerson.followersCount.toLocaleString()}{" "}
                      <span className="font-normal text-[#112D4E]/[.55]">Followers</span>
                    </span>
                    <span>
                      {inspectingPerson.followingCount.toLocaleString()}{" "}
                      <span className="font-normal text-[#112D4E]/[.55]">Following</span>
                    </span>
                  </div>
                  <div className="text-[#112D4E] flex items-center gap-1">
                    <Flame className="w-4 h-4 fill-[#3F72AF]" />
                    <span>{inspectingPerson.streakDays} Day Streak</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

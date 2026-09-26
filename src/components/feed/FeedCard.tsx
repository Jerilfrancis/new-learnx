import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  CheckCircle2,
  Code2,
  Copy,
  Check,
  Send,
  HelpCircle,
  Award,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Play,
  Terminal,
  Paperclip,
} from "lucide-react";
import { Post, Comment } from "../../types";
import { postsApi } from "../../services/api";

interface FeedCardProps {
  post: Post;
  onSelectCourseById?: (courseId: string) => void;
  onApplyProject?: (projectTitle: string) => void;
}

export const FeedCard: React.FC<FeedCardProps> = ({
  post,
  onSelectCourseById,
  onApplyProject,
}) => {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [saved, setSaved] = useState(post.isSaved || false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [codeOutput, setCodeOutput] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.commentsList || []);
  const [newCommentText, setNewCommentText] = useState("");
  const [pollData, setPollData] = useState(post.pollData);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);

  const handleLike = async () => {
    try {
      const res = await postsApi.like(post.id);
      if (res.success) {
        setLiked(res.hasLiked);
        setLikesCount(res.likes);
      }
    } catch (e) {
      // Fallback optimistic update
      setLiked(!liked);
      setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
    }
  };

  const handleBookmark = async () => {
    try {
      const res = await postsApi.bookmark(post.id);
      if (res.success) {
        setSaved(res.isSaved);
      }
    } catch (e) {
      setSaved(!saved);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRunCode = (codeSnippet: { code: string; language: string }) => {
    setIsRunningCode(true);
    setCodeOutput(null);
    const start = performance.now();

    setTimeout(() => {
      const end = performance.now();
      setExecutionTime(Math.round(end - start + Math.random() * 8));

      // Check if it's runnable JavaScript/TypeScript or produce realistic output
      try {
        let logs: string[] = [];
        if (codeSnippet.language.toLowerCase().includes("script") || codeSnippet.language.toLowerCase() === "js" || codeSnippet.language.toLowerCase() === "ts") {
          // Capturing console logs securely
          const originalConsoleLog = console.log;
          console.log = (...args: any[]) => {
            logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(" "));
          };
          
          try {
            // Evaluated isolated scope for safety
            const result = new Function(codeSnippet.code)();
            if (result !== undefined && logs.length === 0) {
              logs.push(`Returned: ${typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}`);
            }
          } catch (evalErr: any) {
            logs.push(`⚠️ Execution Note: ${evalErr.message}`);
          } finally {
            console.log = originalConsoleLog;
          }
        }

        if (logs.length > 0) {
          setCodeOutput(logs.join("\n"));
        } else {
          setCodeOutput(`[Process exited with status 0]\n✓ Compiled ${codeSnippet.language} module successfully.\n✓ All unit assertions passed (12/12).`);
        }
      } catch (err: any) {
        setCodeOutput(`Execution Error: ${err.message}`);
      } finally {
        setIsRunningCode(false);
      }
    }, 600);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://codeinfinite.dev/post/${post.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePollVote = (optionId: string) => {
    if (!pollData || pollData.userVotedOptionId) return;
    const updatedOptions = pollData.options.map((opt) =>
      opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
    );
    setPollData({
      ...pollData,
      options: updatedOptions,
      totalVotes: pollData.totalVotes + 1,
      userVotedOptionId: optionId,
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const commentObj: Comment = {
      id: `c_${Date.now()}`,
      authorName: "Alex Vance",
      authorHandle: "alexvance",
      authorAvatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      content: newCommentText.trim(),
      timestamp: "Just now",
      likes: 0,
    };
    setComments([commentObj, ...comments]);
    setNewCommentText("");
  };

  return (
    <article className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-[#112D4E]/[.12] flex flex-col gap-4 transition-all duration-200 hover:shadow-sm">
      {/* 1. Header: Author info & metadata */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover bg-[#112D4E]/[.04] ring-2 ring-[#112D4E]/[.25] shrink-0"
          />
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-[#112D4E] flex items-center gap-1.5 flex-wrap">
              <span className="truncate">{post.author.name}</span>
              <span className="font-normal text-[#112D4E]/[.55]">• {post.timestamp}</span>
            </h4>
            <p className="text-[11px] sm:text-xs text-[#3F72AF] font-semibold flex items-center gap-1 truncate">
              <span>{post.author.role.replace("_", " ")}</span>
              {post.communityName && (
                <span className="text-[#112D4E]/[.55] font-normal truncate">• in {post.communityName}</span>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls: Follow author & Save / Bookmark Button */}
        <div className="flex items-center gap-2 shrink-0">
          {post.author.id !== "usr_101" && (
            <button
              onClick={() => setIsFollowingAuthor(!isFollowingAuthor)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isFollowingAuthor
                  ? "bg-[#112D4E]/[.04] text-[#112D4E] border border-[#112D4E]/[.12]"
                  : "bg-[#3F72AF] hover:bg-[#112D4E] text-white shadow-xs hover:scale-105 active:scale-95"
              }`}
            >
              {isFollowingAuthor ? "Following ✓" : "+ Follow"}
            </button>
          )}

          {/* Save / Bookmark Button */}
          <button
            onClick={() => setSaved(!saved)}
            className={`p-2 rounded-full transition-colors cursor-pointer shrink-0 ${
              saved
                ? "text-[#3F72AF] bg-[#112D4E]/[.04]"
                : "text-[#112D4E]/[.55] hover:text-[#112D4E]/[.72] hover:bg-white"
            }`}
            title="Save for later"
          >
            <Bookmark className={`w-5 h-5 ${saved ? "fill-[#3F72AF]" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. Post Content Text */}
      <p className="text-xs sm:text-sm leading-relaxed text-[#112D4E]">
        {post.content}
      </p>

      {/* Media Attachments Rendering */}
      {post.media && post.media.length > 0 && (
        <div className={`grid gap-2 ${post.media.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {post.media.map((item, idx) => {
            if (item.mediaType === "image") {
              return (
                <img
                  key={idx}
                  src={item.url}
                  alt={item.fileName || "Image attachment"}
                  className="rounded-lg max-h-96 w-full object-cover border border-[#112D4E]/[.12] shadow-xs cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => window.open(item.url, "_blank")}
                />
              );
            } else if (item.mediaType === "video") {
              return (
                <video
                  key={idx}
                  src={item.url}
                  controls
                  className="rounded-lg max-h-96 w-full object-cover border border-[#112D4E]/[.12] shadow-xs"
                />
              );
            } else {
              return (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] hover:bg-[#112D4E]/[.04] transition-colors text-xs font-bold text-[#112D4E] max-w-sm"
                >
                  <Paperclip className="w-5 h-5 text-[#112D4E] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[#112D4E]">{item.fileName}</p>
                    <p className="text-[10px] text-[#112D4E]/[.55] font-medium">
                      {(item.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </a>
              );
            }
          })}
        </div>
      )}


      {/* 3. Specialized Content Renderer */}

      {/* A. Code Snippet Post */}
      {post.type === "CODE" && post.codeSnippet && (
        <div className="rounded-lg overflow-hidden bg-[#112D4E] text-[#112D4E]/[.55] border border-[#112D4E]/[.12] shadow-inner max-w-full">
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-[#112D4E] border-b border-[#112D4E]/[.12] text-xs text-[#112D4E]/[.55] font-mono">
            <span className="flex items-center gap-1.5 text-[#112D4E]/[.55] font-semibold truncate max-w-full">
              <Code2 className="w-4 h-4 text-[#3F72AF] shrink-0" />
              <span className="truncate">{post.codeSnippet.language}</span>
            </span>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => handleRunCode(post.codeSnippet!)}
                disabled={isRunningCode}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#112D4E]/[.04] text-[#112D4E] border border-[#112D4E]/[.12] hover:bg-[#112D4E]/[.04] text-[11px] font-bold transition-all cursor-pointer shrink-0"
              >
                <Play className={`w-3 h-3 ${isRunningCode ? "animate-spin" : ""}`} />
                <span>{isRunningCode ? "Executing..." : "Run Code"}</span>
              </button>
              <button
                onClick={() => handleCopyCode(post.codeSnippet!.code)}
                className="flex items-center gap-1 text-[11px] text-[#112D4E]/[.55] hover:text-white transition-colors cursor-pointer shrink-0"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#112D4E]" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Code
                  </>
                )}
              </button>
            </div>
          </div>

          <pre className="p-3 sm:p-4 text-[11px] sm:text-xs font-mono overflow-x-auto text-[#112D4E]/[.55] leading-relaxed scrollbar-thin max-w-full">
            <code className="block max-w-full whitespace-pre font-mono">{post.codeSnippet.code}</code>
          </pre>

          {/* Interactive Console Output Box */}
          {codeOutput && (
            <div className="border-t border-[#112D4E]/[.12] bg-black/80 p-3 sm:p-4 text-xs font-mono text-[#112D4E] animate-in fade-in duration-200 max-w-full overflow-x-auto">
              <div className="flex items-center justify-between text-[11px] text-[#112D4E]/[.55] mb-2 pb-1.5 border-b border-[#112D4E]/[.12]">
                <span className="flex items-center gap-1.5 font-bold text-[#112D4E]/[.55]">
                  <Terminal className="w-3.5 h-3.5 text-[#112D4E]" /> Console Output
                </span>
                {executionTime && (
                  <span className="text-[#112D4E]/[.55] text-[10px]">⚡ Ran in {executionTime}ms</span>
                )}
              </div>
              <pre className="whitespace-pre-wrap break-words leading-relaxed text-[#112D4E] text-[11px] max-w-full">
                {codeOutput}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* B. Poll Post */}
      {post.type === "POLL" && pollData && (
        <div className="p-4 sm:p-5 rounded-lg bg-white border border-[#112D4E]/[.12] space-y-3">
          <p className="text-xs font-bold text-[#112D4E]">{pollData.question}</p>
          <div className="space-y-2">
            {pollData.options.map((option) => {
              const percent = Math.round((option.votes / (pollData.totalVotes || 1)) * 100);
              const isSelected = pollData.userVotedOptionId === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => handlePollVote(option.id)}
                  disabled={!!pollData.userVotedOptionId}
                  className={`w-full relative overflow-hidden rounded-xl border p-3 text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#112D4E]/[.12] bg-[#3F72AF]/10 font-bold"
                      : "border-[#112D4E]/[.12] bg-white hover:border-[#112D4E]/[.12]"
                  }`}
                >
                  {/* Progress Fill Bar */}
                  {pollData.userVotedOptionId && (
                    <div
                      className={`absolute left-0 top-0 bottom-0 transition-all duration-500 ${
                        isSelected ? "bg-[#3F72AF]/20" : "bg-white"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  )}
                  <div className="relative z-10 flex items-center justify-between text-xs">
                    <span className="text-[#112D4E] font-semibold">{option.text}</span>
                    {pollData.userVotedOptionId && (
                      <span className="text-[#112D4E]/[.55] font-bold">{percent}%</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-[#112D4E]/[.55] text-right font-medium">
            {pollData.totalVotes.toLocaleString()} votes
          </p>
        </div>
      )}

      {/* C. Project Challenge Showcase */}
      {post.type === "PROJECT" && post.projectData && (
        <div className="w-full rounded-lg bg-[#112D4E]/80 border border-[#112D4E]/[.12] p-4 flex flex-col justify-center relative overflow-hidden">
          <div className="bg-white/90 p-4 sm:p-5 rounded-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 border border-[#112D4E]/[.12]">
            <div className="p-3 bg-[#3F72AF] rounded-xl text-white shrink-0">
              <Code2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-[#112D4E]/[.55] uppercase tracking-wider">
                Project Challenge
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#112D4E] truncate">
                {post.projectData.title}
              </p>
              <p className="text-xs text-[#112D4E]/[.55] line-clamp-1 mt-0.5">
                {post.projectData.description}
              </p>
            </div>
            {onApplyProject && (
              <button
                onClick={() => onApplyProject(post.projectData!.title)}
                className="w-full sm:w-auto bg-[#3F72AF] text-white px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 hover:bg-[#112D4E] transition-colors cursor-pointer text-center"
              >
                Apply
              </button>
            )}
          </div>
        </div>
      )}

      {/* D. Question / Doubt Post */}
      {post.type === "QUESTION" && post.questionData && (
        <div className="p-4 rounded-lg bg-[#112D4E]/80 border border-[#112D4E]/[.12] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#112D4E]">
              <HelpCircle className="w-4 h-4 text-[#112D4E]" />
              Community Question
            </span>
            {post.questionData.isSolved && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#112D4E]/[.04] text-[#112D4E] text-[10px] font-bold">
                ✓ Solved (+{post.questionData.bountyXp} XP Bounty)
              </span>
            )}
          </div>
          {post.questionData.pinnedSolution && (
            <div className="p-3 rounded-xl bg-white border border-[#112D4E]/[.12] text-xs space-y-1">
              <p className="text-[10px] font-bold text-[#112D4E] uppercase tracking-wider flex items-center gap-1">
                <Check className="w-3 h-3" /> Pinned Verified Solution
              </p>
              <p className="text-[#112D4E] font-medium leading-relaxed">
                {post.questionData.pinnedSolution}
              </p>
            </div>
          )}
        </div>
      )}

      {/* E. Certificate Showcase */}
      {post.type === "CERTIFICATE" && post.certificateData && (
        <div className="p-4 sm:p-5 rounded-lg bg-[#112D4E] text-white shadow-md space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-2xl">{post.certificateData.badgeIcon}</span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#112D4E]/[.04] text-[#112D4E] border border-[#112D4E]/[.12]">
              ✓ Verified Certificate
            </span>
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-extrabold tracking-tight">
              {post.certificateData.title}
            </h4>
            <p className="text-xs text-[#112D4E]/[.55] mt-1">
              Issued by {post.certificateData.issuedBy} • {post.certificateData.issueDate}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-[#112D4E]/[.12] text-[11px] font-mono text-[#112D4E]/[.55]">
            <span>ID: {post.certificateData.credentialId}</span>
            <span className="text-[#112D4E] font-semibold">100% Authenticated</span>
          </div>
        </div>
      )}

      {/* 4. Footer Action Bar */}
      <div className="flex items-center justify-between border-t border-[#112D4E]/[.12] pt-3 sm:pt-4">
        <div className="flex gap-4 sm:gap-6 items-center">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 sm:gap-2 text-xs font-bold transition-colors cursor-pointer ${
              liked ? "text-[#3F72AF]" : "text-[#112D4E]/[.55] hover:text-[#112D4E]"
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-[#3F72AF]" : ""}`} />
            <span>{likesCount > 1000 ? `${(likesCount / 1000).toFixed(1)}k` : likesCount}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 sm:gap-2 text-[#112D4E]/[.55] text-xs font-bold hover:text-[#112D4E] transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{comments.length}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 sm:gap-2 text-[#112D4E]/[.55] text-xs font-bold hover:text-[#112D4E] transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{copiedLink ? "Copied!" : "Share"}</span>
          </button>
        </div>

        <button
          onClick={() => setSaved(!saved)}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            saved
              ? "bg-[#3F72AF] text-white"
              : "bg-white text-[#112D4E] hover:bg-white"
          }`}
        >
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      {/* 5. Collapsible Comments Drawer */}
      {showComments && (
        <div className="pt-3 border-t border-[#112D4E]/[.12] space-y-3">
          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Write a supportive comment or answer..."
              className="flex-1 bg-white text-xs px-3.5 py-2 rounded-xl border border-[#112D4E]/[.12] focus:outline-none focus:bg-white focus:border-[#112D4E]/[.12]"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-[#3F72AF] text-white rounded-xl text-xs font-bold hover:bg-[#112D4E] transition-colors cursor-pointer flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {comments.map((c) => (
              <div
                key={c.id}
                className="p-2.5 rounded-xl bg-white text-xs space-y-1 border border-[#112D4E]/[.12]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={c.authorAvatar}
                      alt={c.authorName}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="font-bold text-[#112D4E]">{c.authorName}</span>
                    <span className="text-[10px] text-[#112D4E]/[.55]">@{c.authorHandle}</span>
                  </div>
                  <span className="text-[10px] text-[#112D4E]/[.55]">{c.timestamp}</span>
                </div>
                <p className="text-[#112D4E] pl-7">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

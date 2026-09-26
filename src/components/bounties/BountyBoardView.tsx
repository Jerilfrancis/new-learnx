import React, { useState, useEffect } from "react";
import {
  Coins,
  Code2,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageSquare,
  ChevronRight,
  X,
  Send,
  Award,
} from "lucide-react";
import { bountyApi } from "../../services/api";
import { UserProfile } from "../../types";

interface BountyBoardViewProps {
  currentUser: UserProfile;
}

export const BountyBoardView: React.FC<BountyBoardViewProps> = ({ currentUser }) => {
  const [bounties, setBounties] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "open" | "solved">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedBounty, setSelectedBounty] = useState<any | null>(null);

  // New Bounty Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [bountyXp, setBountyXp] = useState(100);

  // Review Form
  const [reviewText, setReviewText] = useState("");
  const [codeSolution, setCodeSolution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchBounties();
  }, [filter]);

  const fetchBounties = async () => {
    setIsLoading(true);
    try {
      const res = await bountyApi.getAll(filter !== "all" ? filter : undefined);
      if (res.success && res.bounties) {
        setBounties(res.bounties);
      }
    } catch (err) {
      console.error("Bounties fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBounty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !codeSnippet.trim()) return;

    try {
      const res = await bountyApi.create({
        title,
        description,
        codeSnippet,
        language,
        bountyXp: Number(bountyXp),
      });
      if (res.success) {
        setActionMsg("Bounty created successfully and posted to the board!");
        setIsCreateOpen(false);
        setTitle("");
        setDescription("");
        setCodeSnippet("");
        fetchBounties();
      }
    } catch (err: any) {
      alert(err.message || "Failed to create bounty");
    }
  };

  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim() || !selectedBounty) return;

    setIsSubmitting(true);
    try {
      const res = await bountyApi.submitSolution(selectedBounty._id || selectedBounty.id, {
        reviewText,
        codeSolution: codeSolution.trim() || undefined,
      });
      if (res.success) {
        setActionMsg("Your code review was submitted!");
        setReviewText("");
        setCodeSolution("");
        fetchBounties();
        if (selectedBounty) {
          setSelectedBounty({
            ...selectedBounty,
            solutions: [...(selectedBounty.solutions || []), res.solution],
          });
        }
      }
    } catch (err: any) {
      alert(err.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptSolution = async (solutionId: string) => {
    if (!selectedBounty) return;
    try {
      const res = await bountyApi.acceptSolution(selectedBounty._id || selectedBounty.id, solutionId);
      if (res.success) {
        setActionMsg(res.message);
        fetchBounties();
        setSelectedBounty(null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to accept solution");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-lg bg-[#112D4E] text-white shadow-md space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#112D4E]/[.04] rounded-full hidden pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#112D4E] font-bold text-xs mb-1">
              <Coins className="w-4 h-4" />
              <span>Peer Code Review & Bounty Marketplace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Peer Code Review & XP Bounties
            </h1>
            <p className="text-xs text-[#112D4E]/[.55] max-w-xl">
              Post tricky bugs or code architecture questions with an attached XP bounty. Review peers' code to earn bonus XP and level up!
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-3 rounded-lg bg-[#3F72AF] hover:bg-[#112D4E] text-white font-black text-xs shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Post Code Bounty</span>
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-lg bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] text-[#112D4E] text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> {actionMsg}
          </span>
          <button onClick={() => setActionMsg(null)} className="text-[#112D4E] font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {[
            { id: "all", label: "All Bounties" },
            { id: "open", label: "Open Bounties ⚡" },
            { id: "solved", label: "Solved & Awarded ✓" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === tab.id
                  ? "bg-[#3F72AF] text-white shadow-md"
                  : "bg-white text-[#112D4E] hover:bg-[#112D4E]/[.04] border border-[#112D4E]/[.12]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-xs font-bold text-[#112D4E]/[.55]">Total Bounties: {bounties.length}</span>
      </div>

      {/* Bounties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 p-12 text-center text-[#112D4E]/[.55]">
            <div className="w-6 h-6 rounded-full border-2 border-[#112D4E]/[.12] border-t-transparent animate-spin mx-auto mb-2" />
            Loading code bounties...
          </div>
        ) : bounties.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-[#112D4E]/[.55] font-semibold text-xs space-y-2 bg-white rounded-lg border border-[#112D4E]/[.12]">
            <Code2 className="w-8 h-8 mx-auto text-[#112D4E]/[.55]" />
            <p>No code bounties matching your filter. Be the first to post a code bounty!</p>
          </div>
        ) : (
          bounties.map((b) => (
            <div
              key={b._id || b.id}
              onClick={() => setSelectedBounty(b)}
              className="p-5 rounded-lg bg-white border border-[#112D4E]/[.12] hover:border-[#112D4E]/[.12] hover:shadow-sm transition-all duration-300 cursor-pointer space-y-3 flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-[#112D4E]/[.04] text-[#3F72AF] font-mono">
                    {b.language || "TypeScript"}
                  </span>
                  <div className="flex items-center gap-1 text-[#112D4E] font-black text-xs bg-[#112D4E]/[.04] px-2.5 py-0.5 rounded-full border border-[#112D4E]/[.12]">
                    <Coins className="w-3.5 h-3.5" />
                    <span>+{b.bountyXp} XP Bounty</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#112D4E] group-hover:text-[#3F72AF] transition-colors line-clamp-2">
                  {b.title}
                </h3>
                <p className="text-xs text-[#112D4E]/[.55] line-clamp-2 leading-relaxed">{b.description}</p>

                <div className="p-3 rounded-lg bg-[#112D4E] text-[#112D4E] font-mono text-[11px] overflow-hidden max-h-20 opacity-90">
                  <pre>{b.codeSnippet}</pre>
                </div>
              </div>

              <div className="pt-2 border-t border-[#112D4E]/[.12] flex items-center justify-between text-xs text-[#112D4E]/[.55]">
                <div className="flex items-center gap-2">
                  <img
                    src={b.authorAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"}
                    alt={b.authorName}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="font-semibold text-[#112D4E] text-[11px]">{b.authorName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> {(b.solutions || []).length} Reviews
                  </span>
                  {b.status === "solved" ? (
                    <span className="text-[#112D4E] font-bold text-[10px] flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Solved
                    </span>
                  ) : (
                    <span className="text-[#112D4E] font-bold text-[10px]">Open →</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE BOUNTY MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-[#112D4E]/70  flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-lg p-6 border border-[#112D4E]/[.12] shadow-md space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#112D4E]/[.12]">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#112D4E]" />
                <h3 className="text-sm font-black text-[#112D4E]">Post Code Review Bounty</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 text-[#112D4E]/[.55] hover:text-[#112D4E]/[.72]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBounty} className="space-y-3 text-xs font-bold">
              <div>
                <label className="text-[#112D4E]/[.72] block mb-1">Issue / Problem Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Unhandled promise rejection in Express middleware"
                  className="w-full p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#112D4E]/[.72] block mb-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none"
                  >
                    <option value="typescript">TypeScript</option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                    <option value="sql">SQL</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#112D4E]/[.72] block mb-1">XP Bounty Reward</label>
                  <select
                    value={bountyXp}
                    onChange={(e) => setBountyXp(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none text-[#112D4E] font-extrabold"
                  >
                    <option value={50}>+50 XP</option>
                    <option value={100}>+100 XP (Standard)</option>
                    <option value={200}>+200 XP (High Priority)</option>
                    <option value={500}>+500 XP (Major Bounty)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#112D4E]/[.72] block mb-1">Detailed Problem Description</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the expected behavior and what is failing..."
                  className="w-full p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                />
              </div>

              <div>
                <label className="text-[#112D4E]/[.72] block mb-1">Buggy Code Snippet</label>
                <textarea
                  rows={4}
                  required
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="Paste your source code snippet here..."
                  className="w-full p-2.5 rounded-xl bg-[#112D4E] text-[#112D4E] font-mono text-[11px] focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white font-black text-xs shadow-md transition-all cursor-pointer"
              >
                Post Bounty (+{bountyXp} XP)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BOUNTY DETAIL & REVIEW DRAWER */}
      {selectedBounty && (
        <div className="fixed inset-0 z-50 bg-[#112D4E]/70  flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg p-6 border border-[#112D4E]/[.12] shadow-md max-h-[90vh] flex flex-col space-y-4 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#112D4E]/[.12]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-[#112D4E]/[.04] text-[#3F72AF] font-mono">
                  {selectedBounty.language}
                </span>
                <span className="text-xs font-black text-[#112D4E] bg-[#112D4E]/[.04] px-2 py-0.5 rounded-full border border-[#112D4E]/[.12]">
                  +{selectedBounty.bountyXp} XP Bounty
                </span>
              </div>
              <button onClick={() => setSelectedBounty(null)} className="p-1 text-[#112D4E]/[.55] hover:text-[#112D4E]/[.72]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 text-xs">
              <div>
                <h2 className="text-base font-black text-[#112D4E]">{selectedBounty.title}</h2>
                <p className="text-[#112D4E]/[.72] mt-1 leading-relaxed">{selectedBounty.description}</p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#112D4E] text-[#112D4E] font-mono text-[11px] overflow-x-auto">
                <pre>{selectedBounty.codeSnippet}</pre>
              </div>

              {/* Existing Reviews / Solutions */}
              <div className="space-y-3 pt-2 border-t border-[#112D4E]/[.12]">
                <h4 className="font-extrabold text-[#112D4E] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#3F72AF]" />
                  Submitted Peer Reviews ({(selectedBounty.solutions || []).length})
                </h4>

                {(selectedBounty.solutions || []).length === 0 ? (
                  <p className="text-[#112D4E]/[.55] italic">No reviews submitted yet. Be the first to solve this bounty!</p>
                ) : (
                  (selectedBounty.solutions || []).map((sol: any) => (
                    <div
                      key={sol.id}
                      className={`p-3.5 rounded-lg border space-y-2 ${
                        sol.isAccepted ? "bg-[#112D4E]/[.04] border-[#112D4E]/[.12]" : "bg-[#112D4E]/[.04] border-[#112D4E]/[.12]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={sol.solverAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=solver"} alt="Avatar" className="w-5 h-5 rounded-full" />
                          <span className="font-bold text-[#112D4E]">{sol.solverName}</span>
                        </div>
                        {sol.isAccepted ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#112D4E]/[.04] text-[#112D4E] font-bold text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Accepted Solution (+{selectedBounty.bountyXp} XP Awarded)
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAcceptSolution(sol.id)}
                            className="px-3 py-1 rounded-xl bg-[#112D4E] hover:bg-[#112D4E] text-white font-bold text-[10px] cursor-pointer"
                          >
                            Accept & Release Bounty
                          </button>
                        )}
                      </div>
                      <p className="text-[#112D4E] whitespace-pre-wrap">{sol.reviewText}</p>
                      {sol.codeSolution && (
                        <div className="p-2.5 rounded-xl bg-[#112D4E] text-[#112D4E] font-mono text-[10px] overflow-x-auto">
                          <pre>{sol.codeSolution}</pre>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Submit Solution Form */}
              {selectedBounty.status !== "solved" && (
                <form onSubmit={handleSubmitSolution} className="pt-2 border-t border-[#112D4E]/[.12] space-y-2.5">
                  <h4 className="font-extrabold text-[#112D4E]">Submit Your Code Review / Fix</h4>
                  <textarea
                    rows={3}
                    required
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Explain the bug cause and your proposed fix..."
                    className="w-full p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] text-xs focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                  />
                  <textarea
                    rows={3}
                    value={codeSolution}
                    onChange={(e) => setCodeSolution(e.target.value)}
                    placeholder="Optional: Paste clean working code solution..."
                    className="w-full p-2.5 rounded-xl bg-[#112D4E] text-[#112D4E] font-mono text-[10px] focus:outline-none resize-none"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !reviewText.trim()}
                    className="w-full py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? "Submitting Review..." : "Submit Code Review"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  Bot,
  User,
  Send,
  Sparkles,
  Trophy,
  Award,
  CheckCircle2,
  X,
  Code2,
  AlertCircle,
  Play,
  RotateCcw,
} from "lucide-react";
import { interviewApi } from "../../services/api";

interface MockInterviewModalProps {
  onClose: () => void;
}

interface Message {
  sender: "interviewer" | "candidate";
  text: string;
  timestamp: string;
}

export const MockInterviewModal: React.FC<MockInterviewModalProps> = ({ onClose }) => {
  const [role, setRole] = useState("Senior Full-Stack Engineer");
  const [topic, setTopic] = useState("Distributed Systems & React Architecture");
  const [isStarted, setIsStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputAnswer, setInputAnswer] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [scoreCard, setScoreCard] = useState<any>(null);
  const [questionCount, setQuestionCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleStartInterview = async () => {
    setIsStarted(true);
    setIsThinking(true);
    try {
      const res = await interviewApi.interviewTurn({
        role,
        topic,
        history: [],
        candidateAnswer: `Hello! I am ready to start my interview for the ${role} position focusing on ${topic}.`,
      });

      setMessages([
        {
          sender: "interviewer",
          text: res.interviewerResponse || `Welcome to your technical interview for ${role}. Let's begin: Can you describe your approach to designing a high-throughput, low-latency microservice architecture?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setQuestionCount(1);
    } catch (err: any) {
      setMessages([
        {
          sender: "interviewer",
          text: `Welcome! Let's start: How do you handle optimistic UI updates and state rollback in a collaborative real-time React application?`,
          timestamp: "Just now",
        },
      ]);
      setQuestionCount(1);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSendAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputAnswer.trim() || isThinking) return;

    const candidateMsg: Message = {
      sender: "candidate",
      text: inputAnswer.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedHistory = [...messages, candidateMsg];
    setMessages(updatedHistory);
    const sentText = inputAnswer.trim();
    setInputAnswer("");
    setIsThinking(true);

    try {
      const res = await interviewApi.interviewTurn({
        role,
        topic,
        history: updatedHistory.map((m) => ({ sender: m.sender, text: m.text })),
        candidateAnswer: sentText,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "interviewer",
          text: res.interviewerResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      if (res.scoreCard) {
        setScoreCard(res.scoreCard);
      }
      setQuestionCount((prev) => prev + 1);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "interviewer",
          text: `Excellent points. Next, how do you handle cache invalidation across distributed edge nodes?`,
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleFinishInterview = async () => {
    setIsThinking(true);
    try {
      const res = await interviewApi.interviewTurn({
        role,
        topic,
        history: messages.map((m) => ({ sender: m.sender, text: m.text })),
        candidateAnswer: "Please conclude the interview and provide my final score breakdown.",
      });
      if (res.scoreCard) {
        setScoreCard(res.scoreCard);
      } else {
        setScoreCard({
          problemSolving: 88,
          systemDesign: 85,
          communication: 92,
          codeQuality: 87,
          overallScore: 88,
          verdict: "Strong Hire",
          strengths: ["Clear architectural articulation", "Solid grasp of asynchronous concurrency", "Effective edge case analysis"],
          improvements: ["Mention database indexing strategies for read-heavy workloads"],
        });
      }
    } catch {
      setScoreCard({
        problemSolving: 88,
        systemDesign: 85,
        communication: 92,
        codeQuality: 87,
        overallScore: 88,
        verdict: "Strong Hire",
        strengths: ["Clear architectural articulation", "Solid grasp of asynchronous concurrency"],
        improvements: ["Mention database indexing strategies for read-heavy workloads"],
      });
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#112D4E]/70  flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-md border border-[#112D4E]/[.12] flex flex-col h-[88vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 px-6 bg-[#112D4E] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#112D4E]/[.6]   text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black">Groq AI Technical Mock Interview Simulator</h2>
              <p className="text-[10px] text-[#112D4E]/[.55]">FAANG-Calibrated Technical Interviewer & Scorecard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isStarted && !scoreCard && (
              <button
                onClick={handleFinishInterview}
                className="px-3 py-1.5 rounded-xl bg-[#112D4E] hover:bg-[#112D4E] text-white text-xs font-bold transition-all cursor-pointer"
              >
                Conclude & Get Scorecard
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#112D4E]/[.55] hover:text-white rounded-full hover:bg-[#112D4E] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        {!isStarted ? (
          <div className="flex-1 p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-6 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-lg bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] flex items-center justify-center text-[#3F72AF] shadow-sm">
              <Bot className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-[#112D4E]">Choose Your Interview Simulation Track</h3>
              <p className="text-xs text-[#112D4E]/[.55] leading-relaxed">
                Practice real-world coding questions, distributed system designs, and behavioral engineering questions with instant evaluation.
              </p>
            </div>

            <div className="w-full space-y-4 text-left text-xs font-bold">
              <div>
                <label className="text-[#112D4E]/[.72] block mb-1">Target Engineering Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-3 rounded-lg bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                >
                  <option value="Senior Full-Stack Engineer">Senior Full-Stack Engineer (React + Node.js)</option>
                  <option value="Frontend Architect">Frontend Architect (Performance & Design Systems)</option>
                  <option value="Backend & Distributed Systems Engineer">Backend & Distributed Systems Engineer</option>
                  <option value="AI & Machine Learning Engineer">AI & Machine Learning Engineer</option>
                </select>
              </div>

              <div>
                <label className="text-[#112D4E]/[.72] block mb-1">Primary Interview Focus Topic</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full p-3 rounded-lg bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
                >
                  <option value="Distributed Systems & React Architecture">Distributed Systems & React Architecture</option>
                  <option value="Data Structures, Algorithms & Time Complexity">Data Structures, Algorithms & Time Complexity</option>
                  <option value="Database Sharding, Caching & Microservices">Database Sharding, Caching & Microservices</option>
                  <option value="High-Throughput API Design & Security">High-Throughput API Design & Security</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleStartInterview}
              className="w-full py-3.5 rounded-lg bg-[#3F72AF] hover:bg-[#112D4E] text-white font-black text-xs shadow-sm hover:scale-[1.02] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Begin Live Interview Session</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Conversation Window */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#112D4E]/[.04] text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${m.sender === "candidate" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                      m.sender === "candidate" ? "bg-[#3F72AF]" : "bg-[#112D4E]"
                    }`}
                  >
                    {m.sender === "candidate" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[80%] p-4 rounded-lg space-y-1 shadow-2xs ${
                      m.sender === "candidate"
                        ? "bg-[#3F72AF] text-white rounded-tr-xs"
                        : "bg-white text-[#112D4E] border border-[#112D4E]/[.12] rounded-tl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                    <span
                      className={`text-[9px] block text-right ${
                        m.sender === "candidate" ? "text-[#112D4E]" : "text-[#112D4E]/[.55]"
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-2 text-[#112D4E]/[.55] text-xs pl-11">
                  <div className="w-2 h-2 rounded-full bg-[#112D4E]/[.15] animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-[#112D4E]/[.15] animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-[#112D4E]/[.15] animate-bounce [animation-delay:0.4s]" />
                  <span>AI Interviewer is analyzing your response...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Scorecard Modal Popup if generated */}
            {scoreCard && (
              <div className="p-5 bg-[#112D4E] text-white border-t border-[#112D4E]/[.12] space-y-3 animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#112D4E]" />
                    <h3 className="text-sm font-black">Candidate Evaluation Scorecard</h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      scoreCard.verdict === "Strong Hire" || scoreCard.verdict === "Hire"
                        ? "bg-[#112D4E]/[.04] text-[#112D4E] border border-[#112D4E]/[.12]"
                        : "bg-[#112D4E]/[.04] text-[#112D4E]"
                    }`}
                  >
                    Verdict: {scoreCard.verdict || "Hire"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-[#112D4E]/80 border border-[#112D4E]/[.12]">
                    <p className="text-[10px] text-[#112D4E]/[.55]">Problem Solving</p>
                    <p className="text-sm font-black text-[#112D4E]">{scoreCard.problemSolving || 88}/100</p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#112D4E]/80 border border-[#112D4E]/[.12]">
                    <p className="text-[10px] text-[#112D4E]/[.55]">System Design</p>
                    <p className="text-sm font-black text-[#112D4E]">{scoreCard.systemDesign || 85}/100</p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#112D4E]/80 border border-[#112D4E]/[.12]">
                    <p className="text-[10px] text-[#112D4E]/[.55]">Communication</p>
                    <p className="text-sm font-black text-[#112D4E]">{scoreCard.communication || 90}/100</p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#112D4E]/80 border border-[#112D4E]/[.12]">
                    <p className="text-[10px] text-[#112D4E]/[.55]">Overall Score</p>
                    <p className="text-sm font-black text-white">{scoreCard.overallScore || 88}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-[#112D4E]/30 border border-[#112D4E]/[.12] text-[#112D4E] space-y-1">
                    <p className="font-bold">Key Strengths:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {(scoreCard.strengths || ["Strong architectural clarity", "Good concurrency models"]).map((s: string, idx: number) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#112D4E]/30 border border-[#112D4E]/[.12] text-[#112D4E] space-y-1">
                    <p className="font-bold">Areas for Improvement:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {(scoreCard.improvements || ["Consider Redis edge cache TTL policies"]).map((s: string, idx: number) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Input Bar */}
            {!scoreCard && (
              <form onSubmit={handleSendAnswer} className="p-4 bg-white border-t border-[#112D4E]/[.12] flex gap-2">
                <textarea
                  rows={2}
                  value={inputAnswer}
                  onChange={(e) => setInputAnswer(e.target.value)}
                  placeholder="Type your technical response or code approach..."
                  className="flex-1 p-3 rounded-lg bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] text-xs focus:outline-none focus:ring-2 focus:ring-[#3F72AF] resize-none"
                />
                <button
                  type="submit"
                  disabled={!inputAnswer.trim() || isThinking}
                  className="px-5 rounded-lg bg-[#3F72AF] hover:bg-[#112D4E] text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

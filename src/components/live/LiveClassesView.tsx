import React, { useEffect, useRef, useState } from "react";
import {
  Video,
  Users,
  Clock,
  Sparkles,
  Send,
  Radio,
  Bell,
  CheckCircle,
  Code2,
  Play,
  Hand,
  HelpCircle,
  Terminal,
  Check,
  Plus,
  X,
  CalendarDays,
} from "lucide-react";
import { LiveClass, UserProfile } from "../../types";
import { liveApi } from "../../services/api";
import { Room, RoomEvent, Track } from "livekit-client";

interface LiveClassesViewProps {
  liveClasses: LiveClass[];
  currentUser?: UserProfile;
  onClassCreated?: (newClass: LiveClass) => void;
}

export const LiveClassesView: React.FC<LiveClassesViewProps> = ({ liveClasses, currentUser, onClassCreated }) => {
  const [activeStream, setActiveStream] = useState<LiveClass | undefined>(liveClasses[0]);
  const [room, setRoom] = useState<Room | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [activeChatTab, setActiveChatTab] = useState<"chat" | "qa" | "snippets">("chat");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    category: "Web Development",
    startTime: "",
    duration: "60m",
    thumbnail: "",
  });

  const isEducator = currentUser?.role === "COURSE_EDUCATOR" || currentUser?.role === "FREELANCER" || (currentUser as any)?.role === "ADMIN";

  const handleCreateLiveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title || !createForm.startTime) return;
    setIsCreating(true);
    try {
      const res = await liveApi.create({
        title: createForm.title,
        description: createForm.description,
        category: createForm.category,
        startTime: createForm.startTime,
        duration: createForm.duration,
        thumbnail: createForm.thumbnail || undefined,
      });
      if ((res as any).success) {
        const created = (res as any).liveClass;
        // Map to LiveClass type
        const mappedClass: LiveClass = {
          id: created._id || created.id || `live_${Date.now()}`,
          title: created.title,
          hostName: created.hostName,
          hostAvatar: created.hostAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${created.hostName}`,
          hostTitle: created.hostTitle || 'Educator',
          category: created.category,
          startTime: created.startTime ? new Date(created.startTime).toLocaleString() : 'Soon',
          viewersCount: 0,
          isLive: false,
          thumbnail: created.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
          description: created.description,
        };
        onClassCreated?.(mappedClass);
        setIsCreateOpen(false);
        setCreateForm({ title: "", description: "", category: "Web Development", startTime: "", duration: "60m", thumbnail: "" });
      }
    } catch (err) {
      console.error("Create live class error:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const [chatMessages, setChatMessages] = useState<
    { user: string; text: string; time: string; codeSnippet?: { lang: string; code: string } }[]
  >([
    { user: "Sarah C.", text: "Super excited for this live build!", time: "10:02" },
    { user: "Devon M.", text: "Will the recording be available later on LearnX?", time: "10:03" },
    { user: "Elena R. (Host)", text: "Yes! Here is the live snippet for today's state reducer:", time: "10:04", codeSnippet: { lang: "typescript", code: "const reducer = (state, action) => {\n  switch(action.type) {\n    case 'SYNC': return { ...state, synced: true };\n    default: return state;\n  }\n};" } },
  ]);

  const [qaQueue, setQaQueue] = useState<
    { id: string; user: string; question: string; votes: number; isAnswered?: boolean }[]
  >([
    { id: "qa_1", user: "Michael T.", question: "How does Gemini 3.6 manage context window compression in production?", votes: 14 },
    { id: "qa_2", user: "Devon M.", question: "Is it better to use WebSockets or WebRTC for collaborative canvas sync?", votes: 9, isAnswered: true },
  ]);

  const [inputChat, setInputChat] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [handRaised, setHandRaised] = useState(false);
  const [reminders, setReminders] = useState<{ [id: string]: boolean }>({});
  const [activeSnippetCode, setActiveSnippetCode] = useState<string | null>(null);
  const [codeOutput, setCodeOutput] = useState<string | null>(null);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChat.trim()) return;
    setChatMessages([
      ...chatMessages,
      { user: "Alex Vance (You)", text: inputChat.trim(), time: "Now" },
    ]);
    setInputChat("");
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setQaQueue([
      ...qaQueue,
      { id: `qa_${Date.now()}`, user: "Alex Vance", question: newQuestion.trim(), votes: 1 },
    ]);
    setNewQuestion("");
  };

  const toggleUpvoteQa = (id: string) => {
    setQaQueue((prev) =>
      prev.map((q) => (q.id === id ? { ...q, votes: q.votes + 1 } : q))
    );
  };

  const toggleReminder = async (id: string) => {
    setReminders((prev) => ({ ...prev, [id]: !prev[id] }));
    try {
      await liveApi.rsvp(id);
    } catch (err) {
      console.error("RSVP error:", err);
    }
  };

  const handleRunSnippet = (code: string) => {
    setActiveSnippetCode(code);
    setCodeOutput("Executing snippet...");
    setTimeout(() => {
      setCodeOutput("[Process exited with code 0]\n✓ State reducer compiled successfully.\n✓ State mutation verified.");
    }, 600);
  };

  useEffect(() => () => {
    room?.disconnect();
  }, [room]);

  const handleJoinRoom = async () => {
    if (!activeStream || room) return;
    setIsJoining(true);
    setRoomError(null);
    try {
      const classId = activeStream.id || (activeStream as any)._id;
      const roomAccess = await liveApi.getRoomToken(classId);
      const nextRoom = new Room();
      nextRoom.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Video && videoContainerRef.current) {
          videoContainerRef.current.appendChild(track.attach());
        }
      });
      nextRoom.on(RoomEvent.TrackUnsubscribed, (track) => track.detach().forEach((element) => element.remove()));
      await nextRoom.connect(roomAccess.url, roomAccess.token);
      setRoom(nextRoom);
    } catch (err: any) {
      setRoomError(err?.message || "Unable to join this live room.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveRoom = () => {
    room?.disconnect();
    setRoom(null);
    if (videoContainerRef.current) videoContainerRef.current.replaceChildren();
  };

  if (!activeStream) {
    return (
      <div className="space-y-6">
        <div className="bg-[#112D4E] text-white rounded-lg p-12 text-center space-y-4 border border-[#112D4E]/[.12] shadow-md">
          <Radio className="w-12 h-12 mx-auto text-[#112D4E]/[.55]" />
          <h2 className="text-xl font-black">No Active Live Sessions</h2>
          <p className="text-xs text-[#112D4E]/[.55] max-w-sm mx-auto">
            There are no interactive streams scheduled right now. Check back soon for upcoming masterclasses.
          </p>
          {isEducator && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mx-auto mt-2 px-6 py-3 rounded-lg bg-[#3F72AF] text-white text-xs font-black hover:bg-[#112D4E] transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Schedule Your First Live Class
            </button>
          )}
        </div>
        {/* Create Live Class Modal */}
        {isCreateOpen && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-5 bg-[#112D4E] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-[#3F72AF]" />
                  <h3 className="font-black text-sm">Schedule a New Live Class</h3>
                </div>
                <button onClick={() => setIsCreateOpen(false)} className="p-1.5 rounded-full hover:bg-[#112D4E] cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleCreateLiveClass} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#112D4E] block mb-1">Class Title *</label>
                  <input value={createForm.title} onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Building Fullstack AI Apps with Next.js" className="w-full border border-[#112D4E]/[.12] rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3F72AF]" required />
                </div>
                <div>
                  <label className="font-bold text-[#112D4E] block mb-1">Description</label>
                  <textarea value={createForm.description} onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))} rows={2} placeholder="What will students learn in this session?" className="w-full border border-[#112D4E]/[.12] rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3F72AF] resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#112D4E] block mb-1">Category</label>
                    <select value={createForm.category} onChange={(e) => setCreateForm((f) => ({ ...f, category: e.target.value }))} className="w-full border border-[#112D4E]/[.12] rounded-xl px-3 py-2.5 focus:outline-none">
                      {["Web Development", "System Design & DSA", "Cloud & DevOps", "AI & Machine Learning", "Mobile Development", "Open Source"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-[#112D4E] block mb-1">Duration</label>
                    <select value={createForm.duration} onChange={(e) => setCreateForm((f) => ({ ...f, duration: e.target.value }))} className="w-full border border-[#112D4E]/[.12] rounded-xl px-3 py-2.5 focus:outline-none">
                      {["30m", "45m", "60m", "90m", "120m"].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="font-bold text-[#112D4E] block mb-1">Start Date & Time *</label>
                  <input type="datetime-local" value={createForm.startTime} onChange={(e) => setCreateForm((f) => ({ ...f, startTime: e.target.value }))} className="w-full border border-[#112D4E]/[.12] rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3F72AF]" required />
                </div>
                <div>
                  <label className="font-bold text-[#112D4E] block mb-1">Thumbnail URL (optional)</label>
                  <input value={createForm.thumbnail} onChange={(e) => setCreateForm((f) => ({ ...f, thumbnail: e.target.value }))} placeholder="https://..." className="w-full border border-[#112D4E]/[.12] rounded-xl px-3 py-2.5 focus:outline-none" />
                </div>
                <button type="submit" disabled={isCreating} className="w-full py-3 rounded-lg bg-[#3F72AF] text-white font-black hover:bg-[#112D4E] transition-all cursor-pointer disabled:opacity-50">
                  {isCreating ? "Scheduling..." : "📡 Schedule Live Class"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Educator Header Button */}
      {isEducator && (
        <div className="flex justify-end">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#3F72AF] text-white text-xs font-black hover:bg-[#112D4E] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Schedule Live Class
          </button>
        </div>
      )}

      {/* Create Live Class Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-5 bg-[#112D4E] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#3F72AF]" />
                <h3 className="font-black text-sm">Schedule a New Live Class</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="p-1.5 rounded-full hover:bg-[#112D4E] cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateLiveClass} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#112D4E] block mb-1">Class Title *</label>
                <input value={createForm.title} onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Building Fullstack AI Apps with Next.js" className="w-full border border-[#112D4E]/[.12] rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3F72AF]" required />
              </div>
              <div>
                <label className="font-bold text-[#112D4E] block mb-1">Description</label>
                <textarea value={createForm.description} onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))} rows={2} placeholder="What will students learn in this session?" className="w-full border border-[#112D4E]/[.12] rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3F72AF] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#112D4E] block mb-1">Category</label>
                  <select value={createForm.category} onChange={(e) => setCreateForm((f) => ({ ...f, category: e.target.value }))} className="w-full border border-[#112D4E]/[.12] rounded-xl px-3 py-2.5 focus:outline-none">
                    {["Web Development", "System Design & DSA", "Cloud & DevOps", "AI & Machine Learning", "Mobile Development", "Open Source"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#112D4E] block mb-1">Duration</label>
                  <select value={createForm.duration} onChange={(e) => setCreateForm((f) => ({ ...f, duration: e.target.value }))} className="w-full border border-[#112D4E]/[.12] rounded-xl px-3 py-2.5 focus:outline-none">
                    {["30m", "45m", "60m", "90m", "120m"].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-[#112D4E] block mb-1">Start Date & Time *</label>
                <input type="datetime-local" value={createForm.startTime} onChange={(e) => setCreateForm((f) => ({ ...f, startTime: e.target.value }))} className="w-full border border-[#112D4E]/[.12] rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#3F72AF]" required />
              </div>
              <div>
                <label className="font-bold text-[#112D4E] block mb-1">Thumbnail URL (optional)</label>
                <input value={createForm.thumbnail} onChange={(e) => setCreateForm((f) => ({ ...f, thumbnail: e.target.value }))} placeholder="https://..." className="w-full border border-[#112D4E]/[.12] rounded-xl px-3 py-2.5 focus:outline-none" />
              </div>
              <button type="submit" disabled={isCreating} className="w-full py-3 rounded-lg bg-[#3F72AF] text-white font-black hover:bg-[#112D4E] transition-all cursor-pointer disabled:opacity-50">
                {isCreating ? "Scheduling..." : "📡 Schedule Live Class"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Active Stream Stage */}
      <div className="bg-[#112D4E] rounded-lg overflow-hidden border border-[#112D4E]/[.12] shadow-md">
        {/* Top Bar */}
        <div className="p-4 bg-[#112D4E] flex items-center justify-between text-white border-b border-[#112D4E]/[.12]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#112D4E] text-white text-xs font-black uppercase tracking-wider animate-pulse">
              <Radio className="w-3.5 h-3.5" /> LIVE STREAM
            </span>
            <h2 className="text-sm font-bold truncate max-w-md">
              {activeStream.title}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#112D4E]/[.55]">
            <button
              onClick={() => setHandRaised(!handRaised)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                handRaised
                  ? "bg-[#112D4E]/[.04] text-[#112D4E] font-black shadow-sm"
                  : "bg-[#112D4E] text-[#112D4E]/[.55] hover:bg-[#112D4E]"
              }`}
            >
              <Hand className="w-3.5 h-3.5" />
              <span>{handRaised ? "Hand Raised 🖐️" : "Raise Hand"}</span>
            </button>
            <span className="flex items-center gap-1 text-[#112D4E] font-bold">
              <Users className="w-4 h-4" /> {activeStream.viewersCount} Watching
            </span>
          </div>
        </div>

        {/* Video Stage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Main Video Viewport */}
          <div className="lg:col-span-2 relative aspect-video bg-black flex flex-col items-center justify-center overflow-hidden">
            <div ref={videoContainerRef} className="absolute inset-0 grid place-items-center [&_video]:h-full [&_video]:w-full [&_video]:object-contain" />
            {!room && <img src={activeStream.thumbnail} alt={activeStream.title} className="w-full h-full object-cover opacity-60" />}
            <div className="absolute inset-0 bg-[#112D4E]/[.6]   " />

            <div className="absolute z-10 text-center space-y-3 p-4">
              <div className="w-16 h-16 rounded-full bg-[#112D4E]/90 text-white flex items-center justify-center mx-auto shadow-md ring-4 ring-[#112D4E]/[.25]">
                <Radio className="w-8 h-8 animate-pulse" />
              </div>
              <p className="text-sm font-extrabold text-white max-w-sm">
                {room ? "Connected to live room" : `Live Interactive Masterclass with ${activeStream.hostName}`}
              </p>
              <button
                onClick={room ? handleLeaveRoom : handleJoinRoom}
                disabled={isJoining}
                className="px-4 py-2 rounded-xl bg-[#3F72AF] text-white text-xs font-black disabled:opacity-50"
              >
                {isJoining ? "Joining..." : room ? "Leave Room" : "Join Live Room"}
              </button>
              {roomError && <p className="max-w-sm text-xs font-semibold text-[#112D4E]">{roomError}</p>}
            </div>

            {/* Floating Live Code Snippet Display Overlay */}
            {activeSnippetCode && (
              <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#112D4E]/95 border border-[#112D4E]/[.12] p-3 rounded-lg text-xs font-mono text-[#112D4E]/[.55]  shadow-md space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#112D4E]/[.55] border-b border-[#112D4E]/[.12] pb-1.5">
                  <span className="flex items-center gap-1.5 text-[#112D4E] font-bold">
                    <Terminal className="w-3.5 h-3.5" /> Live Shared Code
                  </span>
                  <button
                    onClick={() => setActiveSnippetCode(null)}
                    className="text-[#112D4E]/[.55] hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <pre className="text-[11px] text-[#112D4E] overflow-x-auto max-h-28">
                  <code>{activeSnippetCode}</code>
                </pre>
                {codeOutput && (
                  <div className="p-2 rounded-xl bg-black text-[10px] text-[#112D4E] font-mono">
                    {codeOutput}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactive Stream Side Panel */}
          <div className="bg-[#112D4E] border-l border-[#112D4E]/[.12] flex flex-col h-96 lg:h-auto">
            {/* Panel Navigation Tabs */}
            <div className="p-2 bg-[#112D4E] border-b border-[#112D4E]/[.12] flex items-center gap-1 text-xs">
              <button
                onClick={() => setActiveChatTab("chat")}
                className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeChatTab === "chat"
                    ? "bg-[#112D4E] text-white"
                    : "text-[#112D4E]/[.55] hover:text-white"
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveChatTab("qa")}
                className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeChatTab === "qa"
                    ? "bg-[#112D4E] text-white"
                    : "text-[#112D4E]/[.55] hover:text-white"
                }`}
              >
                Q&A ({qaQueue.length})
              </button>
            </div>

            {activeChatTab === "chat" ? (
              <>
                <div className="flex-1 p-3 space-y-3 overflow-y-auto text-xs scrollbar-thin scrollbar-thumb-[#112D4E]/[.35]">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-[#112D4E]">{msg.user}</span>
                        <span className="text-[#112D4E]/[.55]">{msg.time}</span>
                      </div>
                      <p className="text-[#112D4E]/[.55] bg-[#112D4E]/60 p-2.5 rounded-xl">
                        {msg.text}
                      </p>
                      {msg.codeSnippet && (
                        <div className="p-2 rounded-xl bg-black border border-[#112D4E]/[.12] font-mono text-[10px] text-[#112D4E] space-y-1.5">
                          <div className="flex items-center justify-between text-[9px] text-[#112D4E]/[.55]">
                            <span>{msg.codeSnippet.lang}</span>
                            <button
                              onClick={() => handleRunSnippet(msg.codeSnippet!.code)}
                              className="text-[#112D4E] hover:underline flex items-center gap-1 font-bold"
                            >
                              <Play className="w-2.5 h-2.5" /> Run Code
                            </button>
                          </div>
                          <pre className="overflow-x-auto">
                            <code>{msg.codeSnippet.code}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChat} className="p-3 border-t border-[#112D4E]/[.12] flex gap-2">
                  <input
                    type="text"
                    value={inputChat}
                    onChange={(e) => setInputChat(e.target.value)}
                    placeholder="Send a live message..."
                    className="flex-1 bg-[#112D4E] text-[#112D4E]/[.55] text-xs px-3 py-2 rounded-xl border border-[#112D4E]/[.12] focus:outline-none focus:border-[#112D4E]/[.12]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#3F72AF] text-white rounded-xl text-xs font-bold hover:bg-[#112D4E] cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col p-3 space-y-3 overflow-y-auto">
                <form onSubmit={handleAddQuestion} className="flex gap-2 pb-2 border-b border-[#112D4E]/[.12]">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Ask a question for Q&A..."
                    className="flex-1 bg-[#112D4E] text-[#112D4E]/[.55] text-xs px-3 py-2 rounded-xl border border-[#112D4E]/[.12] focus:outline-none focus:border-[#112D4E]/[.12]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#112D4E] text-white rounded-xl text-xs font-bold hover:bg-[#112D4E] cursor-pointer"
                  >
                    Ask
                  </button>
                </form>

                <div className="space-y-2 flex-1 overflow-y-auto">
                  {qaQueue.map((q) => (
                    <div
                      key={q.id}
                      className="p-3 rounded-lg bg-[#112D4E]/70 border border-[#112D4E]/[.12] space-y-1.5 text-xs text-[#112D4E]/[.55]"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-[#112D4E]">{q.user}</span>
                        {q.isAnswered && (
                          <span className="px-2 py-0.5 rounded-full bg-[#112D4E]/[.04] text-[#112D4E] font-bold">
                            Answered Live
                          </span>
                        )}
                      </div>
                      <p className="leading-snug">{q.question}</p>
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => toggleUpvoteQa(q.id)}
                          className="text-[10px] text-[#112D4E]/[.55] hover:text-white flex items-center gap-1 bg-[#112D4E] px-2 py-1 rounded-lg"
                        >
                          ▲ Upvote ({q.votes})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Schedule Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-[#112D4E]">
          Upcoming Live Workshops & Masterclasses
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {liveClasses.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border transition-all duration-300 flex items-center justify-between gap-4 ${
                activeStream.id === item.id
                  ? "bg-[#112D4E]/50 border-[#112D4E]/[.12] ring-2 ring-[#112D4E]/[.25]"
                  : "bg-white border-[#112D4E]/[.12] hover:shadow-md"
              }`}
            >
              <div
                onClick={() => setActiveStream(item)}
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-24 h-16 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0 space-y-1">
                  <span className="text-[10px] font-bold text-[#112D4E] uppercase tracking-wider">
                    {item.startTime}
                  </span>
                  <h4 className="text-xs font-bold text-[#112D4E] line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#112D4E]/[.55]">
                    Host: {item.hostName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => toggleReminder(item.id)}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reminders[item.id]
                    ? "bg-[#112D4E]/[.04] text-[#112D4E]"
                    : "bg-[#112D4E]/[.04] hover:bg-[#112D4E]/[.08] text-[#112D4E]"
                }`}
                title={reminders[item.id] ? "Reminder set!" : "Set Reminder"}
              >
                {reminders[item.id] ? (
                  <CheckCircle className="w-4 h-4 text-[#112D4E]" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Code2,
  Mic,
  Image as ImageIcon,
  Heart,
  Phone,
  Video,
  Info,
  Search,
  Edit,
  ChevronDown,
  Pin,
  Smile,
  CheckCheck,
  Sparkles,
  Plus,
  Play,
  Square,
  UserPlus,
  Volume2,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { DirectMessage, ConversationThread, UserProfile } from "../../types";
import { MOCK_CONVERSATIONS } from "../../data/mockData";
import { messagingApi } from "../../services/api";

interface DirectMessagesModalProps {
  currentUser: UserProfile;
  messages?: DirectMessage[];
  onClose: () => void;
}

export const DirectMessagesModal: React.FC<DirectMessagesModalProps> = ({
  currentUser,
  onClose,
}) => {
  const [conversations, setConversations] = useState<ConversationThread[]>(MOCK_CONVERSATIONS);
  const [selectedThreadId, setSelectedThreadId] = useState<string>("conv_1");
  const [activeTab, setActiveTab] = useState<"primary" | "general" | "requests">("primary");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Message input state
  const [inputText, setInputText] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeSnippetText, setCodeSnippetText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(0);

  // Call overlay state
  const [activeCall, setActiveCall] = useState<{ type: "audio" | "video"; name: string; avatar: string } | null>(null);
  
  // Mobile navigation state
  const [showMobileChat, setShowMobileChat] = useState(false);

  // New Chat Modal state
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedThread = conversations.find((c) => c.id === selectedThreadId) || conversations[0];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedThread?.messages]);

  // Voice recording timer effect
  useEffect(() => {
    let interval: any;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setRecordingTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTimer(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  // Handle selecting thread & mark as read
  const handleSelectThread = (id: string) => {
    setSelectedThreadId(id);
    setShowMobileChat(true);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  // Total unread count
  const totalUnreadCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  // Filter threads based on search and category
  const filteredThreads = conversations.filter((thread) => {
    const matchesCategory = thread.category === activeTab;
    const matchesSearch =
      thread.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.participant.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.lastMessageText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle Sending Message
  const handleSendMessage = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    if (!selectedThread) return;
    const textToSend = customText !== undefined ? customText : inputText.trim();

    if (!textToSend && !codeSnippetText.trim() && !selectedImage && !isRecordingVoice) return;

    const newMsg: DirectMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      recipientId: selectedThread.participant.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: textToSend || (selectedImage ? "Shared an image" : isRecordingVoice ? "Voice note" : "Shared code snippet"),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      codeSnippet: codeSnippetText.trim()
        ? {
            language: "typescript",
            code: codeSnippetText.trim(),
          }
        : undefined,
      imageUrl: selectedImage || undefined,
      isVoiceNote: isRecordingVoice,
      voiceDuration: isRecordingVoice ? `0:${recordingTimer < 10 ? "0" : ""}${recordingTimer}` : undefined,
    };

    // Sync message to backend
    try {
      messagingApi.sendMessage(
        selectedThread.participant.id,
        newMsg.text,
        selectedImage || undefined
      );
    } catch (e) {
      console.error("Messaging sync error:", e);
    }

    // Update conversation
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === selectedThread.id) {
          return {
            ...conv,
            lastMessageText: newMsg.text,
            lastMessageTime: "Just now",
            messages: [...conv.messages, newMsg],
          };
        }
        return conv;
      })
    );

    // Reset inputs
    setInputText("");
    setCodeSnippetText("");
    setShowCodeInput(false);
    setSelectedImage(null);
    setIsRecordingVoice(false);

    // Simulate Receiving Reply from Participant after 1.5s
    setTimeout(() => {
      const replies = [
        "Got it! That looks super clean and efficient. 🚀",
        "Awesome update! Thanks for sharing this with me.",
        "Let me test this code block on my local environment real quick! 👍",
        "Great work! Let's discuss this during our next session! 🔥",
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const replyMsg: DirectMessage = {
        id: `msg_reply_${Date.now()}`,
        senderId: selectedThread.participant.id,
        recipientId: currentUser.id,
        senderName: selectedThread.participant.name,
        senderAvatar: selectedThread.participant.avatar,
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === selectedThread.id) {
            return {
              ...conv,
              lastMessageText: replyMsg.text,
              lastMessageTime: "Just now",
              messages: [...conv.messages, replyMsg],
            };
          }
          return conv;
        })
      );
    }, 1500);
  };

  // Toggle reaction on a message
  const handleToggleReaction = (msgId: string, emoji: string) => {
    if (!selectedThread) return;
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === selectedThread.id) {
          return {
            ...conv,
            messages: conv.messages.map((msg) => {
              if (msg.id === msgId) {
                const existing = msg.reactions || [];
                const updated = existing.includes(emoji)
                  ? existing.filter((r) => r !== emoji)
                  : [...existing, emoji];
                return { ...msg, reactions: updated };
              }
              return msg;
            }),
          };
        }
        return conv;
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#112D4E]/60  flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      <div className="bg-white w-full max-w-5xl h-[92vh] sm:h-[88vh] rounded-lg shadow-md border border-[#112D4E]/[.12] flex overflow-hidden relative animate-in fade-in zoom-in duration-200 text-[#112D4E]">
        
        {/* ================= LEFT SIDEBAR: INBOX CONVERSATIONS INDEX ================= */}
        <div
          className={`w-full md:w-[360px] lg:w-[400px] border-r border-[#112D4E]/[.12] flex flex-col bg-white shrink-0 ${
            showMobileChat ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Instagram Direct Header */}
          <div className="p-4 px-5 border-b border-[#112D4E]/[.12] flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-1.5 cursor-pointer">
              <span className="font-black text-base tracking-tight text-[#112D4E]">
                {currentUser.handle}
              </span>
              <span className="w-2 h-2 rounded-full bg-[#3F72AF]" />
              <ChevronDown className="w-4 h-4 text-[#112D4E]/[.55]" />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewChatModal(true)}
                className="p-2 rounded-full hover:bg-[#112D4E]/[.04] text-[#112D4E] transition-colors cursor-pointer"
                title="New Message"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-[#112D4E]/[.55] hover:text-[#112D4E] rounded-full hover:bg-[#112D4E]/[.04] transition-colors cursor-pointer md:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-3 px-4 bg-white border-b border-[#112D4E]/[.12] shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-[#112D4E]/[.55] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search inbox index..."
                className="w-full bg-[#112D4E]/[.04] text-xs pl-9 pr-4 py-2 rounded-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#3F72AF]"
              />
            </div>
          </div>

          {/* Instagram Active Notes / Stories Row */}
          <div className="p-3 border-b border-[#112D4E]/[.12] bg-white overflow-x-auto scrollbar-none flex items-center gap-3 shrink-0">
            {/* User Note */}
            <div className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-13 h-13 rounded-full object-cover ring-2 ring-[#112D4E]/[.25] p-0.5"
                />
                <span className="absolute -bottom-1 -right-1 bg-[#3F72AF] text-white p-0.5 rounded-full ring-2 ring-white">
                  <Plus className="w-3 h-3" />
                </span>
              </div>
              <span className="text-[10px] font-semibold text-[#112D4E]/[.55]">Your note</span>
            </div>

            {/* Active Contacts Notes */}
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectThread(conv.id)}
                className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
              >
                <div className="relative">
                  {/* Thought Bubble Note */}
                  {conv.participant.note && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#112D4E] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md z-10 scale-90 group-hover:scale-100 transition-transform">
                      {conv.participant.note}
                    </div>
                  )}
                  <img
                    src={conv.participant.avatar}
                    alt={conv.participant.name}
                    className="w-13 h-13 rounded-full object-cover ring-2 ring-[#112D4E]/[.25] p-0.5 group-hover:scale-105 transition-transform"
                  />
                  {conv.participant.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#112D4E]/[.04] ring-2 ring-white rounded-full" />
                  )}
                </div>
                <span className="text-[10px] font-bold text-[#112D4E] truncate max-w-[56px]">
                  {conv.participant.name.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>

          {/* Primary / General / Requests Tabs */}
          <div className="flex items-center justify-around border-b border-[#112D4E]/[.12] bg-white text-xs font-bold shrink-0">
            <button
              onClick={() => setActiveTab("primary")}
              className={`py-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "primary"
                  ? "border-[#112D4E]/[.12] text-[#3F72AF]"
                  : "border-transparent text-[#112D4E]/[.55] hover:text-[#112D4E]"
              }`}
            >
              Primary
              {conversations.filter((c) => c.category === "primary" && c.unreadCount > 0).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#3F72AF]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("general")}
              className={`py-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "general"
                  ? "border-[#112D4E]/[.12] text-[#3F72AF]"
                  : "border-transparent text-[#112D4E]/[.55] hover:text-[#112D4E]"
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`py-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "requests"
                  ? "border-[#112D4E]/[.12] text-[#3F72AF]"
                  : "border-transparent text-[#112D4E]/[.55] hover:text-[#112D4E]"
              }`}
            >
              Requests
              <span className="px-1.5 py-0.2 rounded-full bg-[#112D4E]/[.04] text-[#112D4E] text-[10px]">
                {conversations.filter((c) => c.category === "requests").length}
              </span>
            </button>
          </div>

          {/* Receiving Inbox Index Summary Header */}
          <div className="px-4 py-2 bg-[#112D4E]/70 border-b border-[#112D4E]/[.12] flex items-center justify-between text-[11px] font-bold text-[#112D4E]/[.55] uppercase tracking-wider shrink-0">
            <span>Receiving Inbox Index</span>
            <span className="text-[#3F72AF] font-extrabold">
              {filteredThreads.length} Threads {totalUnreadCount > 0 ? `• ${totalUnreadCount} Unread` : ""}
            </span>
          </div>

          {/* Conversation Index List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#112D4E]/[.12] scrollbar-thin">
            {filteredThreads.length === 0 ? (
              <div className="text-center py-12 px-4 text-[#112D4E]/[.55] space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-xs">No conversations found in this category</p>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = thread.id === selectedThreadId;
                return (
                  <div
                    key={thread.id}
                    onClick={() => handleSelectThread(thread.id)}
                    className={`p-3.5 px-4 flex items-center gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#112D4E]/70 border-l-4 border-[#112D4E]/[.12]"
                        : "hover:bg-white bg-white"
                    }`}
                  >
                    {/* Index Number Badge */}
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0 ${
                        thread.unreadCount > 0
                          ? "bg-[#3F72AF] text-white shadow-xs"
                          : "bg-[#112D4E]/80 text-[#112D4E]/[.72]"
                      }`}
                      title={`Receiving Message Index #${thread.indexNumber}`}
                    >
                      #{thread.indexNumber < 10 ? `0${thread.indexNumber}` : thread.indexNumber}
                    </span>

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={thread.participant.avatar}
                        alt={thread.participant.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-[#112D4E]/[.25]"
                      />
                      {thread.participant.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#112D4E]/[.04] ring-2 ring-white rounded-full" />
                      )}
                    </div>

                    {/* Content Preview */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4
                          className={`text-xs truncate ${
                            thread.unreadCount > 0 ? "font-black text-[#112D4E]" : "font-bold text-[#112D4E]"
                          }`}
                        >
                          {thread.participant.name}
                        </h4>
                        <span className="text-[10px] text-[#112D4E]/[.55] shrink-0 ml-2">
                          {thread.lastMessageTime}
                        </span>
                      </div>
                      <p
                        className={`text-xs truncate ${
                          thread.unreadCount > 0
                            ? "font-extrabold text-[#3F72AF]"
                            : "text-[#112D4E]/[.55]"
                        }`}
                      >
                        {thread.lastMessageText}
                      </p>
                    </div>

                    {/* Unread Counter Badge */}
                    {thread.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#3F72AF] text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= RIGHT MAIN PANEL: ACTIVE CHAT THREAD ================= */}
        <div
          className={`flex-1 flex flex-col bg-white h-full min-w-0 ${
            !showMobileChat ? "hidden md:flex" : "flex"
          }`}
        >
          {!selectedThread ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 bg-white">
              <MessageSquare className="w-12 h-12 text-[#112D4E]/[.55]" />
              <h3 className="font-extrabold text-[#112D4E] text-sm">Your Direct Messages</h3>
              <p className="text-xs text-[#112D4E]/[.55] max-w-xs leading-relaxed">
                Send private messages, share code snippets, or start audio calls.
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="mt-2 px-5 py-2.5 rounded-full bg-[#3F72AF] text-white text-xs font-bold shadow-md hover:bg-[#112D4E] transition-all cursor-pointer"
              >
                Start New Message
              </button>
            </div>
          ) : (
            <>
              {/* Chat Header */}
          <div className="p-3 px-5 border-b border-[#112D4E]/[.12] flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setShowMobileChat(false)}
                className="p-1.5 text-[#112D4E]/[.72] hover:bg-[#112D4E]/[.04] rounded-full md:hidden cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative shrink-0">
                <img
                  src={selectedThread.participant.avatar}
                  alt={selectedThread.participant.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#112D4E]/[.25]"
                />
                {selectedThread.participant.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#112D4E]/[.04] ring-2 ring-white rounded-full" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-[#112D4E] truncate">
                    {selectedThread.participant.name}
                  </h3>
                  <span className="text-[10px] font-bold text-[#112D4E]/[.55]">
                    @{selectedThread.participant.handle}
                  </span>
                </div>
                <p className="text-[11px] text-[#112D4E] font-bold">
                  {selectedThread.participant.isOnline ? "● Active Now" : selectedThread.participant.lastActive}
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() =>
                  setActiveCall({
                    type: "audio",
                    name: selectedThread.participant.name,
                    avatar: selectedThread.participant.avatar,
                  })
                }
                className="p-2.5 rounded-full hover:bg-[#112D4E]/[.04] text-[#112D4E] transition-colors cursor-pointer"
                title="Audio Call"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setActiveCall({
                    type: "video",
                    name: selectedThread.participant.name,
                    avatar: selectedThread.participant.avatar,
                  })
                }
                className="p-2.5 rounded-full hover:bg-[#112D4E]/[.04] text-[#112D4E] transition-colors cursor-pointer"
                title="Video Call"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                onClick={() => alert(`Participant Profile: ${selectedThread.participant.name} (@${selectedThread.participant.handle})`)}
                className="p-2.5 rounded-full hover:bg-[#112D4E]/[.04] text-[#112D4E] transition-colors cursor-pointer"
                title="Details"
              >
                <Info className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-[#112D4E]/[.55] hover:text-[#112D4E] rounded-full hover:bg-[#112D4E]/[.04] transition-colors cursor-pointer hidden md:block"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 sm:p-5 space-y-4 overflow-y-auto bg-white text-xs scrollbar-thin">
            {/* Timestamp Banner */}
            <div className="text-center my-2">
              <span className="px-3 py-1 rounded-full bg-[#112D4E]/60 text-[#112D4E]/[.72] font-semibold text-[10px]">
                Today • Index Thread #{selectedThread.indexNumber}
              </span>
            </div>

            {selectedThread.messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  {!isMe && (
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-7 h-7 rounded-full object-cover shrink-0 mb-1"
                    />
                  )}

                  <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}>
                    <div
                      onDoubleClick={() => handleToggleReaction(msg.id, "❤️")}
                      className={`p-3.5 rounded-lg relative group transition-all ${
                        isMe
                          ? "bg-[#3F72AF] text-white rounded-br-xs shadow-md"
                          : "bg-white text-[#112D4E] border border-[#112D4E]/[.12] rounded-bl-xs shadow-xs"
                      }`}
                    >
                      <p className="leading-relaxed text-xs">{msg.text}</p>

                      {/* Image Attachment */}
                      {msg.imageUrl && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-[#112D4E]/[.12] max-w-xs">
                          <img src={msg.imageUrl} alt="Shared attachment" className="w-full h-auto object-cover" />
                        </div>
                      )}

                      {/* Code Snippet Attachment */}
                      {msg.codeSnippet && (
                        <div className="mt-2.5 p-3 rounded-xl bg-[#112D4E] text-[#112D4E]/[.55] font-mono text-[11px] overflow-x-auto border border-[#112D4E]/[.12]">
                          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#112D4E]/[.12] text-[10px] text-[#112D4E]/[.55]">
                            <span className="flex items-center gap-1 font-bold text-[#112D4E]">
                              <Code2 className="w-3 h-3" /> {msg.codeSnippet.language}
                            </span>
                            <span>Executable</span>
                          </div>
                          <code>{msg.codeSnippet.code}</code>
                        </div>
                      )}

                      {/* Voice Note Player Attachment */}
                      {msg.isVoiceNote && (
                        <div className="mt-2 flex items-center gap-3 p-2.5 rounded-xl bg-[#112D4E] text-white min-w-[180px]">
                          <button className="p-2 rounded-full bg-[#3F72AF] text-white hover:scale-105 transition-transform cursor-pointer">
                            <Play className="w-3.5 h-3.5 fill-white" />
                          </button>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-1">
                              <span className="w-1 h-3 bg-[#112D4E]/[.15] rounded-full animate-pulse" />
                              <span className="w-1 h-5 bg-[#112D4E]/[.04] rounded-full" />
                              <span className="w-1 h-2 bg-[#112D4E]/[.12] rounded-full" />
                              <span className="w-1 h-4 bg-[#112D4E]/[.15] rounded-full" />
                              <span className="w-1 h-6 bg-[#112D4E]/[.04] rounded-full" />
                              <span className="w-1 h-3 bg-[#112D4E]/[.12] rounded-full" />
                            </div>
                            <span className="text-[10px] text-[#112D4E]/[.55] font-mono">
                              {msg.voiceDuration || "0:12"}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Reactions display */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="absolute -bottom-2 right-2 bg-white ring-1 ring-[#112D4E]/[.25] rounded-full px-1.5 py-0.5 text-[10px] shadow-xs flex items-center gap-0.5">
                          {msg.reactions.map((r, idx) => (
                            <span key={idx}>{r}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 px-1 mt-1 text-[10px] text-[#112D4E]/[.55]">
                      <span>{msg.timestamp}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-[#3F72AF]" />}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Voice Recording Banner Bar */}
          {isRecordingVoice && (
            <div className="px-5 py-2 bg-[#112D4E]/[.04] border-t border-[#112D4E]/[.12] flex items-center justify-between text-xs text-[#112D4E] font-bold animate-pulse">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#112D4E] animate-ping" />
                Recording Voice Note... 0:
                {recordingTimer < 10 ? `0${recordingTimer}` : recordingTimer}
              </span>
              <button
                type="button"
                onClick={() => setIsRecordingVoice(false)}
                className="text-[#112D4E]/[.55] hover:text-[#112D4E] text-[11px] underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Attached Image Preview Bar */}
          {selectedImage && (
            <div className="px-5 py-2 bg-[#112D4E]/[.04] border-t border-[#112D4E]/[.12] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={selectedImage} alt="Attachment preview" className="w-8 h-8 rounded-lg object-cover" />
                <span className="text-xs font-bold text-[#112D4E]">Image attached</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="p-1 text-[#112D4E]/[.55] hover:text-[#112D4E] rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 sm:p-4 border-t border-[#112D4E]/[.12] bg-white space-y-2 shrink-0">
            {showCodeInput && (
              <textarea
                rows={3}
                value={codeSnippetText}
                onChange={(e) => setCodeSnippetText(e.target.value)}
                placeholder="// Attach TypeScript / Python snippet..."
                className="w-full text-xs font-mono p-3 rounded-lg bg-[#112D4E] text-[#112D4E]/[.55] focus:outline-none ring-1 ring-[#112D4E]/[.25]"
              />
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              {/* Left Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCodeInput(!showCodeInput)}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    showCodeInput ? "bg-[#112D4E]/[.04] text-[#3F72AF]" : "text-[#112D4E]/[.55] hover:bg-[#112D4E]/[.04] hover:text-[#112D4E]"
                  }`}
                  title="Attach Code"
                >
                  <Code2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedImage(
                      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80"
                    )
                  }
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    selectedImage ? "bg-[#112D4E]/[.04] text-[#3F72AF]" : "text-[#112D4E]/[.55] hover:bg-[#112D4E]/[.04] hover:text-[#112D4E]"
                  }`}
                  title="Attach Image"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsRecordingVoice(!isRecordingVoice)}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    isRecordingVoice ? "bg-[#112D4E]/[.04] text-[#112D4E] animate-pulse" : "text-[#112D4E]/[.55] hover:bg-[#112D4E]/[.04] hover:text-[#112D4E]"
                  }`}
                  title="Voice Message"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              {/* Input text */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isRecordingVoice ? "Voice note recording..." : "Message..."}
                disabled={isRecordingVoice}
                className="flex-1 bg-[#112D4E]/[.04] text-xs px-4 py-2.5 rounded-full border border-transparent focus:bg-white focus:border-[#112D4E]/[.12] focus:outline-none"
              />

              {/* Send or Heart Quick Action */}
              {inputText.trim() || codeSnippetText.trim() || selectedImage || isRecordingVoice ? (
                <button
                  type="submit"
                  className="p-2.5 rounded-full bg-[#3F72AF] text-white hover:bg-[#112D4E] hover:scale-105 transition-all cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendMessage(undefined, "❤️")}
                  className="p-2 text-[#112D4E] hover:scale-125 transition-transform cursor-pointer"
                  title="Send Quick Heart"
                >
                  <Heart className="w-5 h-5 fill-[#3F72AF]" />
                </button>
              )}
            </form>
          </div>
          </>
          )}
        </div>
      </div>

      {/* Simulated Active Call Overlay */}
      {activeCall && (
        <div className="fixed inset-0 z-60 bg-[#112D4E]/90  flex flex-col items-center justify-between p-8 text-white animate-in fade-in duration-300">
          <div className="text-center space-y-2 mt-8">
            <span className="px-3 py-1 rounded-full bg-[#112D4E]/[.04] text-[#112D4E] border border-[#112D4E]/[.12] text-xs font-mono font-bold animate-pulse">
              ● Connected • {activeCall.type === "video" ? "HD Video Call" : "Audio Call"}
            </span>
            <h2 className="text-2xl font-black">{activeCall.name}</h2>
            <p className="text-xs text-[#112D4E]/[.55]">00:14 • LearnX Encrypted</p>
          </div>

          <div className="relative my-auto">
            <img
              src={activeCall.avatar}
              alt={activeCall.name}
              className="w-32 h-32 rounded-full object-cover ring-8 ring-[#3F72AF]/40 shadow-md animate-pulse"
            />
          </div>

          <div className="flex items-center gap-6 mb-8">
            <button
              onClick={() => setActiveCall(null)}
              className="p-4 rounded-full bg-[#112D4E] hover:bg-[#112D4E] text-white shadow-md transition-all hover:scale-110 cursor-pointer"
            >
              <Phone className="w-6 h-6 rotate-[135deg]" />
            </button>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-60 bg-[#112D4E]/60  flex items-center justify-center p-4">
          <div className="bg-white text-[#112D4E] w-full max-w-md rounded-lg p-5 border border-[#112D4E]/[.12] shadow-md space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#112D4E]/[.12]">
              <h3 className="font-extrabold text-sm text-[#112D4E]">New Message</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1 text-[#112D4E]/[.55] hover:text-[#112D4E] rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#112D4E]/[.55] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={newChatSearch}
                onChange={(e) => setNewChatSearch(e.target.value)}
                placeholder="Search recipient by name or handle..."
                className="w-full bg-[#112D4E]/[.04] text-xs pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#3F72AF]"
              />
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedThreadId(c.id);
                    setShowNewChatModal(false);
                  }}
                  className="p-2.5 rounded-lg hover:bg-[#112D4E]/[.04] flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={c.participant.avatar}
                      alt={c.participant.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-[#112D4E]/[.25]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#112D4E]">{c.participant.name}</p>
                      <p className="text-[11px] text-[#112D4E]/[.55]">@{c.participant.handle}</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#3F72AF] font-bold">Chat →</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

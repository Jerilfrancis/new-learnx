import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  X,
  Send,
  Code2,
  Copy,
  Check,
  Bot,
  User,
  Trash2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { aiApi } from "../../services/api";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  codeSnippet?: string;
  timestamp: string;
}

export const StudyAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [codeContext, setCodeContext] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init_1",
      sender: "ai",
      text: "Hello! I am your **Infinite AI Mentor** powered by **Groq**. Ask me any programming doubt, speak via voice 🎙️, or paste code to debug!",
      timestamp: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Handle Speech-to-Text
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  // Handle Text-to-Speech
  const handleSpeak = (text: string, msgId: string) => {
    if (!window.speechSynthesis) return;

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner speech
    const cleanText = text.replace(/[*_`#]/g, "").replace(/```[\s\S]*?```/g, "Code block omitted.");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() && !codeContext.trim()) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: query.trim(),
      codeSnippet: codeContext.trim() || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const promptToSend = query.trim();
    const codeToSend = codeContext.trim();

    setQuery("");
    setCodeContext("");
    setShowCodeInput(false);
    setIsTyping(true);

    try {
      const res = await aiApi.solveDoubt(promptToSend, codeToSend || undefined);
      const aiReply: Message = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: res.result || "I evaluated your question and here is the recommended approach.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err: any) {
      const errorReply: Message = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: `⚠️ **Error**: ${err.message || "Failed to generate AI response. Please ensure GROQ_API_KEY is configured on the server."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsTyping(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="px-5 py-3 rounded-lg bg-[#3F72AF] hover:bg-[#112D4E] text-white font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2.5 border border-white/20 group"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          </div>
          <span>Ask Infinite AI</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/30  flex items-center gap-1">
            <Mic className="w-2.5 h-2.5 text-[#112D4E]" /> Voice + Groq
          </span>
        </button>
      )}

      {/* AI Chat Window Modal */}
      {isOpen && (
        <div className="w-[90vw] sm:w-[440px] h-[570px] bg-white rounded-lg shadow-md border border-[#112D4E]/[.12] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="p-4 bg-[#112D4E] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#3F72AF] text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black">Infinite AI Voice & Code Mentor</h3>
                <p className="text-[10px] text-[#112D4E]/[.55]">Powered by Groq Llama 3.3 Inference</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: "init_1",
                      sender: "ai",
                      text: "Chat cleared. What can I help you with?",
                      timestamp: "Just now",
                    },
                  ])
                }
                title="Clear Chat"
                className="p-1.5 text-[#112D4E]/[.55] hover:text-white rounded-full hover:bg-[#112D4E] cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  window.speechSynthesis?.cancel();
                  setIsOpen(false);
                }}
                className="p-1.5 text-[#112D4E]/[.55] hover:text-white rounded-full hover:bg-[#112D4E] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#112D4E]/[.04] text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white ${
                    m.sender === "user" ? "bg-[#3F72AF]" : "bg-[#3F72AF]"
                  }`}
                >
                  {m.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[82%] p-3 rounded-lg space-y-2 ${
                    m.sender === "user"
                      ? "bg-[#3F72AF] text-white rounded-tr-xs"
                      : "bg-white text-[#112D4E] border border-[#112D4E]/[.12] rounded-tl-xs shadow-2xs"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <p className="whitespace-pre-wrap leading-relaxed flex-1">{m.text}</p>
                    {m.sender === "ai" && (
                      <button
                        onClick={() => handleSpeak(m.text, m.id)}
                        className={`p-1 rounded-md transition-colors ${
                          speakingId === m.id
                            ? "bg-[#112D4E]/[.04] text-[#112D4E] animate-pulse"
                            : "text-[#112D4E]/[.55] hover:text-[#112D4E]"
                        }`}
                        title={speakingId === m.id ? "Stop Speaking" : "Read Aloud"}
                      >
                        {speakingId === m.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  {m.codeSnippet && (
                    <div className="relative mt-2 p-2.5 rounded-xl bg-[#112D4E] text-[#112D4E] font-mono text-[11px] overflow-x-auto">
                      <button
                        onClick={() => copyToClipboard(m.codeSnippet!, m.id)}
                        className="absolute top-2 right-2 p-1 rounded-md bg-[#112D4E] text-[#112D4E]/[.55] hover:text-white"
                      >
                        {copiedId === m.id ? <Check className="w-3 h-3 text-[#112D4E]" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <pre>{m.codeSnippet}</pre>
                    </div>
                  )}

                  <span
                    className={`text-[9px] block text-right ${
                      m.sender === "user" ? "text-[#112D4E]" : "text-[#112D4E]/[.55]"
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-[#112D4E]/[.55] text-xs pl-9">
                <div className="w-2 h-2 rounded-full bg-[#112D4E]/[.15] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#112D4E]/[.15] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#112D4E]/[.15] animate-bounce [animation-delay:0.4s]" />
                <span>Infinite AI is generating response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Listening Pulsing Banner */}
          {isListening && (
            <div className="px-4 py-2 bg-[#112D4E]/[.04] border-t border-[#112D4E]/[.12] text-[#112D4E] text-xs font-bold flex items-center justify-between animate-pulse">
              <span className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-[#3F72AF] animate-bounce" /> Listening to your microphone... Speak your programming question now!
              </span>
              <button onClick={() => setIsListening(false)} className="text-[#112D4E] hover:underline text-[11px]">
                Stop
              </button>
            </div>
          )}

          {/* Code Input Toggle Drawer */}
          {showCodeInput && (
            <div className="p-3 bg-[#112D4E]/[.04] border-t border-[#112D4E]/[.12] space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-[#112D4E]/[.72]">
                <span>Paste Code Context:</span>
                <button
                  type="button"
                  onClick={() => setShowCodeInput(false)}
                  className="text-[#112D4E]/[.55] hover:text-[#112D4E]"
                >
                  Close Code Box
                </button>
              </div>
              <textarea
                rows={3}
                value={codeContext}
                onChange={(e) => setCodeContext(e.target.value)}
                placeholder="Paste function, bug snippet, or SQL query here..."
                className="w-full text-[11px] font-mono p-2 rounded-xl bg-white border border-[#112D4E]/[.12] focus:outline-none focus:ring-1 focus:ring-[#3F72AF]"
              />
            </div>
          )}

          {/* Prompt Input Form with Mic Button */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#112D4E]/[.12] flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCodeInput(!showCodeInput)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                showCodeInput
                  ? "bg-[#112D4E]/[.04] border-[#112D4E]/[.12] text-[#3F72AF]"
                  : "bg-[#112D4E]/[.04] border-[#112D4E]/[.12] text-[#112D4E]/[.55] hover:bg-[#112D4E]/[.04]"
              }`}
              title="Attach Code Snippet"
            >
              <Code2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isListening
                  ? "bg-[#112D4E] text-white border-[#112D4E]/[.12] shadow-md animate-pulse"
                  : "bg-[#112D4E]/[.04] border-[#112D4E]/[.12] text-[#112D4E]/[.55] hover:bg-[#112D4E]/[.04]"
              }`}
              title={isListening ? "Stop Listening" : "Speak with Voice"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask anything or click mic to speak..."}
              className="flex-1 text-xs p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none focus:ring-2 focus:ring-[#3F72AF]"
            />

            <button
              type="submit"
              disabled={isTyping || (!query.trim() && !codeContext.trim())}
              className="p-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white transition-all cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

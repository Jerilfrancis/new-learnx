import React, { useState } from "react";
import {
  X,
  Code2,
  BarChart2,
  FolderGit2,
  HelpCircle,
  FileText,
  Sparkles,
  Send,
  UploadCloud,
  Paperclip,
} from "lucide-react";
import { Post, PostType, UserProfile } from "../../types";
import { postsApi, uploadApi } from "../../services/api";

interface CreatePostModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  onPostCreated: (post: Post) => void;
}

interface MediaItem {
  mediaType: "image" | "video" | "file";
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  currentUser,
  onClose,
  onPostCreated,
}) => {
  const [postType, setPostType] = useState<PostType>("TEXT");
  const [content, setContent] = useState("");
  const [communityName, setCommunityName] = useState("React & Frontend Masters");

  // Code snippet fields
  const [codeLang, setCodeLang] = useState("typescript");
  const [codeSnippet, setCodeSnippet] = useState("");

  // Poll fields
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["Option 1", "Option 2"]);

  // Project fields
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectTags, setProjectTags] = useState("React, Express, AI");

  // Media Attachment
  const [attachedMedia, setAttachedMedia] = useState<MediaItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (attachedMedia.length + files.length > 10) {
      alert("You can attach a maximum of 10 items.");
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const newMediaItems: MediaItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} exceeds the 10MB size limit.`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await uploadApi.uploadFile(formData);
        
        if (res.success && res.url) {
          let mediaType: "image" | "video" | "file" = "file";
          if (file.type.startsWith("image/")) {
            mediaType = "image";
          } else if (file.type.startsWith("video/")) {
            mediaType = "video";
          }

          newMediaItems.push({
            mediaType,
            url: res.url,
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
            thumbnailUrl: mediaType === "image" ? res.url : undefined
          });
        }
      }

      setAttachedMedia((prev) => [...prev, ...newMediaItems]);
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to upload one or more files.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !codeSnippet && !pollQuestion && !projectTitle && attachedMedia.length === 0) return;

    setIsSubmitting(true);

    try {
      const postPayload: any = {
        author: {
          id: currentUser.id,
          name: currentUser.name,
          handle: currentUser.handle,
          avatar: currentUser.avatar,
          role: currentUser.role,
          verified: true,
        },
        type: postType,
        content: content || "Published a new item on LearnX!",
        media: attachedMedia,
        communityName,
        communityId: "comm_react",
      };

      if (postType === "CODE") {
        postPayload.codeSnippet = {
          language: codeLang,
          code: codeSnippet || "// Your code here",
        };
      } else if (postType === "POLL") {
        postPayload.pollData = {
          question: pollQuestion || "What do you think?",
          totalVotes: 0,
          options: pollOptions.map((opt, idx) => ({
            id: `opt_${idx}`,
            text: opt,
            votes: 0,
          })),
        };
      } else if (postType === "PROJECT") {
        postPayload.projectData = {
          title: projectTitle || "Custom Project Challenge",
          description: projectDesc || "Open for collaborators and reviews.",
          tags: projectTags.split(",").map((t) => t.trim()),
          imageUrl: attachedMedia.find(m => m.mediaType === 'image')?.url || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80",
        };
      }

      const res = await postsApi.create(postPayload);
      if (res.success && res.post) {
        onPostCreated(res.post);
        onClose();
      }
    } catch (err) {
      console.error("Post creation error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#112D4E]/40  flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-lg shadow-md border border-[#112D4E]/[.12] p-6 space-y-5 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#112D4E]/[.12]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#3F72AF] text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#112D4E]">
                Share Knowledge & Build
              </h3>
              <p className="text-xs text-[#112D4E]/[.55]">
                Post to LearnX feed & community
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#112D4E]/[.55] hover:text-[#112D4E]/[.72] rounded-full hover:bg-[#112D4E]/[.04] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Type Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { type: "TEXT", label: "Article / Update", icon: FileText },
            { type: "CODE", label: "Code Snippet", icon: Code2 },
            { type: "POLL", label: "Interactive Poll", icon: BarChart2 },
            { type: "PROJECT", label: "Project Challenge", icon: FolderGit2 },
            { type: "QUESTION", label: "Ask a Doubt", icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = postType === tab.type;
            return (
              <button
                key={tab.type}
                type="button"
                onClick={() => setPostType(tab.type as PostType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#3F72AF] text-white shadow-xs"
                    : "bg-[#112D4E]/[.04] text-[#112D4E]/[.72] hover:bg-[#112D4E]/[.08]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Text Area */}
          <div>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                postType === "QUESTION"
                  ? "Describe your coding doubt or architectural question..."
                  : "What are you learning, building, or discovering today?"
              }
              className="w-full text-sm p-3 rounded-lg bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none focus:border-[#112D4E]/[.12] placeholder:text-[#112D4E]/[.55]"
            />
          </div>

          {/* Conditional Input Fields based on Post Type */}

          {/* CODE */}
          {postType === "CODE" && (
            <div className="space-y-2 bg-[#112D4E] p-3 rounded-lg border border-[#112D4E]/[.12]">
              <div className="flex items-center justify-between text-xs text-[#112D4E]/[.55]">
                <span className="font-semibold">Code Snippet</span>
                <select
                  value={codeLang}
                  onChange={(e) => setCodeLang(e.target.value)}
                  className="bg-[#112D4E] text-[#112D4E]/[.55] text-xs px-2.5 py-1 rounded-lg border border-[#112D4E]/[.12]"
                >
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="html">HTML/CSS</option>
                  <option value="sql">SQL</option>
                </select>
              </div>
              <textarea
                rows={5}
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                placeholder="// Paste code here..."
                className="w-full text-xs font-mono bg-[#112D4E] text-[#112D4E]/[.55] p-3 rounded-xl border border-[#112D4E]/[.12] focus:outline-none"
              />
            </div>
          )}

          {/* POLL */}
          {postType === "POLL" && (
            <div className="space-y-3 p-3 rounded-lg bg-[#112D4E]/50 border border-[#112D4E]/[.12]">
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Poll Question (e.g., Which state management library do you prefer?)"
                className="w-full text-xs font-bold p-2.5 rounded-xl bg-white border border-[#112D4E]/[.12] focus:outline-none"
              />
              <div className="space-y-2">
                {pollOptions.map((opt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const copy = [...pollOptions];
                      copy[idx] = e.target.value;
                      setPollOptions(copy);
                    }}
                    placeholder={`Option ${idx + 1}`}
                    className="w-full text-xs p-2 rounded-lg bg-white border border-[#112D4E]/[.12] focus:outline-none"
                  />
                ))}
              </div>
              {pollOptions.length < 4 && (
                <button
                  type="button"
                  onClick={() => setPollOptions([...pollOptions, `Option ${pollOptions.length + 1}`])}
                  className="text-xs font-bold text-[#3F72AF] hover:underline cursor-pointer"
                >
                  + Add Option
                </button>
              )}
            </div>
          )}

          {/* PROJECT */}
          {postType === "PROJECT" && (
            <div className="space-y-3 p-3 rounded-lg bg-[#112D4E]/50 border border-[#112D4E]/[.12]">
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Project Title (e.g., Real-time AI Code Reviewer)"
                className="w-full text-xs font-bold p-2.5 rounded-xl bg-white border border-[#112D4E]/[.12] focus:outline-none"
              />
              <textarea
                rows={2}
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                placeholder="Brief project description & requirements..."
                className="w-full text-xs p-2.5 rounded-xl bg-white border border-[#112D4E]/[.12] focus:outline-none"
              />
              <input
                type="text"
                value={projectTags}
                onChange={(e) => setProjectTags(e.target.value)}
                placeholder="Tech tags (comma separated, e.g. React, Express, Gemini)"
                className="w-full text-xs p-2 rounded-lg bg-white border border-[#112D4E]/[.12] focus:outline-none"
              />
            </div>
          )}

          {/* Attachment Previews */}
          {attachedMedia.length > 0 && (
            <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-[#112D4E]/[.04] border border-[#112D4E]/[.12]">
              {attachedMedia.map((item, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden aspect-video border border-[#112D4E]/[.12] bg-white flex items-center justify-center">
                  {item.mediaType === "image" ? (
                    <img src={item.url} alt={item.fileName} className="w-full h-full object-cover" />
                  ) : item.mediaType === "video" ? (
                    <video src={item.url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center p-2 text-center">
                      <Paperclip className="w-6 h-6 text-[#112D4E]/[.55] mb-1" />
                      <span className="text-[10px] font-semibold text-[#112D4E]/[.72] truncate max-w-[80px]">{item.fileName}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setAttachedMedia((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 p-1 bg-[#112D4E] text-white rounded-full hover:bg-[#112D4E] transition-colors shadow-md"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Media Attachment Trigger */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] text-xs">
            <label className="flex items-center gap-2 font-bold text-[#112D4E] cursor-pointer hover:text-[#3F72AF] transition-colors">
              <UploadCloud className="w-4 h-4 text-[#3F72AF]" />
              <span>Attach Image / Video / File</span>
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.zip,.doc,.docx,.ppt,.pptx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {isUploading && <span className="text-[#112D4E]/[.55] font-bold animate-pulse">Uploading...</span>}
            {uploadError && <span className="text-[#112D4E] font-bold">{uploadError}</span>}
          </div>

          {/* Footer controls & Submit */}
          <div className="pt-3 border-t border-[#112D4E]/[.12] flex items-center justify-between">
            <select
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              className="text-xs font-semibold bg-[#112D4E]/[.04] text-[#112D4E] px-3 py-1.5 rounded-full border border-[#112D4E]/[.12] focus:outline-none"
            >
              <option value="React & Frontend Masters">React & Frontend Masters</option>
              <option value="AI & Neural Networks Hub">AI & Neural Networks Hub</option>
              <option value="Hackathons & Open Source">Hackathons & Open Source</option>
              <option value="System Design & DSA Warriors">System Design & DSA Warriors</option>
            </select>

            <button
              type="submit"
              disabled={isUploading || isSubmitting}
              className="px-5 py-2 rounded-full text-xs font-bold text-white bg-[#3F72AF] shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

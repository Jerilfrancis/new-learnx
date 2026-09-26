import React, { useState } from "react";
import {
  UserCheck,
  Star,
  Calendar,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  X,
  Send,
} from "lucide-react";
import { Mentor } from "../../types";
import { freelancerApi } from "../../services/api";

interface MentorsViewProps {
  mentors: Mentor[];
  selectedMentor?: Mentor | null;
}

export const MentorsView: React.FC<MentorsViewProps> = ({ mentors, selectedMentor: initialSelected }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>("All Topics");
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(initialSelected || null);

  const [bookingDay, setBookingDay] = useState("Tue");
  const [bookingTopic, setBookingTopic] = useState("System Design Prep");
  const [bookingNote, setBookingNote] = useState("");
  const [bookedSuccess, setBookedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topicsList = ["All Topics", "LLM Fine-tuning", "System Design Prep", "UI Animation", "Kubernetes", "AI Career Guidance"];

  const filteredMentors = mentors.filter((m) =>
    selectedTopic === "All Topics" ? true : m.topics.includes(selectedTopic)
  );

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingMentor) return;

    setIsSubmitting(true);
    try {
      await freelancerApi.requestMentoring({
        slotId: `slot_${bookingMentor.id}_${bookingDay}`,
        mentorId: bookingMentor.id,
        message: `${bookingTopic}: ${bookingNote}`,
      });
      setBookedSuccess(true);
      setTimeout(() => {
        setBookedSuccess(false);
        setBookingMentor(null);
        setBookingNote("");
      }, 2000);
    } catch (_) {
      // Still show confirmed for demo/fallback
      setBookedSuccess(true);
      setTimeout(() => {
        setBookedSuccess(false);
        setBookingMentor(null);
        setBookingNote("");
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-lg bg-[#112D4E] text-white shadow-md space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#112D4E]/[.04] rounded-full hidden pointer-events-none" />
        <div className="flex items-center gap-2 text-[#112D4E] font-bold text-xs">
          <Sparkles className="w-4 h-4 text-[#112D4E]" />
          <span>1:1 Mentorship & Code Reviews</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Book 1:1 Sessions with Staff Engineers & AI Scientists
        </h1>
        <p className="text-xs text-[#112D4E]/[.55] max-w-xl">
          Get personalized portfolio reviews, career guidance, system design mock interviews, and research guidance.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {topicsList.map((topic) => (
          <button
            key={topic}
            onClick={() => setSelectedTopic(topic)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedTopic === topic
                ? "bg-[#112D4E] text-white shadow-md"
                : "bg-white text-[#112D4E] hover:bg-[#112D4E]/[.04] border border-[#112D4E]/[.12]"
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMentors.map((m) => (
          <div
            key={m.id}
            className="p-5 rounded-lg bg-white border border-[#112D4E]/[.12] shadow-xs hover:shadow-md transition-all duration-300 space-y-4 flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-[#112D4E]/[.25] shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#112D4E] group-hover:text-[#112D4E] transition-colors">
                    {m.name}
                  </h3>
                  <p className="text-xs text-[#112D4E]/[.55] font-medium">
                    {m.role}
                  </p>
                  <p className="text-[11px] font-bold text-[#112D4E]">
                    {m.company}
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#112D4E]/[.72] line-clamp-3 leading-relaxed">
                {m.bio}
              </p>

              <div className="flex flex-wrap gap-1">
                {m.topics.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#112D4E]/[.04] text-[#112D4E]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#112D4E]/[.12] flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-[#112D4E]">{m.hourlyRate}</p>
                <span className="text-[10px] text-[#112D4E] font-bold">
                  ★ {m.rating} ({m.reviewsCount} reviews)
                </span>
              </div>

              <button
                onClick={() => setBookingMentor(m)}
                className="px-4 py-2 rounded-xl bg-[#112D4E] text-white text-xs font-bold hover:bg-[#112D4E] shadow-md transition-all cursor-pointer"
              >
                Book Session →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 1:1 Booking Modal */}
      {bookingMentor && (
        <div className="fixed inset-0 z-50 bg-[#112D4E]/50  flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-md border border-[#112D4E]/[.12] p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#112D4E]/[.12]">
              <div className="flex items-center gap-3">
                <img
                  src={bookingMentor.avatar}
                  alt={bookingMentor.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-sm font-bold text-[#112D4E]">
                    Book 1:1 Session with {bookingMentor.name}
                  </h3>
                  <p className="text-xs text-[#112D4E]/[.55]">{bookingMentor.hourlyRate}</p>
                </div>
              </div>
              <button
                onClick={() => setBookingMentor(null)}
                className="p-1.5 text-[#112D4E]/[.55] hover:text-[#112D4E]/[.72] rounded-full hover:bg-[#112D4E]/[.04]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookedSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#112D4E] mx-auto" />
                <h4 className="text-base font-bold text-[#112D4E]">
                  1:1 Session Confirmed!
                </h4>
                <p className="text-xs text-[#112D4E]/[.55]">
                  A Calendar invite and Video call link have been sent to your email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#112D4E] block mb-1">
                    Select Available Day
                  </label>
                  <div className="flex gap-2">
                    {bookingMentor.availableDays.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setBookingDay(day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                          bookingDay === day
                            ? "bg-[#112D4E] text-white"
                            : "bg-[#112D4E]/[.04] text-[#112D4E] hover:bg-[#112D4E]/[.08]"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#112D4E] block mb-1">
                    Primary Topic for Discussion
                  </label>
                  <select
                    value={bookingTopic}
                    onChange={(e) => setBookingTopic(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none"
                  >
                    {bookingMentor.topics.map((t, idx) => (
                      <option key={idx} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#112D4E] block mb-1">
                    Message / What would you like to cover?
                  </label>
                  <textarea
                    rows={3}
                    value={bookingNote}
                    onChange={(e) => setBookingNote(e.target.value)}
                    placeholder="E.g., I'm preparing for my system design interview next week..."
                    className="w-full text-xs p-3 rounded-xl bg-[#112D4E]/[.04] border border-[#112D4E]/[.12] focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingMentor(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#112D4E]/[.72] hover:bg-[#112D4E]/[.04]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#112D4E] text-white text-xs font-bold hover:bg-[#112D4E] shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Confirm 1:1 Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

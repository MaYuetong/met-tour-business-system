"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const TOTAL_STEPS = 5;

const INTERESTS = [
  { id: "architecture", label: "European Architecture & Sculpture" },
  { id: "medieval", label: "Medieval Art" },
  { id: "renaissance", label: "Renaissance (Leonardo, Raphael, Michelangelo)" },
  { id: "baroque", label: "Baroque / Court Art" },
  { id: "neoclassicism", label: "Neoclassicism" },
  { id: "impressionism", label: "Impressionism" },
  { id: "europe-new-world", label: "Europe vs New World" },
];

const KNOWLEDGE_LEVELS = [
  { id: "beginner", label: "Beginner", desc: "New to art history" },
  { id: "some", label: "Some Knowledge", desc: "Visited museums before" },
  { id: "familiar", label: "Familiar", desc: "Read about major movements" },
  { id: "professional", label: "Professional", desc: "Academic or expert background" },
];

const EXPERIENCE_PREFS = [
  { id: "storytelling", label: "Storytelling", desc: "Rich narratives and human drama" },
  { id: "structured", label: "Structured Knowledge", desc: "Clear chronological framework" },
  { id: "academic", label: "Academic Depth", desc: "Detailed art-historical analysis" },
  { id: "photo", label: "Photo-Friendly / Casual", desc: "Relaxed pace with photo stops" },
];

function PreSurveyForm() {
  const params = useSearchParams();
  const bookingId = params.get("bookingId") ?? "";
  const paramName  = params.get("name")  ?? "";
  const paramEmail = params.get("email") ?? "";

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [profileTag, setProfileTag] = useState("");
  const [form, setForm] = useState({
    name: paramName,
    firstVisit: "",
    knowledgeLevel: "",
    interests: [] as string[],
    experiencePreference: "",
    openQuestion: "",
  });

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleInterest = (id: string) =>
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(id) ? f.interests.filter((i) => i !== id) : [...f.interests, id],
    }));

  const canProceed = () => {
    if (step === 2) return !!form.knowledgeLevel;
    if (step === 3) return form.interests.length > 0;
    if (step === 4) return !!form.experiencePreference;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/surveys/pre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, bookingId }),
      });
      const data = await res.json();
      setProfileTag(data.profileTag ?? "");
      setDone(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    const tagLabels: Record<string, string> = {
      academic: "Academic Explorer",
      storytelling: "Story Seeker",
      "photo-type": "Visual Wanderer",
      beginner: "Curious Newcomer",
      "curious-learner": "Curious Learner",
    };

    return (
      <main className="min-h-screen bg-[#F8F5F0] flex items-center justify-center p-6">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-[#A6192E]/10 flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A6192E" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="font-playfair text-3xl text-[#1A1A1A] mb-3">Profile Created</h2>

          {profileTag && (
            <div className="inline-block bg-[#A6192E]/10 border border-[#A6192E]/20 rounded-sm px-6 py-3 mb-6">
              <p className="text-xs text-[#8B7D72] uppercase tracking-widest font-garamond mb-1">Your Tour Profile</p>
              <p className="font-playfair text-[#A6192E] text-xl">{tagLabels[profileTag] ?? profileTag}</p>
            </div>
          )}

          <p className="text-[#8B7D72] font-garamond text-lg leading-relaxed mb-8">
            We've noted your preferences. Your guide will tailor the experience to match your interests.
          </p>
          <div className="w-12 h-px bg-[#C9A84C] mx-auto mb-8" />
          <Link href="/" className="text-xs tracking-widest uppercase text-[#A6192E] font-garamond hover:underline">
            ← Return Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F5F0]">
      {/* Header progress */}
      <div className="border-b border-[#E0D5C8] bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link href="/" className="text-xs text-[#8B7D72] tracking-widest uppercase font-garamond hover:text-[#A6192E] transition-colors">
              ← Back
            </Link>
            <span className="text-xs text-[#8B7D72] font-garamond">Step {step} of {TOTAL_STEPS}</span>
          </div>
          <div className="w-full bg-[#E0D5C8] rounded-full h-1">
            <div className="bg-[#A6192E] h-1 rounded-full transition-all duration-500" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-xs tracking-[0.25em] uppercase text-[#C9A84C] font-garamond mb-2">Pre-Tour Survey</p>
          <h1 className="font-playfair text-3xl md:text-4xl text-[#1A1A1A]">
            {["Welcome to the MET", "Your Art Knowledge", "Your Interests", "Your Ideal Experience", "One Last Question"][step - 1]}
          </h1>
        </div>

        <div key={step} className="step-transition">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <label className="block font-garamond text-sm text-[#8B7D72] uppercase tracking-widest mb-3">Your name (optional)</label>
                <input type="text" value={form.name} onChange={(e) => setField("name", e.target.value)}
                  placeholder="e.g. Sarah Chen"
                  className="w-full bg-white border border-[#E0D5C8] rounded-sm px-5 py-4 font-garamond text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors text-lg" />
              </div>
              <div>
                <p className="font-garamond text-sm text-[#8B7D72] uppercase tracking-widest mb-5">Is this your first time at the MET?</p>
                <div className="grid grid-cols-2 gap-4">
                  {[{ id: "yes", label: "Yes, first visit" }, { id: "no", label: "I've been before" }].map((opt) => (
                    <button key={opt.id} onClick={() => setField("firstVisit", opt.id)}
                      className={`py-5 px-6 border rounded-sm font-playfair text-base transition-all duration-200 ${form.firstVisit === opt.id ? "border-[#A6192E] bg-[#A6192E] text-white" : "border-[#E0D5C8] bg-white text-[#1A1A1A] hover:border-[#A6192E]"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-[#8B7D72] font-garamond mb-6 leading-relaxed">There are no wrong answers. This helps calibrate the depth of the tour.</p>
              {KNOWLEDGE_LEVELS.map((opt) => (
                <button key={opt.id} onClick={() => setField("knowledgeLevel", opt.id)}
                  className={`w-full text-left border rounded-sm p-6 transition-all duration-200 ${form.knowledgeLevel === opt.id ? "border-[#A6192E] bg-white shadow-sm" : "border-[#E0D5C8] bg-white hover:border-[#A6192E]/50"}`}>
                  <div className="flex items-center gap-4">
                    <input type="radio" className="met-radio" readOnly checked={form.knowledgeLevel === opt.id} />
                    <div>
                      <div className="font-playfair text-[#1A1A1A]">{opt.label}</div>
                      <div className="text-sm text-[#8B7D72] font-garamond mt-0.5">{opt.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <p className="text-[#8B7D72] font-garamond mb-6 leading-relaxed">Select all that interest you. Your guide will emphasize these areas.</p>
              <div className="space-y-3">
                {INTERESTS.map((opt) => (
                  <button key={opt.id} onClick={() => toggleInterest(opt.id)}
                    className={`w-full text-left border rounded-sm p-5 transition-all duration-200 ${form.interests.includes(opt.id) ? "border-[#A6192E] bg-white shadow-sm" : "border-[#E0D5C8] bg-white hover:border-[#A6192E]/50"}`}>
                    <div className="flex items-center gap-4">
                      <input type="checkbox" className="met-checkbox" readOnly checked={form.interests.includes(opt.id)} />
                      <span className="font-garamond text-[#1A1A1A]">{opt.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-[#8B7D72] font-garamond mb-6 leading-relaxed">How would you most like to experience the art?</p>
              {EXPERIENCE_PREFS.map((opt) => (
                <button key={opt.id} onClick={() => setField("experiencePreference", opt.id)}
                  className={`w-full text-left border rounded-sm p-6 transition-all duration-200 ${form.experiencePreference === opt.id ? "border-[#A6192E] bg-white shadow-sm" : "border-[#E0D5C8] bg-white hover:border-[#A6192E]/50"}`}>
                  <div className="flex items-center gap-4">
                    <input type="radio" className="met-radio" readOnly checked={form.experiencePreference === opt.id} />
                    <div>
                      <div className="font-playfair text-[#1A1A1A]">{opt.label}</div>
                      <div className="text-sm text-[#8B7D72] font-garamond mt-0.5">{opt.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 5 */}
          {step === 5 && (
            <div>
              <p className="text-[#8B7D72] font-garamond mb-6 leading-relaxed text-lg">
                What are you most hoping to see or understand today?
              </p>
              <textarea value={form.openQuestion} onChange={(e) => setField("openQuestion", e.target.value)}
                placeholder="A specific artwork, a personal connection to art, a period of history..."
                rows={6}
                className="w-full bg-white border border-[#E0D5C8] rounded-sm px-5 py-4 font-garamond text-[#1A1A1A] placeholder:text-[#C8BDB5] focus:outline-none focus:border-[#A6192E] transition-colors resize-none leading-relaxed" />
              <p className="text-xs text-[#8B7D72] font-garamond mt-3">Optional — but deeply appreciated.</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-[#E0D5C8]">
          {step > 1 ? (
            <button onClick={() => setStep((s) => s - 1)} className="text-sm font-garamond text-[#8B7D72] tracking-widest uppercase hover:text-[#1A1A1A] transition-colors">
              ← Previous
            </button>
          ) : <div />}

          {step < TOTAL_STEPS ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}
              className={`px-10 py-4 font-garamond text-sm tracking-widest uppercase transition-all duration-200 rounded-sm ${canProceed() ? "bg-[#A6192E] text-white hover:bg-[#8B1525]" : "bg-[#E0D5C8] text-[#8B7D72] cursor-not-allowed"}`}>
              Continue →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="px-10 py-4 bg-[#A6192E] text-white font-garamond text-sm tracking-widest uppercase hover:bg-[#8B1525] transition-colors rounded-sm disabled:opacity-60">
              {submitting ? "Saving..." : "Submit Survey"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default function PreSurveyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center"><div className="text-[#8B7D72] font-garamond">Loading...</div></div>}>
      <PreSurveyForm />
    </Suspense>
  );
}
